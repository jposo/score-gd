import type { PageServerLoad, Actions } from "./$types";
import { fail, error } from "@sveltejs/kit";
import db from "$lib/server/db/instance";
import { get } from "$lib/server/gd/client";
import { requireAuth } from "$lib/server/auth/middleware";
import { z } from "zod";
import winston from "winston";
import { statusEnum, type InsertProgress } from "$lib/server/db/schema";
import ProgressUpdate from "$lib/server/schemas/ProgressUpdate";

const UpdateList = z.object({
    activeList: z
        .string()
        .transform((str, ctx) => {
            try {
                return JSON.parse(str);
            } catch {
                ctx.addIssue({
                    code: "custom",
                    message: "invalid active list payload",
                });
                return z.NEVER;
            }
        })
        .pipe(z.array(z.coerce.number().min(1)).max(25)),
    inactiveList: z
        .string()
        .transform((str, ctx) => {
            try {
                return JSON.parse(str);
            } catch {
                ctx.addIssue({
                    code: "custom",
                    message: "invalid inactive list payload",
                });
                return z.NEVER;
            }
        })
        .pipe(z.array(z.coerce.number().min(1))),
});

export const load: PageServerLoad = async (event) => {
    const username = event.params.username as string;
    const profile = await db.findUserInfoByUsername(username);
    const snapshotAtParam = event.url.searchParams.get("at");
    const parsedSnapshotAt = snapshotAtParam ? new Date(snapshotAtParam) : null;
    const snapshotAt =
        parsedSnapshotAt && !Number.isNaN(parsedSnapshotAt.getTime())
            ? parsedSnapshotAt
            : null;

    if (!profile) {
        error(404, "user not found");
    }

    const listLevelIds = profile.list.map((item) => item.id);
    const inactiveLevelIds = profile.inactiveList.map((item) => item.id);
    const snapshot = snapshotAt
        ? await db.findCompletedListSnapshotByUserId(profile.id, snapshotAt)
        : null;
    const snapshotActiveIds = snapshot
        ? snapshot.activeList.map((item) => item.id)
        : [];
    const snapshotInactiveIds = snapshot
        ? snapshot.inactiveList.map((item) => item.id)
        : [];
    const recentActivityLevelIds = profile.recentActivity.map(
        (item) => item.levelId,
    );
    const allProgressLevelIds = profile.allProgress.map((item) => item.levelId);
    const allIds = [
        ...new Set([
            ...listLevelIds,
            ...inactiveLevelIds,
            ...recentActivityLevelIds,
            ...allProgressLevelIds,
            ...snapshotActiveIds,
            ...snapshotInactiveIds,
        ]),
    ];

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
    const enrichedInactiveList = profile.inactiveList.map((item) => ({
        ...item,
        details: levelMap.get(item.id) || null,
    }));
    const enrichedActivity = profile.recentActivity.map((item) => ({
        ...item,
        details: levelMap.get(item.levelId) || null,
    }));
    const enrichedAllProgress = profile.allProgress.map((item) => ({
        ...item,
        details: levelMap.get(item.levelId) || null,
    }));
    const enrichedSnapshot = snapshot
        ? {
              at: snapshot.at.toISOString(),
              activeList: snapshot.activeList.map((item) => ({
                  ...item,
                  details: levelMap.get(item.id) || null,
              })),
              inactiveList: snapshot.inactiveList.map((item) => ({
                  ...item,
                  details: levelMap.get(item.id) || null,
              })),
          }
        : null;

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
        inactiveList: enrichedInactiveList,
        recentActivity: enrichedActivity,
        allProgress: enrichedAllProgress,
        snapshot: enrichedSnapshot,
        snapshotAtParam,
        isUser,
    };

    return {
        profile: enrichedProfile,
    };
};

export const actions: Actions = {
    updateList: async (event) => {
        const user = await requireAuth(event);

        try {
            const form = await event.request.formData();
            const result = UpdateList.safeParse(Object.fromEntries(form));
            if (!result.success) {
                return fail(400, { message: "invalid list data" });
            }
            const data = result.data;

            const ids = [...data.activeList, ...data.inactiveList];
            const uniqueIds = new Set(ids);
            if (ids.length !== uniqueIds.size) {
                return fail(400, {
                    message: "list payload contains duplicate levels",
                });
            }

            const updated = await db.syncCompletedListMembership(
                user.id,
                data.activeList,
                data.inactiveList,
            );

            if (!updated) {
                return fail(422, {
                    message: "failed to update list membership",
                });
            }

            return { success: true };
        } catch (err) {
            winston.error("error updating list placement:", err);
            return fail(500, { message: "failed to update list placement" });
        }
    },
};
