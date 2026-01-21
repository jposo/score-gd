import { redirect } from "@sveltejs/kit";
import { getTokenFromCookies, verifyToken } from "./utils";
import Database from "$lib/server/db/instance";
import { rolesEnum } from "$lib/server/db/schema";
import type { Cookies } from "@sveltejs/kit";
import { AUTH_COOKIE_NAME } from "../../constants";

const db = Database.instance;

const roles = rolesEnum.enumValues;
type Role = (typeof roles)[number];

const invalidCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
  maxAge: 0,
  path: "/",
} as const;

function getLoginRedirectUrl(redirectTo: string | undefined, currentPath: string) {
  return redirectTo
    ? `/login?redirectTo=${encodeURIComponent(redirectTo)}`
    : `/login?redirectTo=${encodeURIComponent(currentPath)}`;
}

async function validateTokenAndFetchUser(cookies: Cookies) {
  const token = getTokenFromCookies(cookies);
  if (!token) {
    return null;
  }

  const authToken = verifyToken(token);
  if (!authToken) {
    cookies.delete(AUTH_COOKIE_NAME, invalidCookieOptions);
    return null;
  }

  const user = await db.findUserInfoByUsername(authToken.username);
  if (!user) {
    cookies.delete(AUTH_COOKIE_NAME, invalidCookieOptions);
    return null;
  }

  return user;
}

export async function requireAuth(cookies: Cookies, url: URL, redirectTo?: string) {
  const user = await validateTokenAndFetchUser(cookies);

  if (!user) {
    const loginUrl = getLoginRedirectUrl(redirectTo, url.pathname);
    throw redirect(302, loginUrl);
  }

  return user;
}

export async function requireAuthWithRoles(cookies: Cookies, url: URL, roles: Role[], redirectTo?: string) {
  const user = await requireAuth(cookies, url, redirectTo);
  if (!user.roles?.some((role) => roles.includes(role))) {
    throw redirect(302, redirectTo || "/");
  }

  return user;
}

export async function redirectIfAuthenticated(cookies: Cookies, redirectTo = "/") {
  const user = await validateTokenAndFetchUser(cookies);

  if (user) {
    throw redirect(302, redirectTo);
  }
}

export async function getAuthenticatedUser(cookies: Cookies) {
  return validateTokenAndFetchUser(cookies);
}
