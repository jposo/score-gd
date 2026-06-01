import { redirect } from "@sveltejs/kit";
import db from "$lib/server/db/instance";
import { rolesEnum } from "$lib/server/db/schema";
import type { RequestEvent } from "@sveltejs/kit";

const roles = rolesEnum.enumValues;
type Role = (typeof roles)[number];

function getLoginRedirectUrl(currentPath: string, redirectTo?: string) {
  const redirectTarget = redirectTo ? redirectTo : currentPath;
  return `/login?redirectTo=${encodeURIComponent(redirectTarget)}`;
}

async function getUser(event: RequestEvent) {
  const {
    data: { user },
  } = await event.locals.supabase.auth.getUser();
  if (!user) return null;
  return db.findUserById(user.id);
}

export async function requireAuth(event: RequestEvent, redirectTo?: string) {
  const user = await getUser(event);
  if (!user) {
    throw redirect(302, getLoginRedirectUrl(event.url.pathname, redirectTo));
  }
  return user;
}

export async function requireAuthWithRoles(
  event: RequestEvent,
  roles: Role[],
  redirectTo?: string,
) {
  const user = await requireAuth(event, redirectTo);
  if (!user.roles?.some((role) => roles.includes(role))) {
    throw redirect(302, redirectTo || "/");
  }
  return user;
}

export async function redirectIfAuthenticated(
  event: RequestEvent,
  redirectTo = "/",
) {
  const user = await getUser(event);
  if (user) {
    throw redirect(302, redirectTo);
  }
}

export async function getAuthenticatedUser(event: RequestEvent) {
  return getUser(event);
}
