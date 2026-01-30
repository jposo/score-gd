import type { PageServerLoad, Actions } from "./$types";
import { requireAuth } from "$lib/server/auth/middleware";
import db from "$lib/server/db/instance";
import { fail } from "@sveltejs/kit";
import { z } from "zod";
import winston from "winston";

const UpdateUser = z.object({
  bio: z.string().max(500).nullable(),
  profilePicture: z
    .instanceof(File, { message: "please upload a valid image" })
    .refine((file) => file.size <= 1024 * 200, {
      message: "file size must be less than 200 KB",
    })
    .refine(
      (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      { message: "file type must be jpeg, png or webp" },
    ),
});

export const load: PageServerLoad = async ({ cookies, url }) => {
  const user = await requireAuth(cookies, url);

  return { user };
};

export const actions: Actions = {
  default: async ({ request, cookies, url }) => {
    const user = await requireAuth(cookies, url);
    try {
      const form = await request.formData();

      const result = UpdateUser.safeParse({
        bio: form.get("bio") ?? null,
        profilePicture: form.get("profile_picture") ?? null,
      });

      if (!result.success) {
        return fail(400, {
          message: "invalid input",
          error: z.treeifyError(result.error),
        });
      }

      const data = result.data;

      const updatedUser = await db.updateUser(user.id, {
        bio: data.bio,
      });

      if (!updatedUser) {
        return fail(500, { message: "failed to update profile" });
      }

      winston.info("profile info updated", { user: updatedUser });
      return {
        success: true,
        message: "profile updated successfully",
      };
    } catch (error) {
      winston.error("profile update error", { error });
      return fail(500, { message: "internal server error" });
    }
  },
};
