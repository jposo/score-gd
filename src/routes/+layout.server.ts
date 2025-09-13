import type { LayoutServerLoad } from "./$types";
import { getTokenFromCookies, verifyToken } from "$lib/auth/utils";
import Database from "$lib/server/database";

export const load: LayoutServerLoad = async ({ cookies }) => {
  // Get token from cookies
  const token = getTokenFromCookies(cookies);

  if (!token) {
    return {
      user: null,
    };
  }

  // Verify token
  const authToken = verifyToken(token);
  if (!authToken) {
    return {
      user: null,
    };
  }

  // Get full user data from database
  const user = await Database.instance.getUserById(authToken.userId);

  return {
    user,
  };
};
