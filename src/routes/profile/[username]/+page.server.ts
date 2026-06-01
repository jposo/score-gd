import type { PageServerLoad, Actions } from "./$types";
import { fail, error } from "@sveltejs/kit";
import db from "$lib/server/db/instance";
import { get } from "$lib/server/gd/client";
import { requireAuth } from "$lib/server/auth/middleware";
import { z } from "zod";
import winston from "winston";

const UpdateList = z.object({
  list: z
    .string()
    .transform((str, ctx) => {
      try {
        return JSON.parse(str);
      } catch (e) {
        ctx.addIssue({
          code: "invalid_type",
          message: "Invalid JSON array string",
          expected: "string",
        });
        return z.NEVER;
      }
    })
    .pipe(z.array(z.number().min(1))),
});

export const load: PageServerLoad = async (event) => {
  const username = event.params.username as string;
  const profile = await db.findUserInfoByUsername(username);

  if (!profile) {
    error(404, "user not found");
  }

  const listLevelIds = profile.list.map((item) => item.id);
  const recentActivityLevelIds = profile.recentActivity.map(
    (item) => item.levelId,
  );
  const allIds = [...new Set([...listLevelIds, ...recentActivityLevelIds])];

  const allLevels = await get("levels").ids(allIds);

  if (!allLevels) {
    error(500, "failed to fetch levels");
  }

  const levelMap = new Map(
    allLevels.result.map((level) => [
      level.id,
      {
        name: level.name,
        publisher: level.creator?.username,
      },
    ]),
  );
  const enrichedList = profile.list.map((item) => ({
    ...item,
    details: levelMap.get(item.id) || null,
  }));
  const enrichedActivity = profile.recentActivity.map((item) => ({
    ...item,
    details: levelMap.get(item.levelId) || null,
  }));

  const {
    data: { user },
  } = await event.locals.supabase.auth.getUser();
  const isUser = user?.id === profile.id;

  const enrichedProfile = {
    username: profile.username,
    bio: profile.bio,
    registeredAt: profile.createdAt!,
    stats: {
      averageScore: profile.averageScore,
      levelsCompleted: profile.levelsCompleted,
      reviewsWritten: profile.reviewsWritten,
    },
    list: enrichedList,
    recentActivity: enrichedActivity,
    isUser,
  };

  return {
    profile: enrichedProfile,
  };
};

export const actions: Actions = {
  default: async (event) => {
    const user = await requireAuth(event);

    try {
      const form = await event.request.formData();
      const result = UpdateList.safeParse(Object.fromEntries(form));
      if (!result.success) {
        return fail(400, { message: "invalid list data" });
      }
      const data = result.data;

      for (let p = 0; p < data.list.length; p++) {
        await db.updateListPlacement(data.list[p], user.id, p + 1);
      }
      return { success: true };
    } catch (err) {
      winston.error("error updating list placement:", err);
      return fail(500, { message: "failed to update list placement" });
    }
  },
};
