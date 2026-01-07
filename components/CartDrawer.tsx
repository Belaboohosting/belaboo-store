"use client";

import { useCart } from "@/context/CartContext";
import { X, Trash2, ShoppingBag } from "lucide-react";

export default function CartDrawer() {
    const { cart, removeFromCart, total, isOpen, setIsOpen } = useCart();

    if (!isOpen) return null;

    const handleCheckout = async () => {
        try {
            const transactionId = localStorage.getItem("belaboo_tx_id");
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items: cart,
                    email: "customer@example.com",
                    transactionId
                }),
            });
            const data = await res.json();
            if (data.url) window.location.href = data.url;
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex justify-end">
            <div className="absolute inset-0 bg-navy/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
            <div className="relative w-full md:max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                <div className="p-4 md:p-6 border-b-2 border-navy/5 flex justify-between items-center">
                    <h2 className="text-xl md:text-2xl font-black text-navy flex items-center gap-2">
                        <ShoppingBag className="w-6 h-6 text-pink" /> Your Bag
                    </h2>
                    <button onClick={() => setIsOpen(false)} className="p-2 hover:text-pink transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {cart.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-navy/30 font-bold italic text-lg mb-4 text-[Outfit]">Your bag is empty!</p>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-pink font-bold underline"
                            >
                                Go find some vibes
                            </button>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div key={item.id} className="flex gap-4 items-center">
                                <div className="w-20 h-20 bg-navy/5 rounded-xl flex-shrink-0 p-2">
                                    <img src={item.image_url} alt="Sticker" className="w-full h-full object-contain" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-navy capitalize">{item.size} Pack (4x Stickers)</h4>
                                    <p className="text-sm font-medium text-navy/50">{item.type} design</p>
                                    <p className="text-pink font-black">{item.qty} x £{item.price}</p>
                                </div>
                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="p-2 text-navy/20 hover:text-pink transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-6 bg-navy/5 border-t-2 border-navy/5 space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="font-bold text-navy/50">Subtotal</span>
                        <span className="text-2xl font-black text-navy">£{total.toFixed(2)}</span>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-white/50 rounded-xl">
                        <input type="checkbox" id="terms" className="mt-1 accent-pink w-4 h-4" />
                        <label htmlFor="terms" className="text-xs font-bold text-navy/60 leading-tight cursor-pointer">
                            I agree to the Terms & Conditions and understand all stickers are sold in packs of 4.
                        </label>
                    </div>

                    <button
                        disabled={cart.length === 0}
                        onClick={handleCheckout}
                        className="w-full btn-pill bg-pink text-white border-pink text-lg disabled:opacity-50"
                    >
                        Checkout with Stripe
                    </button>

                    <div className="flex items-center gap-2 justify-center text-[10px] font-bold text-navy/30 uppercase tracking-widest">
                        <span className="w-1 h-1 bg-green rounded-full" />
                        Secure payment powered by Stripe
                    </div>
                </div>
            </div>
        </div>
    );
}
