import type { PageServerLoad, Actions } from "./$types";
import { fail, error } from "@sveltejs/kit";
import db from "$lib/server/db/instance";
import { get } from "$lib/server/gd/client";
import { requireAuth } from "$lib/server/auth/middleware";
import { z } from "zod";
import winston from "winston";

const UpdateList = z.object({
  movedLevelId: z.coerce.number().min(1),
  previousLevelId: z.preprocess(
    (val) => {
      if (val === "" || val === "null" || val === null) return null;
      return val;
    },
    z.coerce.number().min(1).nullable(),
  ),
  nextLevelId: z.preprocess(
    (val) => {
      if (val === "" || val === "null" || val === null) return null;
      return val;
    },
    z.coerce.number().min(1).nullable(),
  ),
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

      const activeCount = await db.countActiveCompleted(user.id);
      if (activeCount > 25) {
        return fail(422, {
          message:
            "active completed list can only contain up to 25 items. demote one item before reordering.",
        });
      }

      const updated = await db.moveActiveListItemFractional(
        user.id,
        data.movedLevelId,
        data.previousLevelId,
        data.nextLevelId,
      );

      if (!updated) {
        return fail(422, {
          message: "failed to reorder list item",
        });
      }

      return { success: true };
    } catch (err) {
      winston.error("error updating list placement:", err);
      return fail(500, { message: "failed to update list placement" });
    }
  },
};
