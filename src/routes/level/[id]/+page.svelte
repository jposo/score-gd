<script lang="ts">
  import { enhance } from "$app/forms";
  import { onMount } from "svelte";
  import getDifficultyColor from "$lib/tools/getDifficultyColor";
  import type { Level, Progress } from "$lib/db-types";
  import type { PageProps } from "./$types";
  // import { getTokenFromCookies } from "$lib/auth/utils";

  let { data }: { data: PageProps } = $props();

  let progress: Progress[] = $state([]);
  let loading = $state(true);
  let errorMessage = $state("");
  let rating: number | undefined = $state(data.progress?.enjoyment_rating);
  let status: string | undefined = $state(data.progress?.status);
  let completionPercentage: string | undefined = $state(
    data.progress?.completion_pct,
  );
  let attempts: number | undefined = $state(data.progress?.attempts);
  let startDate: string | undefined = $state(
    convertDate(data.progress?.start_date),
  );
  let completionDate: string | undefined = $state(
    convertDate(data.progress?.complete_date),
  );
  let review: string | undefined = $state(data.progress?.review);
  let isAuthenticated = data.user !== null;

  onMount(() => {
    // level = data.level;
    console.log(data.reviews);
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
    formData.append("status", status);

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

  async function submitProgress(event: Event) {
    // console.log(event);
    const form = new FormData(event.target as HTMLFormElement);
    form.append("status", status!);
    form.append("level_id", data.level.id.toString());
    // form.forEach((value, key) => {
    //   if (value == "") {
    //     console.log("empty value for", key);
    //   } else {
    //     data[key] = value;
    //     console.log("value for", key, ":", value);
    //   }
    // });

    try {
      const response = await fetch(`/level`, {
        method: "POST",
        body: form,
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

    // fetch(`/user/${data.user.id}/progress/${data.level.id}`, {
    //   method: "PUT",
    //   body: JSON.striny,
    // });
  }
  function convertDate(date: Date | undefined) {
    if (!date) return undefined;
    let year = date.getFullYear();
    let month = (date.getMonth() + 1).toString().padStart(2, "0");
    let day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
</script>

<svelte:head>
  <title>{data.level.name} - loggd</title>
</svelte:head>

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
                <button
                  class="btn btn-secondary btn-block"
                  onclick={() => details.showModal()}>More Details</button
                >
                <dialog id="details" class="modal">
                  <div class="modal-box">
                    <h3 class="text-lg font-bold">
                      {data.level.name} Progress
                    </h3>
                    <form
                      id="progressForm"
                      onsubmit={async (event) => await submitProgress(event)}
                    >
                      <div class="flex flex-row gap-4">
                        <fieldset class="fieldset w-1/2">
                          {#if data.level.type === "Classic"}
                            <legend class="fieldset-legend"
                              >Completion Percentage</legend
                            >
                            <label class="input w-full">
                              <input
                                bind:value={completionPercentage}
                                name="completion_pct"
                                type="number"
                                min="0"
                                max="100"
                              />
                              <span class="label">%</span>
                            </label>
                          {:else}
                            <legend class="fieldset-legend"
                              >Completion Time</legend
                            >
                            <label class="input w-full">
                              <input
                                name="completion_time"
                                type="number"
                                min="0"
                              />
                            </label>
                          {/if}
                        </fieldset>
                        <fieldset class="fieldset w-1/2">
                          <legend class="fieldset-legend">Attempts</legend>
                          <label class="input w-full">
                            <input
                              bind:value={attempts}
                              name="total_attempts"
                              type="number"
                              min="0"
                            />
                          </label>
                        </fieldset>
                      </div>

                      <div class="flex flex-row gap-4">
                        <fieldset class="fieldset w-1/2">
                          <legend class="fieldset-legend">Start Date</legend>
                          <label class="input w-full">
                            <input
                              name="start_date"
                              bind:value={startDate}
                              type="date"
                              max={completionDate}
                            />
                          </label>
                        </fieldset>
                        <fieldset class="fieldset w-1/2">
                          <legend class="fieldset-legend"
                            >Completion Date</legend
                          >
                          <label class="input w-full">
                            <input
                              name="complete_date"
                              bind:value={completionDate}
                              type="date"
                              min={startDate}
                            />
                          </label>
                        </fieldset>
                      </div>

                      <fieldset class="fieldset w-full">
                        <legend class="fieldset-legend">Video URL</legend>
                        <label class="input validator w-full">
                          <svg
                            class="h-[1em] opacity-50"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                          >
                            <g
                              stroke-linejoin="round"
                              stroke-linecap="round"
                              stroke-width="2.5"
                              fill="none"
                              stroke="currentColor"
                            >
                              <path
                                d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
                              ></path>
                              <path
                                d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
                              ></path>
                            </g>
                          </svg>
                          <input
                            name="video_url"
                            type="url"
                            placeholder="https://www.youtube.com/watch?v=xvFZjo5PgG0"
                            pattern="^(https?://)?([a-zA-Z0-9]([a-zA-Z0-9\-].*[a-zA-Z0-9])?\.)+[a-zA-Z].*$"
                            title="Must be valid URL"
                          />
                        </label>
                        <p class="validator-hint hidden">Must be valid URL</p>
                      </fieldset>

                      <fieldset class="fieldset w-full">
                        <legend class="fieldset-legend">Review</legend>
                        <textarea
                          name="review"
                          bind:value={review}
                          class="textarea w-full"
                          placeholder="Enter your thoughts..."
                        ></textarea>
                      </fieldset>

                      <div class="modal-action">
                        <button
                          type="submit"
                          class="btn btn-primary"
                          onclick={details.showModal()}>Save Progress</button
                        >
                      </div>
                    </form>
                    <div class="modal-action">
                      <form method="dialog">
                        <!-- <button
                          type="submit"
                          class="btn btn-primary"
                          onclick={submitProgress}>Save Progress</button
                        > -->
                        <button class="btn">Close</button>
                      </form>
                    </div>
                  </div>
                </dialog>
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
              <div class="stat-title">Reviews</div>
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
            {#if !data.reviews || data.reviews?.length == 0}
              <div class="opacity-50">No reviews yet.</div>
            {:else}
              {#each data.reviews as r}
                <div class="flex flex-col gap-2">
                  <div class="avatar flex flex-row gap-4 h-12">
                    <div
                      class="w-12 rounded-full text-neutral-content bg-neutral"
                    >
                      {#if data.user.profile_picture_url}
                        <img
                          alt={data.user.username}
                          src={data.user.profile_picture_url}
                        />
                      {:else}
                        <span class="text-sm"
                          >{data.user.username.charAt(0)}</span
                        >
                      {/if}
                    </div>
                    <div class="flex flex-col content-center w-full">
                      <div class="flex flex-row justify-between">
                        <span class="font-bold text-primary hover:underline"
                          ><a href="/profile/{r.username}">{r.username}</a
                          ></span
                        >
                        <span class="opacity-50"
                          >{dateToString(r.created_at)}</span
                        >
                      </div>
                      <div class="font-semibold">{r.enjoyment_rating} / 10</div>
                    </div>
                  </div>
                  <div>
                    {r.review}
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
