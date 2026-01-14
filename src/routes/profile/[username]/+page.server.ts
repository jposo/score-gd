import type { PageServerLoad, Actions } from "./$types";
import { fail, error } from "@sveltejs/kit";
import { getTokenFromCookies, verifyToken } from "$lib/server/auth/utils";
import Database from "$lib/server/db/index";
import { get } from "$lib/server/gd/client";
import { requireAuth } from "$lib/server/auth/middleware";
import * as z from "zod";

const UpdateList = z.object({
  list: z.array(z.number().min(1)),
});

const db = Database.instance;

export const load: PageServerLoad = async (event) => {
  const username = event.params.username as string;
  const user = await db.findUserInfoByUsername(username);

  if (!user) {
    error(404, "user not found");
  }

  const listLevelIds = user.list.map((item) => item.id);
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
    details: levelMap.get(item.id) || null,
  }));
  const enrichedActivity = user.recentActivity.map((item) => ({
    ...item,
    details: levelMap.get(item.levelId) || null,
  }));

  const token = getTokenFromCookies(event.cookies);
  let isUser = false;
  if (token) {
    const authToken = verifyToken(token);
    isUser = authToken?.username === user.username;
  }

  const enrichedUser = {
    username: user.username,
    bio: user.bio,
    profilePicturePath: user.profilePicturePath,
    registeredAt: user.createdAt!,
    stats: {
      averageRating: user.averageRating,
      levelsCompleted: user.levelsCompleted,
      reviewsWritten: user.reviewsWritten,
    },
    list: enrichedList,
    recentActivity: enrichedActivity,
    isUser,
  };

  return {
    profile: enrichedUser,
  };
};

export const actions: Actions = {
  default: async (event) => {
    const { request } = event;

    const user = await requireAuth(event);

    try {
      const form = await request.formData();
      const result = UpdateList.safeParse({
        list: form.get("list"),
      });
      if (!result.success) {
        return fail(400, { message: "invalid list data" });
      }
      const data = result.data;

      for (let p = 0; p < data.list.length; p++) {
        await Database.instance.updateListPlacement(
          data.list[p],
          user.id,
          p + 1,
        );
      }
      return { success: true };
    } catch (err) {
      console.error("error updating list placement:", err);
      return fail(500, { message: "failed to update list placement" });
    }
  },
};
