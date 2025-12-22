import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import Database from "$lib/server/db/index";

export const load: PageServerLoad = async () => {
  try {
    const db = Database.instance;
    const levels = await db.findTrendingLevels();
    return { levels };
  } catch (err) {
    console.error(err);
    error(500, "Internal Server Error");
  }
};
