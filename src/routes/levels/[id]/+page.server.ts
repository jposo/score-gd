import { fail, error, type ServerLoadEvent } from "@sveltejs/kit";
import type { PageServerLoad, Actions, RequestEvent } from "./$types";
import Database from "$lib/server/db/instance";
import { requireAuth, requireAuthWithRoles } from "$lib/server/auth/middleware";
import { isVideoUrl } from "$lib/tools/utils";
import * as z from "zod";
import { get } from "$lib/server/gd/client";

const ProgressForm = z.object({
  status: z.enum(["to try", "in progress", "completed", "dropped"]),
  completionPercentage: z.coerce.number().min(0).max(100).nullable(),
  attempts: z.coerce.number().min(0).nullable(),
  rating: z.coerce.number().min(1).max(10).nullable(),
  startDate: z.coerce.date().nullable(),
  completionDate: z.coerce.date().nullable(),
  videoUrl: z.url().nullable(),
  review: z.string().min(0).max(1024).nullable(),
});

const UpdateLevelForm = z.object({
  releaseDate: z.coerce.date().nullable(),
  videoUrl: z.url().nullable(),
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
    // const level = await db.findLevelById(id);
    const result = await get("levels").search(id);
    if (!result) {
      error(404, "level not found");
    }
    const gdl = result.levels[0];
    const progress = (await db.accrueProgressByLevelId(gdl.id))[0];
    const level = {
      id: gdl.id,
      name: gdl.name,
      publisher: gdl.creator?.username,
      description: gdl.description,
      difficulty: gdl.difficulty,
      releaseDate: null,
      coins: gdl.coins.count,
      twoPlayer: gdl.twoPlayer,
      rating: gdl.rating,
      length: gdl.length,
      videoUrl: null,
      songId: gdl.song?.id,
      songTitle: gdl.song?.name,
      songArtist: gdl.song?.artist.name,
      progressCount: progress?.progressCount ?? 0,
      averageRating: progress?.averageRating ?? 0,
      completionCount: progress?.completionCount ?? 0,
      reviewCount: progress?.reviewCount ?? 0,
      reviews: progress?.reviews ?? [],
    };
    if (!user) {
      return { level };
    }
    const userProgress = await db.findUserProgressByLevelId(user.id, id);
    const skillsets = ["2.0"];
    return { level, progress: userProgress, skillsets };
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
      return fail(400, { message: `invalid level id: ${params.id}` });
    }
    // check here if level id exists (maybe)

    const form = await request.formData();

    const result = ProgressForm.safeParse({
      status: form.get("status"),
      completionPercentage: form.get("completionPercentage") || null,
      attempts: form.get("attempts") || null,
      rating: form.get("rating") || null,
      startDate: form.get("startDate") || null,
      completionDate: form.get("completionDate") || null,
      videoUrl: form.get("videoUrl") || null,
      review: form.get("review") || null,
    });

    if (!result.success) {
      return fail(400, { message: result.error.message });
    }

    const data = result.data;

    try {
      console.log("updating progress");
      const result = await Database.instance.upsertUserProgress({
        userId: user.id,
        levelId: levelId,
        status: data.status,
        completionPercentage: data.completionPercentage,
        attempts: data.attempts,
        startedAt: data.startDate?.toISOString().split("T")[0],
        completedAt: data.completionDate?.toISOString().split("T")[0],
        rating: data.rating,
        videoUrl: data.videoUrl,
        review: data.review,
      });

      if (result) {
        return { success: true };
      } else {
        return fail(422, { message: "failed to update progress" });
      }
    } catch (err) {
      console.error(err);
      return fail(500, { message: "internal server error" });
    }
  },
  // updateLevel: async (event: RequestEvent) => {
  //   const user = await requireAuthWithRoles(event, ["admin"]);

  //   const levelId = parseInt(event.params.id!);

  //   if (Number.isNaN(levelId)) {
  //     return fail(400, { error: `Invalid level ID: ${event.params.id}` });
  //   }

  //   const form = await event.request.formData();

  //   const result = UpdateLevelForm.safeParse({
  //     releaseDate: form.get("releaseDate") || null,
  //     videoUrl: form.get("videoUrl") || null,
  //   });

  //   if (!result.success) {
  //     return fail(400, {
  //       message: "invalid form data",
  //       error: result.error.message,
  //     });
  //   }

  //   const data = result.data;

  //   console.log(`User ${user.id} updated level ${levelId}`);
  //   const id = await Database.instance.updateLevel(levelId, {data.releaseDate, data.videoUrl});
  // },
};
