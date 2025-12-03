<script lang="ts">
  import type { PageData } from "./$types";
  import { Icon, Check, ListBullet, Clock, Pencil } from "svelte-hero-icons";
  import Activity from "$lib/components/Activity.svelte";
  import Alert from "$lib/components/Alert.svelte";
  import List from "$lib/components/ListDragAndDrop.svelte";
  import { formatDate, equalArrayOfObjectsWithIds } from "$lib/tools/utils";
  import type { ListItem } from "$lib/shared/types";

  let { data }: { data: PageData } = $props();

  let success: string | undefined = $state();
  let error: string | undefined = $state();
  const alertDuration = 2000;

  let editMode = $state(false);
  let lastState: ListItem[] | undefined = undefined;
  let firstState: ListItem[] | undefined = undefined;

  function handleDrop(newItems: ListItem[]) {
    // if (lastState === undefined) {
    //   firstState = newItems;
    // }
    lastState = newItems;
  }

  async function updateListPlacement() {
    if (!editMode) {
      firstState = data.user.list!;
    }

    editMode = !editMode;
    if (!editMode) {
      if (lastState === undefined) return;
      if (equalArrayOfObjectsWithIds(firstState || [], lastState)) return;
      const form = new FormData();
      form.append("list", JSON.stringify(lastState));

      try {
        const response = await fetch(`/profile/${data.user!.id}`, {
          method: "POST",
          body: form,
        });

        if (response.ok) {
          success = "List updated successfully";
        } else {
          error = "Failed to update list";
        }
      } catch (error) {
        error = "An error occurred while updating the list";
      } finally {
        lastState = undefined;
        setTimeout(() => {
          success = undefined;
          error = undefined;
        }, alertDuration);
      }
    }
  }
</script>

<svelte:head>
  <title>Profile - {data.user?.username} - loggd</title>
</svelte:head>

{#if success}
  <Alert message={success} type="success" duration={alertDuration} />
{/if}
{#if error}
  <Alert message={error} type="error" duration={alertDuration} />
{/if}

{#if data.user}
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto flex flex-col gap-4">
      <!-- Profile Header -->
      <div class="bg-base-200 shadow p-6 rounded-lg">
        <div
          class="flex flex-col md:flex-row items-center md:items-start gap-6"
        >
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

            {#if data.isUser}
              <div class="flex flex-wrap gap-2 justify-center md:justify-start">
                <a href="/profile/edit" class="btn btn-primary btn-sm">
                  Edit Profile
                </a>
                <button class="btn btn-outline btn-sm"> View Progress </button>
              </div>
            {/if}
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <!-- <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-"> -->
      <div class="stats shadow bg-base-200 w-full rounded-lg">
        <div class="stat">
          <div class="stat-title">Average Rating</div>
          <div class="stat-value text-secondary">
            {data.user.average_rating
              ? data.user.average_rating.toFixed(1)
              : "N/A"}
          </div>
          <!-- <div class="stat-desc">No demons yet</div> -->
        </div>

        <div class="stat">
          <div class="stat-title">Levels Completed</div>
          <div class="stat-value text-primary">
            {data.user.levels_completed}
          </div>
          <!-- <div class="stat-desc">Pump those numbers up!</div> -->
        </div>

        <div class="stat">
          <div class="stat-title">Reviews Written</div>
          <div class="stat-value text-accent">{data.user.reviews_written}</div>
          <!-- <div class="stat-desc">No reviews yet</div> -->
        </div>
      </div>

      <div class="bg-base-200 shadow p-6 rounded-lg">
        <div class="tabs tabs-lift">
          <label class="tab">
            <input type="radio" name="user_activity" checked={true} />
            <Icon src={Clock} class="size-4 me-2" />
            Recent Activity
          </label>
          <div class="tab-content bg-base-100 border-base-300 p-6">
            <div class="text-center">
              {#if !data.user.recent_activity || data.user.recent_activity.length === 0}
                <div class="text-6xl mb-4">📊</div>
                <h3 class="text-lg font-semibold text-base-content/70 mb-2">
                  No activity yet
                </h3>
                {#if data.isUser}
                  <p class="text-base-content/50 mb-4">
                    Start tracking your Geometry Dash progress to see activity
                    here!
                  </p>
                  <a href="/levels" class="btn btn-primary"> Browse Levels </a>
                {/if}
              {:else}
                {#each data.user.recent_activity as a}
                  <Activity
                    link={`/levels/${a.level_id}`}
                    title={a.level_name}
                    rating={a.enjoyment_rating}
                    status={a.status}
                    createdAt={new Date(a.created_at)}
                    review={a.review}
                  />
                  <div class="divider"></div>
                {/each}
              {/if}
            </div>
          </div>

          <label class="tab">
            <input type="radio" name="user_activity" />
            <Icon src={ListBullet} class="size-4 me-2" />
            List
          </label>
          <div class="tab-content bg-base-100 border-base-300 p-6">
            {#if data.isUser && data.user.list && data.user.list.length > 0}
              <div class="flex justify-end">
                <button
                  class="btn btn-sm btn-square"
                  onclick={updateListPlacement}
                >
                  {#if editMode}
                    <Icon src={Check} class="size-[1.2em]" />
                  {:else}
                    <Icon src={Pencil} class="size-[1.2em]" />
                  {/if}
                </button>
              </div>
            {/if}
            {#if data.user.list && data.user.list.length > 0}
              <List items={data.user.list!} {editMode} onDrop={handleDrop} />
            {:else}
              <div class="text-center">
                <p class="text-base-content/50 mb-4">
                  No levels completed yet.
                </p>
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
{:else}
  <div class="container mx-auto p-4">
    <div class="hero min-h-full">
      <div class="hero-content text-center">
        <div class="max-w-md">
          <h1 class="text-5xl font-bold">Hello there</h1>
          <p class="py-6">User doesn't exist.</p>
        </div>
      </div>
    </div>
  </div>
{/if}
