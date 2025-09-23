<script lang="ts">
  import type { PageData } from "./$types";
  import {
    convertDate,
    dateToString,
    calculateNewAverage,
    getYouTubeEmbedUrl,
  } from "$lib/tools/utils";
  import Review from "$lib/components/Review.svelte";
  import Alert from "$lib/components/Alert.svelte";

  let { data }: { data: PageData } = $props();

  let levelDetails: HTMLDialogElement | undefined = $state();
  let progressDetails: HTMLDialogElement | undefined = $state();
  let success: string | undefined = $state();
  let error: string | undefined = $state();
  const alertDuration = 2000;

  // Level Data
  let average = $state(data.level.average_rating ?? undefined);
  let releaseDate = $state(convertDate(data.level.release_date ?? undefined));
  let difficulty = $state(data.level.difficulty ?? undefined);
  let videoUrl = $state(data.level.video_url ?? undefined);
  let description = $state(data.level.description ?? undefined);

  // Progress Data
  let oldRating = $state(data.progress?.enjoyment_rating ?? undefined);
  let rating = $state(data.progress?.enjoyment_rating ?? undefined);
  let status = $state(data.progress?.status ?? undefined);
  let completionPercentage = $state(data.progress?.completion_pct ?? undefined);
  let attempts = $state(data.progress?.total_attempts ?? undefined);
  let startDate = $state(convertDate(data.progress?.start_date ?? undefined));
  let completionDate: string | undefined = $state(
    convertDate(data.progress?.completion_date) ?? undefined,
  );
  let review = $state(data.progress?.review ?? undefined);

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

  async function actionRequest(
    url: string,
    formData: FormData,
    successMsg: string,
    errorMsg: string,
    networkErrorMsg: string,
  ) {
    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        success = successMsg;
        setTimeout(() => {
          success = undefined;
        }, alertDuration);
      } else {
        error = errorMsg;
      }
    } catch (error) {
      console.error(error);
      error = networkErrorMsg;
    } finally {
      setTimeout(() => {
        success = undefined;
        error = undefined;
      }, alertDuration);
    }
  }

  async function handleSelectChange(event: Event) {
    event.preventDefault();
    if (!status || !statusOptions.some((o) => o.value === status))
      status = "In Progress";

    const form = new FormData();
    form.append("status", status);
    if (rating && typeof rating === "number" && !Number.isNaN(rating)) {
      form.append("enjoyment_rating", rating.toString());
      if (average && oldRating) {
        average = calculateNewAverage(
          data.level.progress_count,
          average,
          oldRating,
          rating,
        );
      }
      oldRating = rating;
    }
    await actionRequest(
      `/levels/${data.level.id}?/updateProgress`,
      form,
      "Progress updated successfully",
      "Failed to update list",
      "An error occurred while updating the progress",
    );
  }

  async function handleSubmitProgress(event: Event) {
    event.preventDefault();
    if (!status || !statusOptions.some((o) => o.value === status))
      status = "In Progress";

    const form = new FormData(event.target as HTMLFormElement);
    form.append("status", status!);

    await actionRequest(
      `/levels/${data.level.id}?/updateProgress`,
      form,
      "Progress updated successfully",
      "Failed to update list",
      "An error occurred while updating the progress",
    );
  }

  async function handleSubmitLevelDetails(event: Event) {
    event.preventDefault();
    const form = new FormData(event.target as HTMLFormElement);
    await actionRequest(
      `/levels/${data.level.id}?/updateLevel`,
      form,
      "Level details updated successfully",
      "Failed to update level details",
      "An error occurred while updating the level details",
    );
  }
</script>

<svelte:head>
  <title>{data.level.name} - loggd</title>
</svelte:head>

{#if success}
  <Alert message={success} type="success" duration={alertDuration} />
{/if}
{#if error}
  <Alert message={error} type="error" duration={alertDuration} />
{/if}

<div class="container mx-auto p-4">
  {#if data.level}
    <div class="flex flex-row gap-8">
      <div class="flex flex-col gap-4 w-1/5">
        <!-- Form -->
        {#if data.user}
          {#if data.user.roles.includes("Admin")}
            <div class="card bg-base-200 w-full">
              <div class="card-body">
                <button
                  class="btn btn-accent btn-block"
                  onclick={() => levelDetails?.showModal()}
                  >Edit Level Details</button
                >
              </div>
            </div>

            <dialog bind:this={levelDetails} class="modal">
              <div class="modal-box">
                <h3 class="text-lg font-bold">
                  {data.level.name} Details
                </h3>
                <form
                  onsubmit={async (event) =>
                    await handleSubmitLevelDetails(event)}
                >
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <fieldset class="fieldset">
                      <legend class="fieldset-legend">Release Date</legend>
                      <label class="input w-full">
                        <input
                          name="release_date"
                          type="date"
                          bind:value={releaseDate}
                        />
                      </label>
                    </fieldset>

                    <fieldset class="fieldset">
                      <legend class="fieldset-legend">Difficulty</legend>
                      <select
                        class="select"
                        name="difficulty"
                        bind:value={difficulty}
                      >
                        <option selected>Extreme Demon</option>
                      </select>
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
                        bind:value={videoUrl}
                      />
                    </label>
                    <p class="validator-hint hidden">Must be valid URL</p>
                  </fieldset>

                  <fieldset class="fieldset w-full">
                    <legend class="fieldset-legend">Description</legend>
                    <textarea
                      name="description"
                      class="textarea w-full"
                      placeholder="What is this level about?"
                      bind:value={description}
                    ></textarea>
                  </fieldset>

                  <div class="modal-action flex justify-end gap-2">
                    <button
                      type="submit"
                      class="btn btn-primary"
                      onclick={() => levelDetails!.close()}>Save Details</button
                    >
                    <button
                      type="button"
                      class="btn"
                      onclick={() => levelDetails!.close()}
                    >
                      Close
                    </button>
                  </div>
                </form>
              </div>
            </dialog>
          {/if}

          <div class="card bg-base-200 w-full">
            <div class="card-body">
              <select
                class="select"
                bind:value={rating}
                onchange={handleSelectChange}
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
                onchange={handleSelectChange}
              >
                <option disabled selected>Status</option>
                {#each statusOptions as option}
                  <option value={option.value}>{option.value}</option>
                {/each}
              </select>
              <button
                class="btn btn-secondary btn-block"
                onclick={() => progressDetails?.showModal()}
                >More Details</button
              >
              <dialog bind:this={progressDetails} class="modal">
                <div class="modal-box">
                  <h3 class="text-lg font-bold">
                    {data.level.name} Progress
                  </h3>
                  <form
                    onsubmit={async (event) =>
                      await handleSubmitProgress(event)}
                  >
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <fieldset class="fieldset">
                        {#if data.level.length !== "Platformer"}
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
                      <fieldset class="fieldset">
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

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <fieldset class="fieldset">
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
                      <fieldset class="fieldset">
                        <legend class="fieldset-legend">Completion Date</legend>
                        <label class="input w-full">
                          <input
                            name="completion_date"
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

                    <div class="modal-action flex justify-end gap-2">
                      <button
                        type="submit"
                        class="btn btn-primary"
                        onclick={() => progressDetails!.close()}
                        >Save Progress</button
                      >
                      <button
                        type="button"
                        class="btn"
                        onclick={() => progressDetails!.close()}
                      >
                        Close
                      </button>
                    </div>
                  </form>
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
              {average ? average.toFixed(1) : "N/A"}
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
              <span class="text-sm">ID: {data.level.id}</span>
            </h1>
            <h2 class="text-2xl">
              {#if data.level.release_date}
                released on <span class="font-semibold"
                  >{dateToString(data.level.release_date)}</span
                >
              {/if}
              by <span class="font-semibold">{data.level.publisher}</span>
            </h2>
            <p class="italic">{data.level.description}</p>
            <span>
              <div class="badge badge-neutral">
                <span class="font-semibold">{data.level.song_title}</span> by
                <span class="font-semibold">{data.level.song_artist}</span>
              </div>
              <div class="badge badge-neutral">{data.level.length}</div>
              {#if data.level.two_player}
                <div class="badge badge-neutral">2-Player</div>
              {/if}
              {#if data.level.coins && data.level.coins >= 1}
                <div class="badge badge-neutral">{data.level.coins} Coins</div>
              {/if}
              <div class="badge badge-warning">{data.level.rating}</div>
              <div class="badge badge-error">{data.level.difficulty}</div>
            </span>
          </div>
          <div class="w-2/5 flex justify-end">
            {#if data.level.video_url}
              <iframe
                width="388"
                height="218"
                src={getYouTubeEmbedUrl(data.level.video_url)}
                title="YouTube video player"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerpolicy="strict-origin-when-cross-origin"
                allowfullscreen
              ></iframe>
            {/if}
          </div>
        </div>
        <!-- Reviews -->
        <div class="flex flex-col gap-4">
          <h3 class="text-xl">Reviews</h3>
          {#if !data.level.reviews || data.level.reviews.length == 0}
            <div class="opacity-50">No reviews yet.</div>
          {:else}
            {#each data.level.reviews as r}
              <Review
                username={r.username}
                profilePictureUrl={r.profile_picture_url}
                rating={r.enjoyment_rating}
                attempts={r.total_attempts}
                status={r.status}
                date={new Date(r.updated_at)}
                review={r.review!}
              />
              <div class="divider"></div>
            {/each}
          {/if}
        </div>
      </div>
    </div>
  {:else}
    <p>No level found</p>
  {/if}
</div>
