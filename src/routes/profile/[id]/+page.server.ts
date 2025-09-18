import type { PageServerLoad, Actions } from "./$types";
import { json, error } from "@sveltejs/kit";
import { requireAuth } from "$lib/server/auth/middleware";
import Database from "$lib/server/database";

export const load: PageServerLoad = async (event) => {
  // Require authentication for profile page
  const localUser = await requireAuth(event);
  const id = event.params.id as string;
  const parsedId = parseInt(id);
  if (!Number.isInteger(parsedId)) {
    return json({ error: "Invalid user ID" });
  }
  const user = await Database.instance.getUserById(parsedId);
  if (!user) {
    return json({ error: "User not found" });
  }
  // const activity = await Database.instance.getRecentActivity(user.id);

  // const list = await Database.instance.getUserList(user.id);

  // Return user data for the profile page
  return {
    user,
    isUser: user && user.username === localUser.username,
    // activity,
    // list,
  };
};

export const actions: Actions = {
  default: async (event) => {
    const { request } = event;

    try {
      const form = await request.formData();
      const list = JSON.parse(form.get("list") as string);
      console.log(form);
      for (let p = 0; p < list.length; p++) {
        await Database.instance.updateListPlacement(list[p].id, p + 1);
      }
      console.log("List updated");
      return json({ success: true });
    } catch (error) {
      console.error("Error updating list placement:", error);
      error(500, "Failed to update list placement");
    }
  },
};
