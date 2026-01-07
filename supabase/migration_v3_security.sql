-- SECURITY UPDATE: Lock down sticker_generations table
-- 1. Drop the insecure public policy if it exists
DROP POLICY IF EXISTS "Allow public read access to generations" ON public.sticker_generations;

-- 2. Ensure RLS is enabled (just in case)
ALTER TABLE public.sticker_generations ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Service Role ONLY (No public access)
-- We strictly only allow the server (API routes) to read/write.
-- Users see their stickers via the Public URLs returned by the generation API, not by querying the table.
CREATE POLICY "Allow service_role only"
ON public.sticker_generations
TO service_role
USING (true)
WITH CHECK (true);

-- 4. Verify orders table security (already private by default if no public policy exists)
-- Just ensuring service role has full access
DROP POLICY IF EXISTS "Allow service role full access on orders" ON public.orders;
CREATE POLICY "Allow service role full access on orders"
ON public.orders
TO service_role
USING (true)
WITH CHECK (true);
