import { createClient } from "@supabase/supabase-js";
import env from "$lib/server/env";

const supabase = createClient(env.server.SUPABASE_PROJECT_URL, env.server.SUPABASE_API_KEY);
export async function uploadImage(file: Buffer, filepath: string) {
  const { data, error } = await supabase.storage
    .from("images")
    .upload(filepath, file, {
      contentType: "image/jpeg",
    });
  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }
  return data;
}

export async function uploadImages(
  files: { file: Buffer; filepath: string }[],
) {
  const results = [];
  for (const f of files) {
    const result = await uploadImage(f.file, f.filepath);
    results.push(result);
  }
  return results;
}
