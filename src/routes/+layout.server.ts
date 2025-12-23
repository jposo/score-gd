import type { LayoutServerLoad } from "./$types";
import { getTokenFromCookies, verifyToken } from "$lib/server/auth/utils";
import { error } from "@sveltejs/kit";
import Database from "$lib/server/db/index";
import { getCurrentDay } from "$lib/server/index";

const db = Database.instance;

export const load: LayoutServerLoad = async ({ cookies }) => {
  try {
    // Get token from cookies
    const token = getTokenFromCookies(cookies);
    const vault = (await db.findVault(getCurrentDay())).map((d) => d.day);

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
    try {
      const user = await db.findUserInfoByUsername(authToken.username);
      return { vault, user };
    } catch (error) {
      console.error(error);
      return { vault, user: null };
    }
  } catch (err) {
    console.error(err);
    error(500, "Internal Server Error");
  }
};
