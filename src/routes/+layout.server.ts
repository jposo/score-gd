import type { LayoutServerLoad } from "./$types";
import { getTokenFromCookies, verifyToken } from "$lib/server/auth/utils";
import Database from "$lib/server/database";
import { error } from "@sveltejs/kit";
import { fetchVault } from "$lib/server/db";
import { getCurrentDay } from "$lib/server/index";

export const load: LayoutServerLoad = async ({ cookies }) => {
  try {
    // Get token from cookies
    const token = getTokenFromCookies(cookies);
    const vault = (await fetchVault(getCurrentDay())).map((d) => d.day);

    if (!token) {
      console.log("No token");
      return { vault, user: null };
    }

    // Verify token
    const authToken = verifyToken(token);
    if (!authToken) {
      console.log("Invalid token");
      return { vault, user: null };
    }

    // Get full user data from database
    const user = await Database.instance.getUserInfo(authToken.username);

    return { vault, user };
  } catch (err) {
    console.error(err);
    error(500, "Internal Server Error");
  }
};
