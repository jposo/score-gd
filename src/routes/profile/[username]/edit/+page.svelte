<script lang="ts">
  import { enhance } from "$app/forms";
  import { goto } from "$app/navigation";
  import type { PageData, ActionData } from "./$types";

  let { data, form }: { data: PageData; form: ActionData } = $props();

  let bio = $state(data.user.bio || "");
  let profilePictureUrl = $state(data.user.profile_picture_url || "");
  let loading = $state(false);

  // Update form values if there was an error
  $effect(() => {
    if (form?.bio !== undefined) {
      bio = form.bio;
    }
    if (form?.profilePictureUrl !== undefined) {
      profilePictureUrl = form.profilePictureUrl;
    }
  });

  function handleSubmit() {
    loading = true;
    return async ({ update }) => {
      await update();
      loading = false;

      // If successful, redirect to profile
      if (form?.success) {
        goto(`/profile/${data.user.username}`);
      }
    };
  }

  function handleCancel() {
    goto(`/profile/${data.user.username}`);
  }
</script>

<svelte:head>
  <title>Edit Profile - {data.user.username} - Loggd</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <div class="max-w-2xl mx-auto">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-base-content mb-2">Edit Profile</h1>
      <p class="text-base-content/70">Update your profile information</p>
    </div>

    <!-- Success Message -->
    {#if form?.success}
      <div class="alert alert-success mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="stroke-current shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>{form.message}</span>
      </div>
    {/if}

    <!-- Error Message -->
    {#if form?.error}
      <div class="alert alert-error mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="stroke-current shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>{form.error}</span>
      </div>
    {/if}

    <!-- Edit Form -->
    <div class="bg-base-200 rounded-lg shadow-lg p-6">
      <form method="POST" use:enhance={handleSubmit} class="space-y-6">
        <!-- Current Profile Picture Preview -->
        <div class="form-control">
          <label class="label" for="profile-preview">
            <span class="label-text font-medium">Current Profile Picture</span>
          </label>
          <div class="flex items-center gap-4">
            <div class="avatar">
              <div class="w-16 h-16 rounded-full">
                <img
                  src={profilePictureUrl ||
                    "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"}
                  alt={data.user.username}
                  class="w-full h-full object-cover"
                />
              </div>
            </div>
            <div>
              <p class="text-sm text-base-content/70">
                Current profile picture
              </p>
            </div>
          </div>
        </div>

        <!-- Profile Picture URL -->
        <fieldset class="fieldset w-full">
          <legend class="fieldset-legend">Pick a profile picture</legend>
          <input type="file" disabled={loading} class="file-input" />
          <label class="label">Optional - Max size 1MB</label>
        </fieldset>
        <!-- <input
            id="profile_picture_url"
            name="profile_picture_url"
            type="url"
            class="input input-bordered w-full"
            placeholder="https://example.com/your-profile-picture.jpg"
            bind:value={profilePictureUrl}
            disabled={loading}
          />
          <label class="label">
            <span class="label-text-alt text-base-content/50">
              Enter a URL to an image file (JPG, PNG, etc.)
            </span>
          </label> -->

        <!-- Bio -->
        <fieldset class="fieldset w-full">
          <legend class="fieldset-legend">Bio {bio.length}/200</legend>
          <textarea
            name="bio"
            bind:value={bio}
            class="textarea w-full"
            maxlength="200"
            placeholder="Tell people about yourself..."
            disabled={loading}
          ></textarea>
        </fieldset>

        <!-- Read-only fields for reference -->
        <div class="divider">Account Information</div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <fieldset class="fieldset">
            <legend class="fieldset-legend">Username</legend>
            <input
              type="text"
              value={data.user.username}
              class="input"
              disabled
            />
            <p class="label">Cannot be changed</p>
          </fieldset>

          <fieldset class="fieldset">
            <legend class="fieldset-legend">Email</legend>
            <input
              type="email"
              value={data.user.email}
              class="input"
              disabled
            />
            <p class="label">Cannot be changed</p>
          </fieldset>
        </div>

        <!-- Form Actions -->
        <div class="flex flex-col sm:flex-row gap-4 pt-4">
          <button
            type="submit"
            class="btn btn-primary flex-1"
            class:loading
            disabled={loading}
          >
            {#if loading}
              Saving Changes...
            {:else}
              Save Changes
            {/if}
          </button>

          <button
            type="button"
            class="btn btn-ghost flex-1"
            onclick={handleCancel}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>

    <!-- Danger Zone -->
    <div class="bg-base-200 rounded-lg shadow-lg p-6 mt-8">
      <h3 class="text-lg font-semibold text-error mb-4">Danger Zone</h3>
      <p class="text-base-content/70 mb-4">
        Need to change your password or delete your account? Contact support for
        assistance.
      </p>
      <div class="flex flex-wrap gap-2">
        <button class="btn btn-outline btn-sm" disabled>
          Change Password
        </button>
        <button class="btn btn-outline btn-error btn-sm" disabled>
          Delete Account
        </button>
      </div>
      <p class="text-xs text-base-content/50 mt-2">
        These features are coming soon
      </p>
    </div>
  </div>
</div>
