import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { dev } from "$app/environment";
import type { Cookies } from "@sveltejs/kit";
import { COOKIE_NAME } from "../../constants";
import { type User } from "../../db-types";

// Use environment variable or fallback to dev key
const JWT_SECRET = import.meta.env.VITE_JWT_SECRET;

export interface AuthToken {
  userId: number;
  username: string;
  role: string;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

// Verify password
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// Generate JWT token
export function generateToken(user: User): string {
  const payload: AuthToken = {
    userId: user.id,
    username: user.username,
    role: user.role!,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d", // Token expires in 7 days
  });
}

// Verify JWT token
export function verifyToken(token: string): AuthToken | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthToken;
  } catch (_) {
    return null;
  }
}

// Extract token from request cookies
export function getTokenFromCookies(cookies: Cookies): string | null {
  return cookies.get(COOKIE_NAME) || null;
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate password strength
export function isValidPassword(password: string): {
  valid: boolean;
  message?: string;
} {
  if (password.length < 8) {
    return {
      valid: false,
      message: "Password must be at least 8 characters long",
    };
  }

  if (!/(?=.*[a-z])/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one lowercase letter",
    };
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one uppercase letter",
    };
  }

  if (!/(?=.*\d)/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one number",
    };
  }

  return { valid: true };
}

// Cookie options
export const cookieOptions = {
  httpOnly: true,
  secure: !dev, // Use secure cookies in production
  sameSite: "strict" as const,
  maxAge: 60 * 60 * 24 * 7, // 7 days
  path: "/",
};
