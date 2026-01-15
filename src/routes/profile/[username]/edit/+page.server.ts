import type { PageServerLoad, Actions } from "./$types";
import { requireAuth } from "$lib/server/auth/middleware";
import Database from "$lib/server/db/instance";
import { fail } from "@sveltejs/kit";
import * as z from "zod";

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

export const load: PageServerLoad = async (event) => {
  const user = await requireAuth(event);

  return { user };
};

export const actions: Actions = {
  default: async (event) => {
    const { request } = event;

    // Ensure user is authenticated
    const user = await requireAuth(event);

    try {
      const form = await request.formData();

      const result = UpdateUser.safeParse({
        bio: form.get("bio") ?? null,
        profilePicture: form.get("profile_picture") ?? null,
      });

      if (!result.success) {
        return fail(400, {
          message: z.treeifyError(result.error) || "Invalid input",
        });
      }

      const data = result.data;

      const updatedUser = await Database.instance.updateUser(user.id, {
        bio: data.bio,
      });

      if (!updatedUser) {
        return fail(500, { message: "failed to update profile" });
      }

      return {
        success: true,
        message: "profile updated successfully",
      };
    } catch (error) {
      console.error("profile update error:", error);
      return fail(500, {
        error: "internal server error",
      });
    }
  },
};
