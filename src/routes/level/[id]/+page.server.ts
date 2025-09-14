import { error } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import Database from "$lib/server/database";

export const load: PageServerLoad = async ({ params, parent }) => {
  const { user } = await parent();
  try {
    const id = parseInt(params.id);
    const db = Database.instance;
    const level = await db.getLevel(id);
    if (!user) {
      return { level };
    }
    const progress = await db.getUserProgress(user.id, level.id);
    const reviews = await db.getReviews(level.id);
    return { level, progress, reviews };
  } catch (err) {
    console.error(err);
    error(404, "Not found");
  }
};

export const actions: Actions = {
  default: async (event) => {
    const { request } = event;

    console.log(`Update ${event.params.id}`);
  },
};
