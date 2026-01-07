-- 1. Create the sticker_generations table
CREATE TABLE IF NOT EXISTS public.sticker_generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL,
    image_index INTEGER NOT NULL,
    image_path TEXT NOT NULL,
    image_url TEXT NOT NULL,
    prompt TEXT NOT NULL,
    style TEXT,
    vibe TEXT,
    is_selected BOOLEAN DEFAULT false,
    is_purchased BOOLEAN DEFAULT false,
    order_id UUID REFERENCES public.orders(order_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security
ALTER TABLE public.sticker_generations ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
-- Allow public read access to generations (for users to see their options)
CREATE POLICY "Allow public read access to generations"
ON public.sticker_generations
FOR SELECT
USING (true);

-- Allow service_role to manage everything (for our API)
CREATE POLICY "Allow service_role full access to generations"
ON public.sticker_generations
TO service_role
USING (true)
WITH CHECK (true);

-- 4. Set up an index for faster lookups during cleanup
CREATE INDEX IF NOT EXISTS idx_sticker_generations_created_at ON public.sticker_generations (created_at);
CREATE INDEX IF NOT EXISTS idx_sticker_generations_transaction_id ON public.sticker_generations (transaction_id);

-- COMMENT: Run this in your Supabase SQL Editor.
