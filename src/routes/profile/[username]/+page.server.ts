import type { PageServerLoad, Actions } from "./$types";
import { fail, error } from "@sveltejs/kit";
import { getTokenFromCookies, verifyToken } from "$lib/server/auth/utils";
import Database from "$lib/server/db/index";
import { get } from "$lib/server/gd/client";

const db = Database.instance;

export const load: PageServerLoad = async (event) => {
  const username = event.params.username as string;
  const user = await db.findUserInfoByUsername(username);

  if (!user) {
    error(404, "User not found");
  }

  const listLevelIds = user.list.map((item) => item.levelId);
  const recentActivityLevelIds = user.recentActivity.map(
    (item) => item.levelId,
  );
  const allIds = [...new Set([...listLevelIds, ...recentActivityLevelIds])];

  const allLevels = await get("levels").ids(allIds);

  if (!allLevels) {
    error(500, "failed to fetch levels");
  }
  const levelMap = new Map(
    allLevels.levels.map((level) => [
      level.id,
      {
        name: level.name,
        publisher: level.creator?.username,
      },
    ]),
  );
  const enrichedList = user.list.map((item) => ({
    ...item,
    details: levelMap.get(item.levelId) || null,
  }));
  const enrichedActivity = user.recentActivity.map((item) => ({
    ...item,
    details: levelMap.get(item.levelId) || null,
  }));

  const enrichedUser = {
    ...user,
    list: enrichedList,
    recentActivity: enrichedActivity,
  };

  const token = getTokenFromCookies(event.cookies);
  let isUser = false;
  if (token) {
    const authToken = verifyToken(token);
    isUser = authToken?.username === user.username;
  }

  return {
    user: enrichedUser,
    isUser,
  };
};

export const actions: Actions = {
  default: async (event) => {
    const { request } = event;

    try {
      const form = await request.formData();
      const formList = form.get("list");
      if (formList === null) {
        return fail(400, { error: "Invalid list data" });
      }
      let list;
      try {
        list = JSON.parse(formList as string);
      } catch {
        return fail(400, { error: "Invalid list format" });
      }
      for (let p = 0; p < list.length; p++) {
        await Database.instance.updateListPlacement(list[p].id, p + 1);
      }
      console.log("List updated");
      return { success: true };
    } catch (err) {
      console.error("Error updating list placement:", err);
      return fail(500, { error: "Failed to update list placement" });
    }
  },
};
