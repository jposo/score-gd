import type { LayoutServerLoad } from "./$types";
import { getTokenFromCookies, verifyToken } from "$lib/server/auth/utils";
import { error } from "@sveltejs/kit";
import db from "$lib/server/db/instance";
import { getCurrentDay } from "$lib/server/utils";
import { AUTH_COOKIE_NAME } from "$lib/constants";

export const load: LayoutServerLoad = async ({ cookies }) => {
  try {
    // Get token from cookies
    const token = getTokenFromCookies(cookies);
    const vault = (await db.findVault(getCurrentDay())).map((d) => d.day);

    if (!token) {
      return { vault, user: null };
    }

    // Verify token
    const authToken = verifyToken(token);
    if (!authToken) {
      return { vault, user: null };
    }

    // Get full user data from database
    try {
      const user = await db.findUserInfoByUsername(authToken.username);
      return { vault, user };
    } catch {
      // delete cookie
      cookies.set(AUTH_COOKIE_NAME, "", { path: "/" });
      return { vault, user: null };
    }
  } catch (err) {
    console.error(err);
    error(500, "internal server error");
  }
};
