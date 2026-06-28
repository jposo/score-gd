import { createClient } from "@supabase/supabase-js";
import { env } from "$env/dynamic/private";
import { env as penv } from "$env/dynamic/public";
import { Buffer } from "node:buffer";

const supabase = createClient(
    penv.PUBLIC_SUPABASE_PROJECT_URL,
    env.SUPABASE_API_KEY,
);
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
