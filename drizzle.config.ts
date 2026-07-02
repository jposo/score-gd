import { defineConfig } from "drizzle-kit";

const dbUrl = Deno.env.get("DATABASE_URL");
if (!dbUrl) {
    throw new Error("DATABASE_URL is not defined");
}

export default defineConfig({
    schema: "./src/lib/server/db/schema.ts",
    out: "./supabase/migrations",
    dialect: "postgresql",
    dbCredentials: { url: dbUrl },
    verbose: true,
    strict: true,
});
