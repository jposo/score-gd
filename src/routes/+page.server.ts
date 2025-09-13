import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import Database from "$lib/server/database";

export const load: PageServerLoad = async () => {
  try {
    const db = Database.instance;
    const levels = await db.getLevels();
    return { data: levels };
  } catch (err) {
    console.error(err);
    error(404, "Not found");
  }
};
