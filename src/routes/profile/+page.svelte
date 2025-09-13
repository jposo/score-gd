<script lang="ts">
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  function formatDate(dateString: string | Date) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
</script>

<svelte:head>
  <title>Profile - {data.user.username} - Loggd</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <div class="max-w-4xl mx-auto flex flex-col gap-4">
    <!-- Profile Header -->
    <div class="bg-base-200 shadow p-6 rounded-lg">
      <div class="flex flex-col md:flex-row items-center md:items-start gap-6">
        <!-- Profile Picture -->
        <div
          class={data.user.profile_picture_url
            ? ""
            : "avatar avatar-placeholder"}
        >
          <div class="w-32 h-32 rounded-full text-neutral-content bg-neutral">
            {#if data.user.profile_picture_url}
              <img
                src={data.user.profile_picture_url}
                alt={data.user.username}
                class="w-full h-full object-cover"
              />
            {:else}
              <span class="text-3xl">{data.user.username.charAt(0)}</span>
            {/if}
          </div>
        </div>

        <!-- Profile Info -->
        <div class="flex-1 text-center md:text-left">
          <h1 class="text-3xl font-bold text-base-content mb-2">
            {data.user.username}
          </h1>

          <p class="text-base-content/70 mb-4">
            Member since {formatDate(data.user.created_at)}
          </p>

          <p class="text-base-content/80 mb-4">
            {data.user.bio ? data.user.bio : "No bio added yet."}
          </p>

          <div class="flex flex-wrap gap-2 justify-center md:justify-start">
            <a href="/profile/edit" class="btn btn-primary btn-sm">
              Edit Profile
            </a>
            <button class="btn btn-outline btn-sm"> View Progress </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <!-- <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-"> -->
    <div class="stats shadow bg-base-200 w-full rounded-lg">
      <div class="stat">
        <div class="stat-title">Levels Completed</div>
        <div class="stat-value text-primary">0</div>
        <div class="stat-desc">No completions yet</div>
      </div>

      <div class="stat">
        <div class="stat-title">Demons Beaten</div>
        <div class="stat-value text-secondary">0</div>
        <div class="stat-desc">No demons yet</div>
      </div>

      <div class="stat">
        <div class="stat-title">Reviews Written</div>
        <div class="stat-value text-accent">0</div>
        <div class="stat-desc">No reviews yet</div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="bg-base-200 shadow p-6 rounded-lg">
      <h2 class="text-2xl font-bold text-base-content mb-4">Recent Activity</h2>

      <div class="text-center py-12">
        <div class="text-6xl mb-4">📊</div>
        <h3 class="text-lg font-semibold text-base-content/70 mb-2">
          No activity yet
        </h3>
        <p class="text-base-content/50 mb-4">
          Start tracking your Geometry Dash progress to see activity here!
        </p>
        <a href="/level" class="btn btn-primary"> Browse Levels </a>
      </div>
    </div>
  </div>
</div>
