import { json, error } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { requireAuth } from "$lib/server/auth/middleware";
import Database, { type ProgressValues } from "$lib/server/database";

export const actions: Actions = {
  default: async (event) => {
    const { request } = event;

    const user = await requireAuth(event);
    const data = await request.formData();
    data.append("user_id", user.id.toString());
    // console.log(user);

    // const status = data.get("status") as string;
    // const enjoyment_rating = data.get("enjoyment_rating") as string;
    const params: ProgressValues = { status: "In Progress" };
    data.entries().forEach(([key, value]) => {
      if (value === "") return;
      if (key == "status") {
        params.status = value;
      } else if (key == "completion_pct") {
        params.completion_pct = parseInt(value);
        if (params.completion_pct >= 100) {
          params.completion_pct = 100;
        }
      } else if (key == "total_attempts") {
        params.total_attempts = parseInt(value);
      } else if (key == "enjoyment_rating") {
        params.enjoyment_rating = parseInt(value);
      } else if (key == "start_date") {
        params.start_date = value;
      } else if (key == "complete_date") {
        params.complete_date = value;
      } else if (key == "video_url") {
        params.video_url = value;
      } else if (key == "review") {
        params.review = value;
      } else if (key == "level_id") {
        params.level_id = parseInt(value);
      } else if (key == "user_id") {
        params.user_id = parseInt(value);
      }
    });

    const result = await Database.instance.updateUserProgress(params);
    if (result) {
      json({ success: true });
    } else {
      error(400, "Failed to update progress");
    }
  },
};
