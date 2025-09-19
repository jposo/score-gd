import type { LayoutServerLoad } from "./$types";
import { getTokenFromCookies, verifyToken } from "$lib/server/auth/utils";
import Database from "$lib/server/database";
import { error } from "@sveltejs/kit";

export const load: LayoutServerLoad = async ({ cookies }) => {
  try {
    // Get token from cookies
    const token = getTokenFromCookies(cookies);

    if (!token) {
      console.log("No token");
      return { user: null };
    }

    // Verify token
    const authToken = verifyToken(token);
    if (!authToken) {
      console.log("Invalid token");
      return { user: null };
    }

    // Get full user data from database
    const user = await Database.instance.getUserInfo(authToken.username);

    return { user };
  } catch (err) {
    console.error(err);
    error(500, "Internal Server Error");
  }
};
