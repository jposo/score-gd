import { fail } from "@sveltejs/kit";
import type { PageServerLoad, Actions, RequestEvent } from "./$types";
import { requireAuthWithRoles } from "$lib/server/auth/middleware";
// import { addLevelsToDatabase } from "$lib/server/geometryDash/levels";
import Database from "$lib/server/db/instance";
import * as z from "zod";

export const load: PageServerLoad = async (event) => {
  const user = await requireAuthWithRoles(event, ["admin"]);

  return { user };
};
