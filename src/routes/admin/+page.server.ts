import type { PageServerLoad } from "./$types";
import { requireAuthWithRoles } from "$lib/server/auth/middleware";

export const load: PageServerLoad = async (event) => {
  const user = await requireAuthWithRoles(event, ["admin"]);

  return { user };
};
