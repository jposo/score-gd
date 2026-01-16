import { fail, error, type ServerLoadEvent } from "@sveltejs/kit";
import type { PageServerLoad, Actions, RequestEvent } from "./$types";
import Database from "$lib/server/db/instance";
import { requireAuth, requireAuthWithRoles } from "$lib/server/auth/middleware";
import { isVideoUrl } from "$lib/tools/utils";
import * as z from "zod";
import { get } from "$lib/server/gd/client";
import type { InsertLevel } from "$lib/server/db/schema";

const process = (val: any) => (val === "" ? null : val);

const ProgressForm = z.object({
  userId: z.number().min(1),
  levelId: z.number().min(1),
  status: z.enum(["to try", "in progress", "completed", "dropped"]).optional(),
  score: z.coerce.number().min(1).max(10).nullable().optional(),
  completionPercentage: z.preprocess(
    process,
    z.coerce.number().min(0).max(100).nullable().optional(),
  ),
  attempts: z.preprocess(
    process,
    z.coerce.number().min(0).nullable().optional(),
  ),
  startedAt: z.preprocess(
    process,
    z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .nullable()
      .optional(),
  ),
  completedAt: z.preprocess(
    process,
    z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .nullable()
      .optional(),
  ),
  videoUrl: z.preprocess(process, z.url().nullable().optional()),
  review: z.preprocess(
    process,
    z.string().min(0).max(1024).nullable().optional(),
  ),
});

const UpdateLevelForm = z.object({
  releaseDate: z.preprocess(
    process,
    z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .nullable()
      .optional(),
  ),
  videoUrl: z.preprocess(process, z.url().nullable().optional()),
});

const db = Database.instance;

export const load: PageServerLoad = async ({
  params,
  parent,
}: ServerLoadEvent) => {
  const { user } = await parent();
  try {
    const id = parseInt(params.id!);
    if (Number.isNaN(id)) {
      error(400, "invalid level id");
    }
    const search = await get("levels").search(id);
    if (!search) {
      error(404, "level not found");
    }
    const result = search.result[0];
    const progress = (await db.accrueProgressByLevelId(result.id))[0];
    const levelDetails = await db.findLevelByIdSimple(id);

    const level = {
      id: result.id,
      name: result.name,
      publisher: result.creator?.username,
      description: result.description,
      difficulty: result.difficulty,
      releaseDate: levelDetails?.releaseDate,
      coins: result.coins.count,
      twoPlayer: result.twoPlayer,
      rating: result.rating,
      length: result.length,
      videoUrl: levelDetails?.videoUrl,
      songId: result.song?.id,
      songTitle: result.song?.name,
      songArtist: result.song?.artist.name,
      progressCount: progress?.progressCount ?? 0,
      averageScore: progress?.averageScore ?? 0,
      completionCount: progress?.completionCount ?? 0,
      reviewCount: progress?.reviewCount ?? 0,
      reviews: progress?.reviews ?? [],
    };
    if (!user) {
      return { level };
    }
    const userProgress = await db.findUserProgressByLevelId(user.id, id);
    return { level, progress: userProgress };
  } catch (err) {
    console.error(err);
    error(500, "internal server error");
  }
};

export const actions: Actions = {
  updateProgress: async (event: RequestEvent) => {
    const { request, params } = event;

    const user = await requireAuth(event);

    const levelId = parseInt(params.id!);

    if (Number.isNaN(levelId)) {
      return fail(400, { message: "invalid level id" });
    }
    // check here if level id exists (maybe)

    const form = await request.formData();
    const entries = {
      userId: user.id,
      levelId,
      ...Object.fromEntries(form),
    };

    const result = ProgressForm.safeParse(entries);

    if (!result.success) {
      return fail(400, {
        message: "invalid input",
        error: result.error.message,
      });
    }

    const data = result.data;

    // return fail(422, { message: "test mode" });

    try {
      const result = await db.upsertUserProgress(data);

      if (result) {
        return { success: true, message: "sucessfully updated progress" };
      } else {
        return fail(422, { message: "failed to update progress" });
      }
    } catch (err) {
      console.error(err);
      return fail(500, { message: "internal server error" });
    }
  },
  updateLevel: async (event: RequestEvent) => {
    const user = await requireAuthWithRoles(event, ["admin"]);

    const levelId = parseInt(event.params.id!);

    if (Number.isNaN(levelId)) {
      return fail(400, { message: "invalid level id" });
    }

    const form = await event.request.formData();

    const entries = Object.fromEntries(form);

    const result = UpdateLevelForm.safeParse(entries);

    if (!result.success) {
      return fail(400, {
        message: "invalid input",
        error: result.error.message,
      });
    }

    const data = {
      ...result.data,
      id: levelId,
      updatedBy: user.id,
    } satisfies InsertLevel;

    console.log(
      `user ${user.username} (id:${user.id}) updated level ${levelId}`,
    );
    try {
      const result = await db.updateLevel(data);

      if (result) {
        return { success: true, message: "sucessfully updated level" };
      } else {
        return fail(422, { message: "failed to update level" });
      }
    } catch (err) {
      console.error(err);
      return fail(500, { message: "internal server error" });
    }
  },
};
