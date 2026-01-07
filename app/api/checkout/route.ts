import Stripe from "stripe";
import { NextResponse } from "next/server";
import { getStripeAmount } from "@/lib/pricing";

const stripeSecret = process.env.STRIPE_SECRET_KEY || "";
const stripe = stripeSecret ? new Stripe(stripeSecret, {
    apiVersion: "2025-01-27.acacia" as any,
}) : null;

export async function POST(req: Request) {
    try {
        if (!stripe) {
            return NextResponse.json({ error: "Stripe is not configured" }, { status: 500 });
        }

        const { items, email, transactionId } = await req.json();

        if (!items || items.length === 0) {
            return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
        }

        const lineItems = items.map((item: any) => ({
            price_data: {
                currency: "gbp",
                product_data: {
                    name: `Belaboo Sticker (${item.size}) - Pack of 4`,
                    images: [item.image_url],
                    metadata: {
                        type: item.type,
                        size: item.size,
                        image_url: item.image_url // include url in line item metadata
                    },
                },
                unit_amount: getStripeAmount(item.size),
            },
            quantity: item.qty,
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            customer_email: email,
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}`,
            allow_promotion_codes: true,
            metadata: {
                cart_items: JSON.stringify(items),
                transaction_id: transactionId || "none"
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error("Stripe Checkout error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
