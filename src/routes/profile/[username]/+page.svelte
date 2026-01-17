<script lang="ts">
  import type { PageData } from "./$types";
  import { Icon, Check, ListBullet, Clock, Pencil } from "svelte-hero-icons";
  import Activity from "$lib/components/Activity.svelte";
  import List from "$lib/components/ListDragAndDrop.svelte";
  import { formatDate, equalArrayOfObjectsWithIds } from "$lib/tools/utils";
  import type { ListItem } from "$lib/shared/types";
  import { toastManager } from "$lib/state/toasts.svelte";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import { enhance } from "$app/forms";

  let { data }: { data: PageData } = $props();

  let editMode = $state(false);
  let lastState = $state<number[]>([]);
  let firstState: number[] | undefined = undefined;

  const tabs = {
    recent: "recent",
    list: "list",
    progress: "progress",
  };

  let tab = $state(tabs.recent);

  onMount(() => {
    if (page.url.hash === "#" + tabs.recent) {
      tab = tabs.recent;
    } else if (page.url.hash === "#" + tabs.list) {
      tab = tabs.list;
    } else if (page.url.hash === "#" + tabs.progress) {
      tab = tabs.progress;
    }
  });

  function handleDrop(newItems: ListItem[]) {
    // if (lastState === undefined) {
    //   firstState = newItems;
    // }
    lastState = newItems.map((item) => item.id);
  }
</script>

<svelte:head>
  <title>profile - {data.user?.username} - loggd</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <div class="max-w-4xl mx-auto flex flex-col gap-4">
    <!-- Profile Header -->
    <div class="bg-base-200 shadow p-6 rounded-lg">
      <div class="flex flex-col md:flex-row items-center md:items-start gap-6">
        <!-- Profile Picture -->
        <div
          class={data.profile.profilePicturePath
            ? ""
            : "avatar avatar-placeholder"}
        >
          <div class="w-32 h-32 rounded-full text-neutral-content bg-neutral">
            {#if data.profile.profilePicturePath}
              <img
                src={data.profile.profilePicturePath}
                alt={data.profile.username}
                class="w-full h-full object-cover"
              />
            {:else}
              <span class="text-3xl">{data.profile.username.charAt(0)}</span>
            {/if}
          </div>
        </div>

        <!-- Profile Info -->
        <div class="flex-1 text-center md:text-left">
          <h1 class="text-3xl font-bold text-base-content mb-2">
            {data.profile.username}
          </h1>

          <p class="text-base-content/70 mb-4">
            member since <b
              >{formatDate(
                data.profile.registeredAt ?? new Date(),
              ).toLowerCase()}</b
            >
          </p>

          <p class="text-base-content/80 mb-4">
            {data.profile.bio ? data.profile.bio : "no bio added yet."}
          </p>

          {#if data.profile.isUser}
            <div class="flex flex-wrap gap-2 justify-center md:justify-start">
              <a
                href="/profile/{data.profile.username}/edit"
                class="btn btn-primary btn-sm"
              >
                edit profile
              </a>
              <button class="btn btn-outline btn-sm"> view progress </button>
            </div>
          {/if}
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <!-- <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-"> -->
    <div class="stats shadow bg-base-200 w-full rounded-lg">
      <div class="stat">
        <div class="stat-title">average score</div>
        <div class="stat-value text-secondary">
          {data.profile.stats.averageScore
            ? data.profile.stats.averageScore.toFixed(1)
            : "n/a"}
        </div>
        <!-- <div class="stat-desc">No demons yet</div> -->
      </div>

      <div class="stat">
        <div class="stat-title">levels completed</div>
        <div class="stat-value text-primary">
          {data.profile.stats.levelsCompleted}
        </div>
        <!-- <div class="stat-desc">Pump those numbers up!</div> -->
      </div>

      <div class="stat">
        <div class="stat-title">reviews written</div>
        <div class="stat-value text-accent">
          {data.profile.stats.reviewsWritten}
        </div>
        <!-- <div class="stat-desc">No reviews yet</div> -->
      </div>
    </div>

    <div class="bg-base-200 shadow p-6 rounded-lg">
      <div class="tabs tabs-lift">
        <label class="tab">
          <input
            type="radio"
            name="user_activity"
            checked={tab === tabs.recent}
            onclick={() => goto("#" + tabs.recent)}
          />
          <Icon src={Clock} class="size-4 me-2" />
          recent activity
        </label>
        <div class="tab-content bg-base-100 border-base-300 p-6">
          <div class="text-center">
            {#if !data.profile.recentActivity || data.profile.recentActivity.length === 0}
              <!-- <div class="text-6xl mb-4">📊</div> -->
              <h3 class="text-lg font-semibold text-base-content/70 mb-2">
                no activity yet
              </h3>
              {#if data.profile.isUser}
                <p class="text-base-content/50 mb-4">
                  start tracking your <span class="font-bold"
                    >geometry dash</span
                  > progress to see activity here!
                </p>
                <a href="/levels" class="btn btn-primary"> browse levels </a>
              {/if}
            {:else}
              {#each data.profile.recentActivity as a}
                <Activity
                  link={`/levels/${a.levelId}`}
                  title={a.details?.name ?? "unknown level"}
                  rating={a.score}
                  status={a.status}
                  createdAt={new Date(a.createdAt)}
                  review={a.review}
                />
                <div class="divider"></div>
              {/each}
            {/if}
          </div>
        </div>

        <label class="tab">
          <input
            type="radio"
            name="user_activity"
            checked={tab === tabs.list}
            onclick={() => goto("#" + tabs.list)}
          />
          <Icon src={ListBullet} class="size-4 me-2" />
          list
        </label>
        <div class="tab-content bg-base-100 border-base-300 p-6">
          {#if data.profile.isUser && data.profile.list && data.profile.list.length > 0}
            <div class="flex justify-end">
              <form
                method="POST"
                use:enhance={() => {
                  console.log(lastState);
                  return async ({ result }) => {
                    console.log(result);
                    if (result.type === "success") {
                      toastManager.add("successfully updated list", "success");
                    } else if (result.type === "failure") {
                      toastManager.add(
                        (result.data?.message as string) ??
                          "error updating list",
                        "error",
                      );
                    } else {
                      toastManager.add("unknown error", "error");
                    }
                  };
                }}
              >
                <input
                  type="hidden"
                  name="list"
                  value={JSON.stringify(lastState)}
                />
                <!-- onclick={updateListPlacement} -->
                <button
                  class="btn btn-sm btn-square"
                  type={editMode ? "button" : "submit"}
                  onclick={() => (editMode = !editMode)}
                >
                  {#if editMode}
                    <Icon src={Check} class="size-[1.2em]" />
                  {:else}
                    <Icon src={Pencil} class="size-[1.2em]" />
                  {/if}
                </button>
              </form>
            </div>
          {/if}
          {#if data.profile.list && data.profile.list.length > 0}
            <List
              items={data.profile.list.map((item) => ({
                id: item.id,
                levelName: item.details?.name ?? "unknown level",
                publisher: item.details?.publisher ?? "unknown publisher",
                attempts: item.attempts,
                rating: item.score,
              }))!}
              {editMode}
              onDrop={handleDrop}
            />
          {:else}
            <div class="text-center">
              <h3 class="text-lg font-semibold text-base-content/70 mb-2">
                no levels completed yet
              </h3>
            </div>
          {/if}
        </div>

        <label class="tab">
          <input
            type="radio"
            name="user_activity"
            checked={tab === tabs.progress}
            onclick={() => goto("#" + tabs.progress)}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-4 me-2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M2.25 6 9 12.75l4.286-4.286a11.948 11.948 0 0 1 4.306 6.43l.776 2.898m0 0 3.182-5.511m-3.182 5.51-5.511-3.181"
            />
          </svg>
          all progress
        </label>
        <div class="tab-content bg-base-100 border-base-300 p-6">
          <div class="text-center">
            <h3 class="text-lg font-semibold text-base-content/70 mb-2">
              hello
            </h3>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
