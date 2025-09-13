<script lang="ts">
  import { enhance } from "$app/forms";
  import { onMount } from "svelte";
  import getDifficultyColor from "$lib/tools/getDifficultyColor";
  import type { Level, Progress } from "$lib/db-types";
  import type { PageProps } from "./$types";
  // import { getTokenFromCookies } from "$lib/auth/utils";

  let { data }: { data: PageProps } = $props();

  // let level:
  //   | (Level & {
  //       average_rating: number;
  //       completion_count: number;
  //       review_count: number;
  //     })
  //   | undefined = $state();
  let progress: Progress[] = $state([]);
  let loading = $state(true);
  let errorMessage = $state("");
  let rating: number | undefined = $state(data.progress?.enjoyment_rating);
  let status: string | undefined = $state(data.progress?.status);
  let isAuthenticated = data.user !== null;

  console.log(data.level);
  onMount(() => {
    // level = data.level;
    // progress = getLevelProgress(level._id);
    loading = false;
  });

  const ratingOptions = [
    { value: 1, label: "Terrible" },
    { value: 2, label: "Horrible" },
    { value: 3, label: "Very Bad" },
    { value: 4, label: "Bad" },
    { value: 5, label: "Mediocre" },
    { value: 6, label: "Fine" },
    { value: 7, label: "Good" },
    { value: 8, label: "Very Good" },
    { value: 9, label: "Excellent" },
    { value: 10, label: "Perfect" },
  ];

  const statusOptions = [
    { value: "In Progress" },
    { value: "Completed" },
    { value: "Dropped" },
    { value: "To Try" },
  ];

  function dateToString(date: Date): string {
    // return in format Month Day, Year
    const options: Intl.DateTimeFormatOptions = {
      month: "long",
      day: "numeric",
      year: "numeric",
    };
    return date.toLocaleDateString(undefined, options);
  }

  async function handleProgressChange(event: Event) {
    event.preventDefault();
    if (!status || !statusOptions.some((o) => o.value === status))
      status = "In Progress";
    console.log(rating);

    const formData = new FormData();
    formData.append("level_id", data.level.id.toString());
    if (rating) formData.append("enjoyment_rating", rating.toString());
    if (status) formData.append("status", status);

    try {
      const response = await fetch(`/level`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        // Handle success
        console.log("success");
      } else {
        // Handle error
        console.error("failed to update");
      }
    } catch (error) {
      // Handle network error
      console.error(error);
    }
  }
</script>

<div class="container mx-auto p-4">
  {#if !loading}
    {#if data.level}
      <div class="flex flex-row gap-8">
        <div class="flex flex-col gap-4 w-1/5">
          <!-- Form -->
          {#if isAuthenticated}
            <div class="card bg-base-200 w-full">
              <div class="card-body">
                <select
                  class="select"
                  bind:value={rating}
                  onchange={handleProgressChange}
                >
                  <option disabled selected>Rating</option>
                  {#each ratingOptions as option}
                    <option value={option.value}
                      >{option.value} - {option.label}</option
                    >
                  {/each}
                </select>
                <select
                  class="select"
                  bind:value={status}
                  onchange={handleProgressChange}
                >
                  <option disabled selected>Status</option>
                  {#each statusOptions as option}
                    <option value={option.value}>{option.value}</option>
                  {/each}
                </select>
                <button class="btn btn-secondary btn-block">More Details</button
                >
              </div>
            </div>
          {/if}
          <!-- Stats -->
          <div class="stats stats-vertical shadow bg-base-200 w-full">
            <div class="stat">
              <div class="stat-title">Enjoyment</div>
              <div class="stat-value">
                {data.level.average_rating
                  ? parseFloat(data.level.average_rating).toFixed(1)
                  : "N/A"}
              </div>
            </div>

            <div class="stat">
              <div class="stat-title">Completions</div>
              <div class="stat-value">
                {data.level.completion_count}
              </div>
            </div>

            <div class="stat">
              <div class="stat-title">Ratings</div>
              <div class="stat-value">
                {data.level.review_count}
              </div>
            </div>
          </div>
        </div>
        <!-- Level info -->
        <div class="flex flex-col gap-8 w-4/5">
          <div class="flex flex-row items-end w-full">
            <div class="space-y-2 w-3/5">
              <h1 class="text-4xl">
                <span class="font-bold">{data.level.name}</span>
                <span class="text-sm">ID: {data.level.geometry_dash_id}</span>
              </h1>
              <h2 class="text-2xl">
                {#if data.level.release_date}
                  released on <span class="font-semibold"
                    >{dateToString(data.level.release_date)}</span
                  >
                {/if}
                by <span class="font-semibold">{data.level.publisher}</span>
              </h2>
              <p>{data.level.description}</p>
              <span>
                <div class="badge badge-neutral">{data.level.length}</div>
                <div class="badge badge-error">{data.level.difficulty}</div>
              </span>
            </div>
            <div class="w-2/5 flex justify-end">
              {#if data.level.video_url}
                <iframe
                  width="388"
                  height="218"
                  src="https://www.youtube.com/embed/A6xe4tKdx_c?si=qQVlAjkwWilGdjxX"
                  title="YouTube video player"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerpolicy="strict-origin-when-cross-origin"
                  allowfullscreen
                ></iframe>
              {/if}
            </div>
            <!-- <div class={getDifficultyColor(level.difficulty)}>
              {level.difficulty}
            </div> -->
          </div>
          <!-- Ratings -->
          <div class="flex flex-col gap-4">
            <h3 class="text-xl">Ratings</h3>
            {#if progress.length == 0}
              <div class="opacity-50">No ratings yet.</div>
            {:else}
              {#each progress as p}
                <div class="flex flex-col gap-2">
                  <div class="avatar flex flex-row gap-4 h-12">
                    <div class="w-12 rounded-full">
                      <!-- <img
                        alt={p.aggregated.username}
                        src={p.aggregated.profilePictureUrl}
                      /> -->
                    </div>
                    <div class="flex flex-col content-center w-full">
                      <div class="flex flex-row justify-between">
                        <!-- <span class="font-bold text-primary hover:underline"
                          ><a href="/profile/{p.aggregated.username}"
                            >{p.aggregated.username}</a
                          ></span
                        > -->
                        <span class="opacity-50"
                          >{dateToString(p.created_at)}</span
                        >
                      </div>
                      <div class="font-semibold">{p.enjoyment_rating} / 10</div>
                    </div>
                  </div>
                  <div>
                    {p.review}
                  </div>
                </div>
                <div class="divider"></div>
              {/each}
            {/if}
          </div>
        </div>
      </div>
    {:else}
      <p>No level found</p>
    {/if}
  {:else}
    <span class="loading loading-ball loading-lg"></span>
  {/if}
</div>
