import { createClient } from "@supabase/supabase-js";
import { SUPABASE_API_KEY, SUPABASE_PROJECT_URL } from "$env/static/private";

if (!SUPABASE_PROJECT_URL) {
  throw new Error("SUPABASE_PROJECT_URL is not defined");
}

if (!SUPABASE_API_KEY) {
  throw new Error("SUPABASE_API_KEY is not defined");
}

const supabase = createClient(SUPABASE_PROJECT_URL, SUPABASE_API_KEY);

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
