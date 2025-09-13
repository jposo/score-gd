import type { PageServerLoad } from "./$types";
import { requireAuth } from "$lib/auth/middleware";

export const load: PageServerLoad = async (event) => {
  // Require authentication for profile page
  const user = await requireAuth(event);

  // Return user data for the profile page
  return {
    user,
  };
};
