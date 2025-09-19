import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
// import Database from "$lib/server/database";

export const load: PageServerLoad = () => {
  try {
    // const db = Database.instance;
    // const levels = await db.getLevels();
    // return { levels };
  } catch (err) {
    console.error(err);
    error(500, "Internal Server Error");
  }
};
