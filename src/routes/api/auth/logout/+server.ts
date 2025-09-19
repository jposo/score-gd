import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { COOKIE_NAME } from "$lib/constants";

export const POST: RequestHandler = ({ cookies }) => {
  try {
    // Clear the auth token cookie
    cookies.set(COOKIE_NAME, "", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 0, // Expire immediately
      path: "/",
    });

    return json({
      success: true,
      message: "Logout successful",
    });
  } catch (err) {
    console.error("Logout error:", err);
    return error(500, "Internal server error");
  }
};
