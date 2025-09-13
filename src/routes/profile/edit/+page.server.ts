import type { PageServerLoad, Actions } from "./$types";
import { requireAuth } from "$lib/auth/middleware";
import Database from "$lib/server/database";
import { fail } from "@sveltejs/kit";

export const load: PageServerLoad = async (event) => {
  // Require authentication for profile edit page
  const user = await requireAuth(event);

  // Return user data for the edit form
  return {
    user,
  };
};

export const actions: Actions = {
  default: async (event) => {
    const { request } = event;

    // Ensure user is authenticated
    const user = await requireAuth(event);

    try {
      const data = await request.formData();
      const bio = data.get("bio") as string;
      const profilePictureUrl = data.get("profile_picture_url") as string;

      // Basic validation
      if (bio && bio.length > 500) {
        return fail(400, {
          error: "Bio must be 500 characters or less",
          bio,
          profilePictureUrl,
        });
      }

      // Update user in database
      const updates: { bio?: string; profile_picture_url?: string } = {};

      if (bio !== undefined) {
        updates.bio = bio.trim() || null;
      }

      if (profilePictureUrl !== undefined) {
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
