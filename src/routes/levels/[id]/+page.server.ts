import { fail, error, type ServerLoadEvent } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import Database, { type ProgressValues } from "$lib/server/database";
import { requireAuth } from "$lib/server/auth/middleware";
import type { RequestEvent } from "@sveltejs/kit";

export const load: PageServerLoad = async ({
  params,
  parent,
}: ServerLoadEvent) => {
  const { user } = await parent();
  try {
    const id = parseInt(params.id!);
    const db = Database.instance;
    const level = await db.getLevel(id);
    if (!user) {
      return { level };
    }
    const progress = await db.getUserProgress(user.id, id);
    return { level, progress };
  } catch (err) {
    console.error(err);
    error(404, "Not found");
  }
};

export const actions: Actions = {
  default: async (event: RequestEvent) => {
    const { request, params } = event;

    const user = await requireAuth(event);
    const data = await request.formData();
    data.append("user_id", user.id.toString());
    data.append("level_id", params.id!.toString());

    const parameters: ProgressValues = { status: "In Progress" };
    data.entries().forEach(([key, value]) => {
      if (value === "") return;
      if (key == "status") {
        parameters.status = value as string;
      } else if (key == "completion_pct") {
        parameters.completion_pct = parseInt(value as string);
        if (parameters.completion_pct >= 100) {
          parameters.completion_pct = 100;
        }
      } else if (key == "total_attempts") {
        parameters.total_attempts = parseInt(value as string);
      } else if (key == "enjoyment_rating") {
        parameters.enjoyment_rating = parseInt(value as string);
      } else if (key == "start_date") {
        parameters.start_date = new Date(value as string);
      } else if (key == "complete_date") {
        parameters.complete_date = new Date(value as string);
      } else if (key == "video_url") {
        parameters.video_url = value as string;
      } else if (key == "review") {
        parameters.review = value as string;
      } else if (key == "level_id") {
        parameters.level_id = parseInt(value as string);
      } else if (key == "user_id") {
        parameters.user_id = parseInt(value as string);
      }
    });

    const result = await Database.instance.updateUserProgress(parameters);
    if (result) {
      return { success: true };
    } else {
      return fail(400, { message: "Failed to update progress" });
    }
  },
};
