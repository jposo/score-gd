import { fail } from "@sveltejs/kit";
import type { PageServerLoad, Actions, RequestEvent } from "./$types";
import { requireAuthWithRoles } from "$lib/server/auth/middleware";
// import { addLevelsToDatabase } from "$lib/server/geometryDash/levels";
import { Levels } from "$lib/server/tools/gd";
import Database from "$lib/server/db/index";
import * as z from "zod";

const FetchLevels = z
  .object({
    pageStart: z.number().min(0),
    pageEnd: z.number().min(0),
  })
  .refine((data) => data.pageEnd >= data.pageStart, {
    message: "end page must be greater than or equal to start page",
    path: ["pageEnd"],
  });

export const load: PageServerLoad = async (event) => {
  const user = await requireAuthWithRoles(event, ["admin"]);

  return { user };
};

export const actions: Actions = {
  fetchLevels: async (event: RequestEvent) => {
    const user = await requireAuthWithRoles(event, ["admin"]);

    const form = await event.request.formData();

    const result = FetchLevels.safeParse({
      pageStart: form.get("pageStart"),
      pageEnd: form.get("pageEnd"),
    });

    if (!result.success) {
      return fail(400, { error: result.error.message });
    }

    const data = result.data;

    try {
      for (let i = data.pageStart; i <= data.pageEnd; i++) {
        const levels = await Levels.search(
          {
            page: i,
            type: "Most Downloaded",
          },
          true,
        );
        const values = levels.map((level) => ({
          id: level.id,
          name: level.name,
          publisherId: level.creator.id,
          description: level.description,
          difficulty: level.difficulty,
          length: level.length,
          songId: level.song?.id!,
          releaseDate: level.date?.toISOString().split("T")[0],
          gameVersion: level.gameVersion,
          coins: level.coins,
          rating: level.rating,
          twoPlayer: level.twoPlayer,
        }));

        const result = await Database.instance.insertLevels(values);

        if (result.length === 0) {
          console.log(`No levels inserted on page ${i}`);
        }
      }
      console.log(
        `user ${user.id} obtained levels`,
        `from page ${data.pageStart} to ${data.pageEnd}`,
      );
      return { success: true };
    } catch (error) {
      console.log(error);
      fail(500, { message: "failed to fetch levels" });
    }
  },
};
