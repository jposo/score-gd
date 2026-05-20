import type { PageServerLoad } from "./$types";
import { requireAuthWithRoles } from "$lib/server/auth/middleware";

export const load: PageServerLoad = async ({ cookies, url }) => {
  const user = await requireAuthWithRoles(cookies, url, ["admin"]);

  return { user };
};
