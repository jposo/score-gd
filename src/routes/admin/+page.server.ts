import { fail } from "@sveltejs/kit";
import type { PageServerLoad, Actions, RequestEvent } from "./$types";
import { requireAuthWithRoles } from "$lib/server/auth/middleware";
import { addLevelsToDatabase } from "$lib/server/geometryDash/levels";

export const load: PageServerLoad = async (event) => {
  const user = await requireAuthWithRoles(event, ["Admin", "Owner"]);

  return { user };
};

export const actions: Actions = {
  fetchLevels: async (event: RequestEvent) => {
    const user = await requireAuthWithRoles(event, ["Admin", "Owner"]);

    const data = await event.request.formData();
    const pageStart = data.get("pageStart") as string;
    const pageEnd = data.get("pageEnd") as string;

    const start = parseInt(pageStart);
    const end = parseInt(pageEnd);
    if (Number.isNaN(start) || Number.isNaN(end)) {
      return fail(400, { error: "Invalid page number" });
    }

    try {
      await addLevelsToDatabase(start, end);
    } catch (error) {
      console.log(error);
    }

    console.log(`User ${user.id} obtained levels from page ${start} to ${end}`);
    return { success: true };
  },
};
