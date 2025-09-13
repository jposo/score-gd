import type { Actions } from "./$types";
import { requireAuth } from "$lib/auth/middleware";
import Database from "$lib/server/database";

export const actions: Actions = {
  default: async (event) => {
    const { request } = event;

    const user = await requireAuth(event);
    const data = await request.formData();
    // console.log(user);
    console.log(data);

    const level_id = data.get("level_id") as string;
    const status = data.get("status") as string;
    const enjoyment_rating = data.get("enjoyment_rating") as string;

    Database.instance.updateUserProgress({
      user_id: user.id,
      level_id: parseInt(level_id),
      status: status,
      enjoyment_rating: parseInt(enjoyment_rating),
    });
  },
};
