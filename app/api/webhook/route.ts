import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { generateStickerPDF } from "@/lib/pdfGenerator";

const stripeSecret = process.env.STRIPE_SECRET_KEY || "";
const stripe = stripeSecret ? new Stripe(stripeSecret, {
    apiVersion: "2025-01-27.acacia" as any,
}) : null;

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(req: Request) {
    const body = await req.text();
    const headerList = await headers();
    const signature = headerList.get("stripe-signature")!;

    let eventBytes: Stripe.Event;

    try {
        console.log("Using secret prefix:", webhookSecret.slice(0, 10));
        eventBytes = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        console.log("✅ Event constructed:", eventBytes.type);
    } catch (err: any) {
        console.error(`❌ Webhook signature verification failed: ${err.message}`);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Handle the event
    if (eventBytes.type === "checkout.session.completed") {
        const session = eventBytes.data.object as Stripe.Checkout.Session;

        // Extract metadata and session info
        console.log("📦 Incoming Session Metadata:", JSON.stringify(session.metadata, null, 2));
        const cartItems = JSON.parse(session.metadata?.cart_items || "[]");
        console.log(`📦 Parsed Cart Items Count: ${cartItems.length}`);
        const customerEmail = session.customer_details?.email || session.customer_email || "unknown@example.com";
        const totalAmount = (session.amount_total || 0) / 100; // Stripe uses pence

        try {
            // Record the order in Supabase
            const { data: orderData, error: orderError } = await supabaseAdmin.from("orders").insert({
                customer_email: customerEmail,
                total_amount: totalAmount,
                stripe_session_id: session.id,
                status: "paid",
                cart_items: cartItems,
                shipping_address: session.shipping_details || {},
            }).select("order_id").single();

            if (orderError) throw orderError;

            // Update the sticker generations tracking
            const transactionId = session.metadata?.transaction_id;
            if (transactionId && transactionId !== "none") {
                // Mark all items in the cart that match this transaction as purchased
                // We map through the cart to get the specific image URLs that were bought
                const purchasedUrls = cartItems.map((item: any) => item.image_url);

                await supabaseAdmin
                    .from("sticker_generations")
                    .update({
                        is_purchased: true,
                        is_selected: true,
                        order_id: orderData.order_id
                    })
                    .eq("transaction_id", transactionId)
                    .in("image_url", purchasedUrls);
            }

            console.log(`✅ Order recorded for ${customerEmail}`);

            // NEW: Generate and store print-ready PDFs for fulfillment
            const today = new Date().toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                timeZone: "Europe/London"
            }).replace(/\//g, "-"); // 07-01-2026

            for (let i = 0; i < cartItems.length; i++) {
                const item = cartItems[i];
                try {
                    // Generate PDF Buffer
                    const pdfBuffer = await generateStickerPDF([{
                        url: item.image_url,
                        size: item.size || "regular",
                        qty: 4
                    }]);

                    // Naming: print-ready/DD-MM-YYYY/Order_ID_SIZE_NAME.pdf
                    const cleanName = (item.name || "sticker").toLowerCase().replace(/[^a-z0-9]/g, "-");
                    const pdfPath = `print-ready/${today}/Order_${orderData.order_id}_${item.size}_${cleanName}.pdf`;

                    // Upload to 'generated-stickers' bucket (or a new 'print-prepared' if you prefer, 
                    // keeping it in 'generated-stickers' for now but in its own path)
                    const { error: uploadError } = await supabaseAdmin.storage
                        .from("generated-stickers")
                        .upload(pdfPath, pdfBuffer, {
                            contentType: "application/pdf",
                            upsert: true
                        });

                    if (uploadError) {
                        console.error(`PDF Upload error for order ${orderData.order_id}:`, uploadError);
                    }
                } catch (pdfErr) {
                    console.error(`PDF Generation failed for item ${i} in order ${orderData.order_id}:`, pdfErr);
                }
            }
        } catch (supabaseError) {
            console.error("Error saving order to Supabase:", supabaseError);
            return NextResponse.json({ error: "Failed to record order" }, { status: 500 });
        }
    }

    return NextResponse.json({ received: true });
}
