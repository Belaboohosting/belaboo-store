import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const geminiKey = process.env.GEMINI_API_KEY || "";
const genAI = geminiKey ? new GoogleGenerativeAI(geminiKey) : null;

export async function POST(req: Request) {
    try {
        if (!genAI) {
            return NextResponse.json({ error: "Gemini API is not configured" }, { status: 500 });
        }

        const { prompt, style, colorPalette, transactionId, generationId } = await req.json();

        if (!prompt || !transactionId) {
            return NextResponse.json({ error: "Prompt and Transaction ID are required" }, { status: 400 });
        }

        if (!supabaseAdmin) {
            return NextResponse.json({ error: "Server Configuration Error: Database not connected" }, { status: 500 });
        }

        // --- RATE LIMITING ---
        // Limit to 5 generations per hour per transactionId
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        const { count: recentCount, error: countError } = await supabaseAdmin
            .from("sticker_generations")
            .select("*", { count: "exact", head: true })
            .eq("transaction_id", transactionId)
            .gt("created_at", oneHourAgo);

        if (countError) {
            console.error("Rate limit check error:", countError);
        } else if (recentCount && recentCount >= 20) { // Allowing 5 attempts * 4 stickers = 20 total records
            return NextResponse.json({
                error: "You've reached your hourly generation limit. Please wait or proceed to checkout!"
            }, { status: 429 });
        }
        // ---------------------

        // Model: Gemini 2.5 Flash Image for native generation
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });

        // Construct the NEW Professional Master Prompt
        const masterPrompt = `
Task: Create ONE, DISTINCT STICKER DESIGN for: ${prompt}
Each sticker must be generated as its own independent image. Do not combine multiple stickers into one image.

CRITICAL CONTENT RULE: The main subject of the sticker MUST be exactly as requested: ${prompt}. Do not replace the subject with anything else.

Art Style
Style: ${style || "Cartoon"}
High contrast, clean lines, bold readable shapes. Professional vector illustration.

Critical Technical Requirements
Sticker structure from inside to outside:
1. Main artwork: ${prompt}
2. Silhouette-traced thick white die-cut border. The border MUST follow the exact outer shape and contour of the artwork (silhouette) with uniform thickness.
3. Thin black outline around the outside edge of the white border to act as a cut guide.

Background and isolation:
- Use a SOLID WHITE background (#FFFFFF).
- DO NOT draw checkerboards, gray/white grids, or any "transparency" representations.
- DO NOT use simple geometric shapes like circles, ovals, or squares as the background or border container.
- The area outside the black cut outline must be PURE SOLID WHITE.
- The sticker must be fully isolated on this white background.

Image constraints:
- Generate exactly one sticker per image, centered.
- No duplicate objects, no overlapping elements.
- No shadows, no glow, no gradients.
- Flat 2D vector-style illustration.
- Crisp sharp edges suitable for high-quality printing and die cutting.

Think like professional sticker artwork prepared for Cricut Print-Then-Cut.
        `;

        let imageUrls: string[] = [];

        const generateAndSaveSticker = async (index: number) => {
            try {
                const variantPrompt = `${masterPrompt}\nOutput rule: This is variation #${index + 1}. Ensure it is visually distinct from any previous variations of ${prompt}.`;

                const result = await model.generateContent({
                    contents: [{ role: 'user', parts: [{ text: variantPrompt }] }],
                    // @ts-ignore
                    generationConfig: { responseModalities: ["image"] }
                });

                const part = result.response.candidates?.[0]?.content?.parts?.find(
                    (p: any) => p.inlineData?.mimeType?.startsWith("image/")
                );

                if (part?.inlineData?.data && supabaseAdmin) {
                    const buffer = Buffer.from(part.inlineData.data, "base64");

                    // Create a safe slug from the prompt (first 20 chars)
                    const promptSlug = prompt.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 20);

                    // Transparent naming: stickers/TX_ID/GEN_ID/butterfly_img_1.png
                    const fileName = `stickers/${transactionId}/${generationId || 'latest'}/${promptSlug}_img_${index + 1}.png`;

                    // Upload to Supabase Storage
                    const { error: uploadError } = await supabaseAdmin.storage
                        .from("generated-stickers")
                        .upload(fileName, buffer, {
                            contentType: "image/png",
                            upsert: true
                        });

                    if (!uploadError) {
                        const { data: { publicUrl } } = supabaseAdmin.storage
                            .from("generated-stickers")
                            .getPublicUrl(fileName);

                        // Save to database tracking table
                        const { error: dbError } = await supabaseAdmin.from("sticker_generations").insert({
                            transaction_id: transactionId,
                            image_index: index + 1,
                            image_path: fileName,
                            image_url: publicUrl,
                            prompt: prompt,
                            style: style,
                            vibe: colorPalette
                        });

                        if (dbError) {
                            console.error(`DB Error variation #${index + 1}:`, dbError);
                        }

                        return publicUrl;
                    } else {
                        console.error(`Storage Upload Error variation #${index + 1}:`, uploadError);
                    }
                } else {
                    console.warn(`No image data returned from Gemini for variation #${index + 1}`);
                }
            } catch (err) {
                console.error(`Generation variation #${index + 1} failed:`, err);
            }
            return null;
        };

        // Run generations in parallel for speed
        // We use Promise.all to fire off both requests at once
        const results = await Promise.all([
            generateAndSaveSticker(0),
            generateAndSaveSticker(1)
        ]);

        // Filter out any nulls (failed generations)
        imageUrls = results.filter((url): url is string => url !== null);

        // Fallback for demo/testing if API fails
        if (imageUrls.length === 0) {
            return NextResponse.json({
                error: "Generation failed",
                images: [
                    `https://placehold.co/1024x1024/000080/FF69B4?text=${encodeURIComponent(prompt)}+Var+1`,
                    `https://placehold.co/1024x1024/000080/4CBB17?text=${encodeURIComponent(prompt)}+Var+2`,
                ]
            });
        }

        return NextResponse.json({ images: imageUrls });

    } catch (error: any) {
        console.error("Critical generation error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
