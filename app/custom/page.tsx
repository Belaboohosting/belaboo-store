import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CartDrawer from "@/components/CartDrawer";

export default function CustomPage() {
    return (
        <main className="min-h-screen bg-white">
            <Header />
            <Hero initialShowCustomizer={true} />
            <CartDrawer />

            {/* Footer */}
            <footer className="py-12 border-t-2 border-navy/10">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-navy font-bold opacity-50 text-sm">
                        © 2026 Belaboo Stickers. All rights reserved.
                    </p>
                </div>
            </footer>
        </main>
    );
}
