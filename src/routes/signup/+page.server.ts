import type { PageServerLoad, Actions } from "./$types";
import { redirectIfAuthenticated } from "$lib/server/auth/middleware";
import { z } from "zod";
import { fail } from "@sveltejs/kit";
import {
  cookieOptions,
  generateToken,
  hashPassword,
  isValidPassword,
} from "$lib/server/auth/utils";
import db from "$lib/server/db/instance";
import { AUTH_COOKIE_NAME } from "$lib/constants";
import winston from "winston";

const Register = z.object({
  username: z
    .string()
    .regex(/^[a-zA-Z0-9_-]+$/)
    .min(3)
    .max(20),
  email: z.email(),
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
      const result = Register.safeParse(entries);

      if (!result.success) {
        return fail(400, { message: "invalid input" });
      }

      const data = result.data;

      const passwordValidation = isValidPassword(data.password);
      if (!passwordValidation.valid) {
        return fail(400, {
          message: passwordValidation.message ?? "invalid password",
        });
      }

      const existingEmailUser = await db.findUserByEmail(data.email);
      if (existingEmailUser) {
        return fail(400, { message: "email already in use" });
      }

      const existingUsernameUser = await db.findUserByUsername(data.username);
      if (existingUsernameUser) {
        return fail(400, { message: "username already in use" });
      }

      const passwordHash = await hashPassword(data.password);

      const user = await db.insertUser({
        username: data.username,
        email: data.email,
        passwordHash,
      });

      if (!user) {
        winston.error("failed to create account", { email: data.email });
        return fail(500, { message: "failed to create account" });
      }

      const token = generateToken({
        id: user.id,
        username: user.username,
        extraRoles: user.extraRoles ?? [],
      });

      cookies.set(AUTH_COOKIE_NAME, token, cookieOptions);
      winston.info("user created successfully", { userId: user.id });
      return { success: true, message: "account created successfully" };
    } catch (err) {
      winston.error("failed to create account", { error: err });
      return fail(500, { message: "internal server error" });
    }
  },
};
