<script lang="ts">
  import { page } from "$app/state";
  import { getUsers, type User } from "$lib/db";
  import { onMount } from "svelte";

  const username = $derived(page.params.username);

  let user: User | undefined = $state();
  let loading = $state(true);

  onMount(() => {
    user = getUsers().find((u) => u.username === username);
    if (!user) {
      loading = false;
      return;
    }

    loading = false;
  });
</script>

<div class="container mx-auto p-4">
  {#if !loading}
    {#if user}
      <div class="flex flex-col">
        <div class="avatar flex flex-row h-24 gap-4">
          <div class="w-24 rounded-full">
            <img
              alt="{user.username} Profile Picture"
              src={user.profilePictureUrl}
            />
          </div>
          <div class="flex flex-col content-center w-full">
            <div class="text-4xl font-bold">{user.username}</div>
          </div>
        </div>
        <p>{user.bio}</p>
        <!-- {#each levels as level, index}
      <div class="card bg-base-200 w-full shadow-sm">
        <div class="card-body">
          <h2 class="card-title">#{index + 1} - {level.name}</h2>
        </div>
      </div>
    {/each} -->
      </div>
    {:else}
      <div class="hero min-h-full">
        <div class="hero-content text-center">
          <div class="max-w-md">
            <h1 class="text-5xl font-bold">Hello there</h1>
            <p class="py-6">User doesn't exist.</p>
          </div>
        </div>
      </div>
    {/if}
  {:else}
    <span class="loading loading-ball loading-lg"></span>
  {/if}
</div>
