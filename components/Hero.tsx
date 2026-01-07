"use client";

import { useState, useEffect } from "react";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";
import SelectionModal from "./SelectionModal";
import Customizer from "./Customizer";
import { useCart } from "@/context/CartContext";

interface HeroProps {
    initialShowCustomizer?: boolean;
}

export default function Hero({ initialShowCustomizer = false }: HeroProps) {
    const [prompt, setPrompt] = useState("");
    const [style, setStyle] = useState("cartoon");
    const [colorPalette, setColorPalette] = useState("preppy");
    const [isGenerating, setIsGenerating] = useState(false);
    const [results, setResults] = useState<string[]>([]);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [showCustomizer, setShowCustomizer] = useState(initialShowCustomizer);
    const [transactionId, setTransactionId] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [cooldown, setCooldown] = useState(0);
    const { addToCart } = useCart();

    // Generate a unique transaction ID for the session
    useEffect(() => {
        if (typeof window !== "undefined") {
            const existingId = localStorage.getItem("belaboo_tx_id");
            if (existingId) {
                setTransactionId(existingId);
            } else {
                const newId = crypto.randomUUID();
                localStorage.setItem("belaboo_tx_id", newId);
                setTransactionId(newId);
            }
        }
    }, []);

    // Cooldown timer logic
    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    const handleGenerate = async () => {
        if (!prompt) return;
        setIsGenerating(true);
        setError(null);
        setResults([]);
        setShowCustomizer(false);

        const generationId = crypto.randomUUID();

        try {
            const res = await fetch("/api/generate", {
                method: "POST",
                body: JSON.stringify({
                    prompt,
                    style,
                    colorPalette,
                    transactionId,
                    generationId
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Ouch! Something went wrong.");
                return;
            }

            setResults(data.images || []);
            setCooldown(30); // 30-second cooldown after success
        } catch (error) {
            console.error(error);
            setError("Connection failed. Check your vibes and try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <section className="pt-24 pb-12 md:pt-32 md:pb-20 px-4 bg-white min-h-[70vh] flex flex-col justify-center">
            <div className="container mx-auto max-w-4xl text-center">
                <h1 className="text-5xl md:text-8xl font-black text-navy mb-4 md:mb-6 tracking-tight leading-tight">
                    Dream it. <br />
                    <span className="text-pink italic drop-shadow-sm">Stick it.</span>
                </h1>

                <p className="text-lg md:text-xl text-navy/70 mb-8 md:mb-12 max-w-2xl mx-auto font-medium px-4">
                    Create custom, preppy stickers with AI in seconds.
                    Perfect for laptops, water bottles, and your vibe.
                </p>

                <div className="card-preppy p-2 md:p-3 max-w-3xl mx-auto flex flex-col md:flex-row gap-3 items-center bg-white mb-6">
                    <div className="flex-1 w-full px-2 md:px-4 py-2">
                        <input
                            type="text"
                            placeholder="e.g. A cute pink golden retriever"
                            className="w-full bg-transparent border-none focus:ring-0 text-navy font-medium placeholder:text-navy/30 text-base md:text-lg"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            disabled={isGenerating}
                            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                        />
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || cooldown > 0 || !prompt}
                        className="btn-pill bg-pink text-white border-pink flex items-center justify-center gap-2 w-full md:w-auto py-4 md:py-3 disabled:opacity-50"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" /> Generating...
                            </>
                        ) : cooldown > 0 ? (
                            <>Wait {cooldown}s</>
                        ) : (
                            <>
                                Create Magic <Sparkles className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-pink/10 border-2 border-pink/20 rounded-2xl text-pink font-bold animate-in fade-in slide-in-from-top-4 duration-300 mx-auto max-w-2xl">
                        {error}
                    </div>
                )}

                <button
                    onClick={() => setShowCustomizer(!showCustomizer)}
                    className="text-navy/50 font-bold text-sm hover:text-pink transition-colors mb-12 flex items-center justify-center gap-2 mx-auto"
                >
                    {showCustomizer ? "Hide Options" : "More Custom Options"}
                </button>

                {showCustomizer && (
                    <div className="max-w-3xl mx-auto mb-12 text-left bg-navy/5 p-6 md:p-8 rounded-[2.5rem] border-2 border-navy/5">
                        <Customizer
                            onSelectStyle={setStyle}
                            onSelectPalette={setColorPalette}
                        />
                    </div>
                )}

                {/* Results Generation Grid */}
                {results.length > 0 && (
                    <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h3 className="text-2xl font-black text-navy mb-8 flex items-center justify-center gap-2">
                            <Sparkles className="text-pink" /> Pick your favorite!
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                            {results.map((img, i) => (
                                <div
                                    key={i}
                                    className="card-preppy p-2 group cursor-pointer hover:border-pink transition-all"
                                    onClick={() => setSelectedImage(img)}
                                >
                                    <div className="aspect-square bg-white rounded-xl overflow-hidden flex items-center justify-center p-4">
                                        <img src={img} alt="Generated" className="w-full h-full object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Loading Animation Placeholder */}
                {isGenerating && (
                    <div className="mt-12 flex flex-col items-center gap-6 animate-pulse">
                        <div className="flex gap-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className={`w-12 h-12 rounded-2xl bg-pink/20 animate-bounce delay-${i * 100}`} style={{ animationDelay: `${i * 0.1}s` }} />
                            ))}
                        </div>
                        <p className="text-navy font-bold text-lg">Mixing style and stickers...</p>
                    </div>
                )}

                {!isGenerating && results.length === 0 && (
                    <div className="mt-8 flex flex-wrap justify-center gap-4">
                        <span className="text-sm font-bold text-navy/50">TRY THESE:</span>
                        {["Pink Bow", "Tennis Racket", "Coastal Grandma", "Retro Daisy"].map((tag) => (
                            <button
                                key={tag}
                                onClick={() => setPrompt(tag)}
                                className="text-sm font-bold text-navy hover:text-pink transition-colors"
                            >
                                #{tag}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {selectedImage && (
                <SelectionModal
                    image={selectedImage}
                    onClose={() => setSelectedImage(null)}
                    onAddToCart={(size, price) => {
                        addToCart({
                            type: "custom",
                            image_url: selectedImage!,
                            size: size as any,
                            qty: 1,
                            price: price,
                            name: prompt
                        });
                        setSelectedImage(null);
                    }}
                />
            )}
        </section>
    );
}
