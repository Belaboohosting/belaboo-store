"use client";

import { X, Check } from "lucide-react";

import { STICKER_PRICES, STICKER_SIZES, formatPrice } from "@/lib/pricing";

const SIZES = [
    { id: "small", name: STICKER_SIZES.small.label, price: formatPrice(STICKER_PRICES.small), value: STICKER_PRICES.small },
    { id: "regular", name: STICKER_SIZES.regular.label, price: formatPrice(STICKER_PRICES.regular), value: STICKER_PRICES.regular },
    { id: "large", name: STICKER_SIZES.large.label, price: formatPrice(STICKER_PRICES.large), value: STICKER_PRICES.large },
];

interface SelectionModalProps {
    image: string;
    onClose: () => void;
    onAddToCart: (size: string, price: number) => void;
}

export default function SelectionModal({ image, onClose, onAddToCart }: SelectionModalProps) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-4 bg-navy/80 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex flex-col md:flex-row max-h-[90vh] overflow-y-auto md:overflow-y-visible">
                    {/* Image Preview */}
                    <div className="md:w-1/2 p-6 md:p-8 bg-white flex items-center justify-center border-b-2 md:border-b-0 md:border-r-2 border-navy/5 relative">
                        <button
                            onClick={onClose}
                            className="md:hidden absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg text-navy hover:text-pink transition-colors z-10"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <div className="relative group">
                            <div className="absolute inset-0 bg-pink/10 rounded-xl blur-xl group-hover:blur-2xl transition-all" />
                            <img src={image} alt="Generated Sticker" className="relative w-48 h-48 md:w-64 md:h-64 object-contain drop-shadow-xl" />
                        </div>
                    </div>

                    {/* Configuration */}
                    <div className="md:w-1/2 p-6 md:p-8 pt-4 md:pt-6">
                        <div className="flex justify-between items-start mb-4 md:mb-6">
                            <h2 className="text-2xl md:text-3xl font-black text-navy">Select Size</h2>
                            <button onClick={onClose} className="hidden md:block p-1 hover:text-pink transition-colors">
                                <X className="w-8 h-8" />
                            </button>
                        </div>

                        <p className="text-navy/50 font-bold text-sm mb-4 uppercase tracking-widest">Pricing (Pack of 4)</p>

                        <div className="space-y-3 mb-8">
                            {SIZES.map((size) => (
                                <button
                                    key={size.id}
                                    onClick={() => onAddToCart(size.id, size.value)}
                                    className="w-full text-left p-4 rounded-xl border-2 border-navy/10 hover:border-pink hover:bg-pink/5 transition-all group flex justify-between items-center"
                                >
                                    <div>
                                        <span className="block font-bold text-navy group-hover:text-pink">{size.name}</span>
                                        <span className="text-sm font-medium text-navy/40">Pack of 4 Stickers</span>
                                    </div>
                                    <span className="text-lg font-black text-navy">{size.price}</span>
                                </button>
                            ))}
                        </div>

                        <button
                            className="w-full btn-pill bg-navy text-white border-navy flex items-center justify-center gap-2 hover:bg-pink hover:border-pink group"
                            onClick={() => onAddToCart("regular", 8.99)}
                        >
                            Select Regular Pack <Check className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </button>

                        <p className="text-center text-[10px] text-navy/30 mt-4 font-bold uppercase tracking-wider">
                            High-quality vinyl, waterproof & tear-resistant
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
