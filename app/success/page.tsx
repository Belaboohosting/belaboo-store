"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ArrowRight, PartyPopper } from "lucide-react";

export default function SuccessPage() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get("session_id");
    const [orderId, setOrderId] = useState<string | null>(null);

    useEffect(() => {
        // In a real app, we'd fetch the order details via the session_id
        setOrderId(sessionId?.slice(-8).toUpperCase() || "BBO-7721");
    }, [sessionId]);

    return (
        <main className="min-h-screen bg-white flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                <div className="relative mb-8 flex justify-center">
                    <PartyPopper className="w-16 h-16 text-pink absolute -top-8 -left-8 animate-bounce" />
                    <CheckCircle className="w-24 h-24 text-green" />
                    <PartyPopper className="w-16 h-16 text-green absolute -bottom-8 -right-8 animate-bounce delay-150" />
                </div>

                <h1 className="text-5xl font-black text-navy mb-4 tracking-tight">Vibes Secured!</h1>
                <p className="text-xl text-navy/60 mb-8 font-medium">
                    Your order is being printed and prepped. Get ready for some major style points.
                </p>

                <div className="card-preppy bg-navy/5 border-none p-6 mb-8">
                    <p className="text-sm font-bold text-navy/40 uppercase tracking-widest mb-1">Order Reference</p>
                    <p className="text-2xl font-black text-navy">#{orderId}</p>
                </div>

                <div className="space-y-4">
                    <Link
                        href="/"
                        className="btn-pill bg-navy text-white border-navy w-full flex items-center justify-center gap-2 hover:bg-pink hover:border-pink"
                    >
                        Keep Shopping <ArrowRight className="w-5 h-5" />
                    </Link>

                    <p className="text-sm text-navy/40 font-bold">
                        A confirmation email is on its way to you.
                    </p>
                </div>
            </div>
        </main>
    );
}
