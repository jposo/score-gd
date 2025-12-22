import { fail, error, type ServerLoadEvent } from "@sveltejs/kit";
import type { PageServerLoad, Actions, RequestEvent } from "./$types";
import Database from "$lib/server/database";
import { requireAuth, requireAuthWithRoles } from "$lib/server/auth/middleware";
import { isVideoUrl } from "$lib/tools/utils";
import type { Level } from "$lib/db-types";
import * as z from "zod";

const ProgressForm = z.object({
  status: z.enum(["To Try", "In Progress", "Completed", "Dropped"]),
  completionPercentage: z.coerce.number().min(0).max(100).nullable(),
  attempts: z.coerce.number().min(0).nullable(),
  rating: z.coerce.number().min(1).max(10).nullable(),
  startDate: z.coerce.date().nullable(),
  completionDate: z.coerce.date().nullable(),
  videoUrl: z.url().nullable(),
  review: z.string().min(0).max(1024).nullable(),
});

export const load: PageServerLoad = async ({
  params,
  parent,
}: ServerLoadEvent) => {
  const { user } = await parent();
  try {
    const id = parseInt(params.id!);
    if (Number.isNaN(id)) {
      error(400, "Invalid level ID");
    }
    const db = Database.instance;
    const level = await db.getLevel(id);
    if (!user) {
      return { level };
    }
    const progress = await db.getUserProgress(user.id, id);
    const skillsets = await db.getAllSkillsets();
    return { level, progress, skillsets };
  } catch (err) {
    console.error(err);
    error(500, "Internal Server Error");
  }
};

export const actions: Actions = {
  updateProgress: async (event: RequestEvent) => {
    const { request, params } = event;

    const user = await requireAuth(event);

    const levelId = parseInt(params.id!);

    if (Number.isNaN(levelId)) {
      return fail(400, { error: `Invalid level ID: ${params.id}` });
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
      const result = await Database.instance.updateUserProgress({
        user_id: user.id,
        level_id: levelId,
        status: data.status,
        completion_pct: data.completionPercentage,
        total_attempts: data.attempts,
        start_date: data.startDate,
        completion_date: data.completionDate,
        enjoyment_rating: data.rating,
        video_url: data.videoUrl,
        review: data.review,
      });
      if (result) {
        return { success: true };
      } else {
        return fail(422, { error: "Failed to update progress" });
      }
    } catch (err) {
      console.error(err);
      return fail(500, { message: "Internal Server Error" });
    }
  },
  updateLevel: async (event: RequestEvent) => {
    const user = await requireAuthWithRoles(event, ["Admin"]);

    const data = await event.request.formData();

    const parameters: Pick<
      Level,
      "release_date" | "difficulty" | "video_url" | "description"
    > = {};
    const releaseDate = new Date(data.get("release_date") as string);
    if (!Number.isNaN(releaseDate.getTime())) {
      parameters.release_date = releaseDate;
    }
    const difficulty = data.get("difficulty") as string;
    parameters.difficulty = difficulty;
    const videoUrl = data.get("video_url") as string;
    if (isVideoUrl(videoUrl)) {
      parameters.video_url = videoUrl;
    }
    const description = data.get("description") as string;
    parameters.description = description;

    const levelId = parseInt(event.params.id!);

    if (Number.isNaN(levelId)) {
      return fail(400, { error: `Invalid level ID: ${event.params.id}` });
    }

    console.log(`User ${user.id} updated level ${levelId}`);
    await Database.instance.updateLevel(levelId, parameters);
  },
};
