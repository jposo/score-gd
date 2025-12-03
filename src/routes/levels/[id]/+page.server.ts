import { fail, error, type ServerLoadEvent } from "@sveltejs/kit";
import type { PageServerLoad, Actions, RequestEvent } from "./$types";
import Database, { type ProgressValues } from "$lib/server/database";
import { requireAuth, requireAuthWithRoles } from "$lib/server/auth/middleware";
import { isVideoUrl } from "$lib/tools/utils";
import type { Level } from "$lib/db-types";

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
    console.log(progress);
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

    const allowedFormKeys = new Set([
      "status",
      "completion_pct",
      "total_attempts",
      "enjoyment_rating",
      "start_date",
      "completion_date",
      "video_url",
      "review",
    ]);

    const levelId = parseInt(params.id!);

    if (Number.isNaN(levelId)) {
      return fail(400, { error: `Invalid level ID: ${params.id}` });
    }

    try {
      const data = await request.formData();

      const parameters: ProgressValues = {
        user_id: user.id,
        level_id: levelId,
        status: "In Progress",
      };

      for (const [key, value] of data.entries()) {
        if (value === "" || typeof value !== "string") {
          continue;
        }

        if (!allowedFormKeys.has(key)) {
          return fail(400, { error: `Invalid key: ${key}` });
        }

        switch (key) {
          case "completion_pct":
          case "total_attempts":
          case "enjoyment_rating": {
            const num = parseInt(value, 10);
            if (!Number.isNaN(num)) {
              parameters[key] = num;
            }
            break;
          }
          case "start_date":
          case "completion_date": {
            const date = new Date(value);
            if (!Number.isNaN(date.getTime())) {
              parameters[key] = date;
            }
            break;
          }
          case "video_url":
          case "review":
          case "status":
            parameters[key] = value;
        }
      }
      if (parameters.completion_pct && parameters.completion_pct >= 100) {
        parameters.completion_pct = 100;
        parameters.status = "Completed";
      }
      const result = await Database.instance.updateUserProgress(parameters);
      if (result) {
        return { success: true };
      } else {
        return fail(400, { error: "Failed to update progress" });
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
