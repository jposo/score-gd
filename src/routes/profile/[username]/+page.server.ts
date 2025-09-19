import type { PageServerLoad, Actions } from "./$types";
import { fail, error } from "@sveltejs/kit";
import { getTokenFromCookies, verifyToken } from "$lib/server/auth/utils";
import Database from "$lib/server/database";

export const load: PageServerLoad = async (event) => {
  const username = event.params.username as string;
  const user = await Database.instance.getUserInfo(username);
  if (!user) {
    error(404, "User not found");
  }

  const token = getTokenFromCookies(event.cookies);
  let isUser = false;
  if (token) {
    const authToken = verifyToken(token);
    isUser = authToken?.username === user.username;
  }

  return {
    user,
    isUser,
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
      return { success: true };
    } catch (err) {
      console.error("Error updating list placement:", err);
      return fail(500, { message: "Failed to update list placement" });
    }
  },
};
