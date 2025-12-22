import type { PageServerLoad, Actions } from "./$types";
import { requireAuth } from "$lib/server/auth/middleware";
import Database from "$lib/server/db/index";
import { fail } from "@sveltejs/kit";

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
      const data = await request.formData();
      const bio = data.get("bio") as string | null;
      const profilePictureUrl = data.get("profile_picture_url") as
        | string
        | null;

      // Basic validation
      if (bio && bio.length > 500) {
        return fail(400, {
          error: "Bio must be 500 characters or less",
          bio,
          profilePictureUrl,
        });
      }

      // Update user in database
      const updates: {
        bio?: string | null;
        profile_picture_url?: string | null;
      } = {};

      if (bio != null) {
        updates.bio = bio.trim() || null;
      }

      if (profilePictureUrl !== null) {
        updates.profile_picture_url = profilePictureUrl.trim() || null;
      }

      const updatedUser = await Database.instance.updateUser(user.id, updates);

      if (!updatedUser) {
        return fail(500, {
          error: "Failed to update profile",
          bio,
          profilePictureUrl,
        });
      }

      return {
        success: true,
        message: "Profile updated successfully",
        user: updatedUser,
      };
    } catch (error) {
      console.error("Profile update error:", error);
      return fail(500, {
        error: "Internal server error",
      });
    }
  },
};
