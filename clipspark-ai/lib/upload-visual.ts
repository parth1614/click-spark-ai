import { getSupabase } from "@/lib/supabase";

const BUCKET = "ad-creatives";

/** Upload a buffer to Supabase storage and return the public URL */
export async function uploadVisualToStorage(
  buffer: Buffer,
  path: string,
  contentType: string,
): Promise<{ publicUrl: string; storagePath: string }> {
  const supabase = getSupabase();

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType, upsert: true });

  if (error) throw new Error(`Visual upload failed: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { publicUrl: data.publicUrl, storagePath: path };
}
