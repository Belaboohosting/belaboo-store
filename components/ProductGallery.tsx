"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import SelectionModal from "./SelectionModal";

interface Product {
    id: string;
    name: string;
    image_url: string;
    price: number;
}

import { supabase } from "@/lib/supabaseClient";

export default function ProductGallery() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const { addToCart } = useCart();

    useEffect(() => {
        async function fetchProducts() {
            // Fallback mock data
            const mockProducts: Product[] = [
                { id: "1", name: "Preppy Bow", image_url: "https://placehold.co/400x400/000080/FFFFFF?text=Bow", price: 4.99 },
                { id: "2", name: "Tennis Star", image_url: "https://placehold.co/400x400/000080/FFFFFF?text=Tennis", price: 4.99 },
                { id: "3", name: "Stay Golden", image_url: "https://placehold.co/400x400/000080/FFFFFF?text=Golden", price: 4.99 },
                { id: "4", name: "Pink Daisy", image_url: "https://placehold.co/400x400/000080/FFFFFF?text=Daisy", price: 4.99 },
            ];

            if (!supabase) {
                console.warn("Supabase is not configured, falling back to mock data.");
                setProducts(mockProducts);
                setLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from("products")
                    .select("*")
                    .eq("is_active", true);

                if (error) throw error;
                setProducts(data && data.length > 0 ? data : mockProducts);
            } catch (err) {
                console.error("Error fetching products, falling back to mocks:", err);
                setProducts(mockProducts);
            } finally {
                setLoading(false);
            }
        }

        fetchProducts();
    }, []);

    return (
        <section className="py-20 bg-navy/5">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl md:text-4xl font-black text-navy mb-8 md:mb-12">Shop the Vibes</h2>

                {loading ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="card-preppy animate-pulse p-4 h-64 bg-navy/5" />
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-navy/50 font-bold italic">No stickers found... chill, we're adding more soon!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                        {products.map((product) => (
                            <div
                                key={product.id}
                                className="card-preppy group cursor-pointer hover:border-pink transition-all p-3 md:p-4"
                                onClick={() => setSelectedProduct(product)}
                            >
                                <div className="aspect-square bg-white rounded-xl overflow-hidden mb-3 md:mb-4 p-2 md:p-4">
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                                    />
                                </div>
                                <h3 className="font-bold text-navy text-lg">{product.name}</h3>
                                <p className="text-pink font-black">From £4.99</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedProduct && (
                <SelectionModal
                    image={selectedProduct.image_url}
                    onClose={() => setSelectedProduct(null)}
                    onAddToCart={(size, price) => {
                        addToCart({
                            type: "premade",
                            image_url: selectedProduct.image_url,
                            size: size as any,
                            qty: 1, // Sold in packs of 4
                            price: price
                        });
                        setSelectedProduct(null);
                    }}
                />
            )}
        </section>
    );
}
