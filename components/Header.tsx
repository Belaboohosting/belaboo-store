"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function Header() {
    const { cart, setIsOpen } = useCart();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b-2 border-navy">
            <div className="container mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-1 text-navy hover:text-pink transition-colors"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>

                    <Link href="/" className="text-2xl md:text-3xl font-bold text-navy tracking-tight font-outfit">
                        Bela<span className="text-pink">Boo</span>
                    </Link>
                </div>

                <nav className="hidden md:flex items-center space-x-8">
                    <Link href="/" className="font-bold hover:text-pink transition-colors">Home</Link>
                    <Link href="/gallery" className="font-bold hover:text-pink transition-colors">Gallery</Link>
                    <Link href="/custom" className="font-bold hover:text-pink transition-colors">Custom</Link>
                </nav>

                <button
                    onClick={() => setIsOpen(true)}
                    className="relative p-2 text-navy hover:text-pink transition-colors"
                >
                    <ShoppingCart className="w-6 h-6" />
                    {cart.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-pink text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white animate-in zoom-in">
                            {cart.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-white border-b-2 border-navy animate-in slide-in-from-top duration-300">
                    <nav className="flex flex-col p-4 space-y-4 font-bold text-lg">
                        <Link href="/" onClick={() => setMobileMenuOpen(false)} className="hover:text-pink transition-colors">Home</Link>
                        <Link href="/gallery" onClick={() => setMobileMenuOpen(false)} className="hover:text-pink transition-colors">Gallery</Link>
                        <Link href="/custom" onClick={() => setMobileMenuOpen(false)} className="hover:text-pink transition-colors">Custom</Link>
                    </nav>
                </div>
            )}
        </header>
    );
}
