export const STICKER_PRICES = {
    small: 4.99,
    regular: 8.99,
    large: 10.99,
} as const;

export const STICKER_SIZES = {
    small: { w: 50.8, h: 76.2, label: 'Small (2" x 3")' },
    regular: { w: 76.2, h: 101.6, label: 'Regular (3" x 4")' },
    large: { w: 101.6, h: 127.0, label: 'Large (4" x 5")' }
} as const;

export type StickerSize = keyof typeof STICKER_PRICES;

// Helper to format currency
export const formatPrice = (amount: number) => `£${amount.toFixed(2)}`;

// Helper for Stripe (pence)
export const getStripeAmount = (size: string): number => {
    const s = size.toLowerCase() as StickerSize;
    return Math.round((STICKER_PRICES[s] || STICKER_PRICES.regular) * 100);
};
