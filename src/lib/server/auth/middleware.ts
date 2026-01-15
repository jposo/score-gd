import { redirect } from "@sveltejs/kit";
import { getTokenFromCookies, verifyToken } from "./utils";
import Database from "$lib/server/db/instance";
import type { RequestEvent } from "@sveltejs/kit";
import { AUTH_COOKIE_NAME } from "../../constants";

const db = Database.instance;

/**
 * Middleware function to protect routes that require authentication
 * @param event - The SvelteKit request event
 * @param redirectTo - Optional redirect path after login (defaults to current path)
 * @returns User object if authenticated, throws redirect if not
 */
export async function requireAuth(event: RequestEvent, redirectTo?: string) {
  const { cookies, url } = event;

  // Get token from cookies
  const token = getTokenFromCookies(cookies);

  if (!token) {
    const loginUrl = redirectTo
      ? `/login?redirectTo=${encodeURIComponent(redirectTo)}`
      : `/login?redirectTo=${encodeURIComponent(url.pathname)}`;
    throw redirect(302, loginUrl);
  }

  // Verify token
  const authToken = verifyToken(token);
  if (!authToken) {
    // Token is invalid, clear it and redirect to login
    cookies.set(AUTH_COOKIE_NAME, "", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    });

    const loginUrl = redirectTo
      ? `/login?redirectTo=${encodeURIComponent(redirectTo)}`
      : `/login?redirectTo=${encodeURIComponent(url.pathname)}`;
    throw redirect(302, loginUrl);
  }

  // Get full user data from database
  const user = await db.findUserInfoByUsername(authToken.username);
  if (!user) {
    // User doesn't exist in database, clear token and redirect
    cookies.set(AUTH_COOKIE_NAME, "", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    });

    const loginUrl = redirectTo
      ? `/login?redirectTo=${encodeURIComponent(redirectTo)}`
      : `/login?redirectTo=${encodeURIComponent(url.pathname)}`;
    throw redirect(302, loginUrl);
  }

  return user;
}

/**
 * Middleware function to protect routes that require authentication and role
 * @param event - The SvelteKit request event
 * @param role - Required role for the route
 * @param redirectTo - Optional redirect path after login (defaults to current path)
 * @returns User object if authenticated, throws redirect if not
 */
export async function requireAuthWithRoles(
  event: RequestEvent,
  roles: string[],
  redirectTo?: string,
) {
  const user = await requireAuth(event, redirectTo);
  if (!(user.roles as string[]).some((role) => roles.includes(role))) {
    throw redirect(302, redirectTo || "/");
  }
  return user;
}

/**
 * Middleware function to redirect authenticated users away from auth pages
 * @param event - The SvelteKit request event
 * @param redirectTo - Where to redirect authenticated users (defaults to '/')
 */
export async function redirectIfAuthenticated(
  event: RequestEvent,
  redirectTo = "/",
) {
  const { cookies } = event;

  // Get token from cookies
  const token = getTokenFromCookies(cookies);

  if (!token) {
    return; // Not authenticated, allow access to the page
  }

  // Verify token
  const authToken = verifyToken(token);
  if (!authToken) {
    return; // Invalid token, allow access to the page
  }

  // Check if user still exists in database
  const user = await db.findUserInfoByUsername(authToken.username);
  if (!user) {
    // User doesn't exist, clear token and allow access
    cookies.set(AUTH_COOKIE_NAME, "", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    });
    return;
  }

  // User is authenticated, redirect away from auth page
  throw redirect(302, redirectTo);
}

/**
 * Get the current authenticated user without redirecting
 * @param event - The SvelteKit request event
 * @returns User object if authenticated, null if not
 */
export async function getAuthenticatedUser(event: RequestEvent) {
  const { cookies } = event;

  // Get token from cookies
  const token = getTokenFromCookies(cookies);

  if (!token) {
    return null;
  }

  // Verify token
  const authToken = verifyToken(token);
  if (!authToken) {
    return null;
  }

  // Get full user data from database
  const user = await db.findUserInfoByUsername(authToken.username);
  return user;
}
