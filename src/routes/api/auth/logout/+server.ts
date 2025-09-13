import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = ({ cookies }) => {
  try {
    // Clear the auth token cookie
    cookies.set("auth-token", "", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 0, // Expire immediately
      path: "/",
    });

    return json({
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
};
