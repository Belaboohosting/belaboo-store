-- 1. SQL Function to identify old unpurchased records
-- This can be used by an Edge Function to know what to delete from Storage
CREATE OR REPLACE FUNCTION public.get_old_unpurchased_stickers()
RETURNS TABLE (image_path TEXT) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT sg.image_path
    FROM public.sticker_generations sg
    WHERE sg.is_purchased = false
    AND sg.created_at < now() - interval '24 hours';
END;
$$;

-- 2. SQL Function to delete the records after Storage is cleaned
-- Call this AFTER your Edge Function successfully deletes files
CREATE OR REPLACE FUNCTION public.delete_old_unpurchased_records()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM public.sticker_generations
    WHERE is_purchased = false
    AND created_at < now() - interval '24 hours';
END;
$$;

/* 
================================================================================
-- EDGE FUNCTION PSEUDO-CODE (Deno / Supabase)
================================================================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // 1. Get paths to delete
  const { data: paths } = await supabase.rpc('get_old_unpurchased_stickers')
  
  if (paths && paths.length > 0) {
    const pathList = paths.map(p => p.image_path)
    
    // 2. Delete from Storage
    await supabase.storage.from('generated-stickers').remove(pathList)
    
    // 3. Delete DB rows
    await supabase.rpc('delete_old_unpurchased_records')
  }

  return new Response("Cleanup Complete", { status: 200 })
})
================================================================================
*/
