import * as z from "zod";
import * as env from "$env/static/private";
import * as envPublic from "$env/static/public";

const PrivateEnv = z.object({
    STARTING_DATE: z.string().min(1),
    DATABASE_URL: z.url(),
    SUPABASE_API_KEY: z.string().min(1),
    SUPABASE_PROJECT_URL: z.string().min(1),
    JWT_SECRET: z.string().min(32),
});

const PublicEnv = z.object({
    PUBLIC_SUPABASE_PROJECT_ID: z.string().min(1),
});

const serverEnv = PrivateEnv.parse(env)
const publicEnv = PublicEnv.parse(envPublic);

export default {
    server: serverEnv,
    public: publicEnv,
}
