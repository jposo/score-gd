import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import {
  hashPassword,
  isValidEmail,
  isValidPassword,
  generateToken,
  cookieOptions,
} from "$lib/server/auth/utils";
import { COOKIE_NAME } from "$lib/constants";
import Database from "$lib/server/db/index";

const db = Database.instance;

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return json(
        {
          success: false,
          message: "Username, email, and password are required",
        },
        { status: 400 },
      );
    }

    if (!isValidEmail(email)) {
      return json(
        { success: false, message: "Please enter a valid email address" },
        { status: 400 },
      );
    }

    // Validate password strength
    const passwordValidation = isValidPassword(password);
    if (!passwordValidation.valid) {
      return json(
        { success: false, message: passwordValidation.message },
        { status: 400 },
      );
    }

    if (username.length < 3 || username.length > 30) {
      return json(
        {
          success: false,
          message: "Username must be between 3 and 30 characters",
        },
        { status: 400 },
      );
    }

    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(username)) {
      return json(
        {
          success: false,
          message:
            "Username can only contain letters, numbers, hyphens, and underscores",
        },
        { status: 400 },
      );
    }

    const existingEmailUser = await db.findUserByEmail(email);
    if (existingEmailUser) {
      return json(
        { success: false, message: "A user with this email already exists" },
        { status: 409 },
      );
    }

    const existingUsernameUser = await db.findUserByUsername(username);
    if (existingUsernameUser) {
      return json(
        { success: false, message: "This username is already taken" },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await Database.instance.insertUser({
      username,
      email,
      passwordHash: passwordHash,
    });
    if (!user) {
      error(500, "Failed to create user account");
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      username: user.username,
      extraRoles: user.extraRoles ?? [],
    });

    // Set cookie
    cookies.set(COOKIE_NAME, token, cookieOptions);

    return json({
      success: true,
      message: "Account created successfully",
    });
  } catch (err) {
    console.error("Signup error:", err);
    error(500, "Internal server error");
  }
};
