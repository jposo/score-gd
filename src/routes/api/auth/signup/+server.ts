import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import {
  hashPassword,
  isValidEmail,
  isValidPassword,
  generateToken,
  cookieOptions,
} from "$lib/server/auth/utils";
import Database from "$lib/server/database";

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const { username, email, password } = await request.json();

    // Validate required fields
    if (!username || !email || !password) {
      return json(
        { error: "Username, email, and password are required" },
        { status: 400 },
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return json(
        { error: "Please enter a valid email address" },
        { status: 400 },
      );
    }

    // Validate password strength
    const passwordValidation = isValidPassword(password);
    if (!passwordValidation.valid) {
      return json({ error: passwordValidation.message }, { status: 400 });
    }

    // Validate username (basic validation)
    if (username.length < 3 || username.length > 30) {
      return json(
        { error: "Username must be between 3 and 30 characters" },
        { status: 400 },
      );
    }

    // Check if username contains only valid characters
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(username)) {
      return json(
        {
          error:
            "Username can only contain letters, numbers, hyphens, and underscores",
        },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingEmailUser = await Database.instance.getUserByEmail(email);
    if (existingEmailUser) {
      return json(
        { error: "A user with this email already exists" },
        { status: 409 },
      );
    }

    const existingUsernameUser =
      await Database.instance.getUserByUsername(username);
    if (existingUsernameUser) {
      return json({ error: "This username is already taken" }, { status: 409 });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await Database.instance.insertUser({
      username,
      email,
      password_hash: passwordHash,
    });
    if (!user) {
      return json({ error: "Failed to create user account" }, { status: 500 });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Set cookie
    cookies.set("auth-token", token, cookieOptions);

    // Return success (don't include password hash)
    return json({
      message: "Account created successfully",
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
    console.error("Signup error:", error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
};
