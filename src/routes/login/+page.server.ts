import type { PageServerLoad, Actions } from "./$types";
import { redirectIfAuthenticated } from "$lib/server/auth/middleware";
import { z } from "zod";
import { fail } from "@sveltejs/kit";
import db from "$lib/server/db/instance";
import {
  cookieOptions,
  generateToken,
  verifyPassword,
} from "$lib/server/auth/utils";
import { AUTH_COOKIE_NAME } from "$lib/constants";

const Login = z.object({
  login: z.union([
    z.email().transform((val) => ({ type: "email" as const, value: val })),
    z.string().transform((val) => ({ type: "username" as const, value: val })),
  ]),
  password: z.string().min(8),
});

export const load: PageServerLoad = async ({ cookies, url }) => {
  await redirectIfAuthenticated(cookies);

  return {};
};

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    try {
      const form = await request.formData();
      const entries = Object.fromEntries(form);

      const result = Login.safeParse(entries);

      if (!result.success) {
        return fail(400, { message: "invalid input" });
      }

      const data = result.data;

      const user =
        data.login.type === "email"
          ? await db.findUserByEmail(data.login.value)
          : await db.findUserByUsername(data.login.value);

      if (!user) {
        return fail(401, { message: "invalid credentials" });
      }

      const isPasswordValid = await verifyPassword(
        data.password,
        user.passwordHash,
      );
      if (!isPasswordValid) {
        return fail(401, { message: "invalid credentials" });
      }

      const token = generateToken({
        id: user.id,
        username: user.username,
        extraRoles: user.extraRoles ?? [],
      });

      cookies.set(AUTH_COOKIE_NAME, token, cookieOptions);
      return { success: true, message: "successfully logged in" };
    } catch (err) {
      console.error(err);
      return fail(500, { message: "internal server error" });
    }
  },
};
