import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import {
  verifyPassword,
  isValidEmail,
  generateToken,
  cookieOptions,
} from "$lib/server/auth/utils";
import Database from "$lib/server/database";
import { COOKIE_NAME } from "$lib/constants";

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const { login, password } = await request.json();

    // Validate required fields
    if (!login || !password) {
      return json(
        { success: false, error: "Email/username and password are required" },
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
      return json(
        { success: false, error: "Invalid credentials" },
        { status: 401 },
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      return json(
        { success: false, error: "Invalid credentials" },
        { status: 401 },
      );
    }

    // Generate JWT token
    const token = generateToken(user);

    // Set cookie
    cookies.set(COOKIE_NAME, token, cookieOptions);

    // Return success (don't include password hash)
    return json({
      success: true,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
};
