import type { PageServerLoad } from "./$types";
import { redirectIfAuthenticated } from "$lib/server/auth/middleware";

export const load: PageServerLoad = async (event) => {
  // Redirect authenticated users away from login page
  await redirectIfAuthenticated(event);

  return {};
};
