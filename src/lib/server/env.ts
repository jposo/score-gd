import { z } from "zod";
import * as env from "$env/static/private";
import * as envPublic from "$env/static/public";

const PrivateEnv = z.object({
  STARTING_DATE: z.string().min(1),
  DATABASE_URL: z.url(),
  SUPABASE_API_KEY: z.string().min(1),
});

const PublicEnv = z.object({
  PUBLIC_SUPABASE_PROJECT_URL: z.url(),
  PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
});

const serverEnv = PrivateEnv.parse(env);
const publicEnv = PublicEnv.parse(envPublic);

export default {
  server: serverEnv,
  public: publicEnv,
};
