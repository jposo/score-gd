import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import {
  verifyPassword,
  isValidEmail,
  generateToken,
  cookieOptions,
} from "$lib/auth/utils";
import Database from "$lib/server/database";

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const { login, password } = await request.json();

    // Validate required fields
    if (!login || !password) {
      return json(
        { error: "Email/username and password are required" },
        { status: 400 },
      );
    }

    // Determine if login is email or username
    const isEmail = isValidEmail(login);
    let user;

    if (isEmail) {
      user = await Database.instance.getUserByEmail(login);
    } else {
      user = await Database.instance.getUserByUsername(login);
    }

    // Check if user exists
    if (!user) {
      return json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      return json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Set cookie
    cookies.set("auth-token", token, cookieOptions);

    // Return success (don't include password hash)
    return json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        profile_picture_url: user.profile_picture_url,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
};
