<script lang="ts">
  import type { PageData } from "./$types";
  import {
    convertDate,
    dateToString,
    calculateNewAverage,
    getYouTubeEmbedUrl,
  } from "$lib/tools/utils";
  import Review from "$lib/components/Review.svelte";
  import { toastManager } from "$lib/state/toasts.svelte";
  import { onMount } from "svelte";

  let { data }: { data: PageData } = $props();

  let levelDetails: HTMLDialogElement | undefined = $state();
  let progressDetails: HTMLDialogElement | undefined = $state();

  // level Data
  let average = $state(data.level.average_rating ?? undefined);
  let releaseDate = $state(convertDate(data.level.release_date ?? undefined));
  let difficulty = $state(data.level.difficulty ?? undefined);
  let videoUrl = $state(data.level.video_url ?? undefined);
  let description = $state(data.level.description ?? undefined);
  let skillsets = $state(data.level.skillsets ?? []);

  // rogress Data
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

  $effect(() => {
    // level data
    average = data.level.average_rating ?? undefined;
    releaseDate = convertDate(data.level.release_date ?? undefined);
    difficulty = data.level.difficulty ?? undefined;
    videoUrl = data.level.video_url ?? undefined;
    description = data.level.description ?? undefined;
    skillsets = data.level.skillsets ?? [];

    // progress data
    oldRating = data.progress?.enjoyment_rating ?? undefined;
    rating = data.progress?.enjoyment_rating ?? undefined;
    status = data.progress?.status ?? undefined;
    completionPercentage = data.progress?.completion_pct ?? undefined;
    attempts = data.progress?.total_attempts ?? undefined;
    startDate = convertDate(data.progress?.start_date ?? undefined);
    completionDate = convertDate(data.progress?.completion_date) ?? undefined;
    review = data.progress?.review ?? undefined;
  });

  const ratingOptions = [
    { value: 1, label: "terrible" },
    { value: 2, label: "horrible" },
    { value: 3, label: "very Bad" },
    { value: 4, label: "bad" },
    { value: 5, label: "mediocre" },
    { value: 6, label: "fine" },
    { value: 7, label: "good" },
    { value: 8, label: "very good" },
    { value: 9, label: "excellent" },
    { value: 10, label: "perfect" },
  ];

  const statusOptions = [
    { value: "In Progress", label: "in progress" },
    { value: "Completed", label: "completed" },
    { value: "Dropped", label: "dropped" },
    { value: "To Try", label: "to try" },
  ];

  async function actionRequest(
    url: string,
    formData: FormData,
    successMessage: string,
    errorMessage: string,
    unexpectedMessage: string,
  ) {
    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (data.status.toString().startsWith("2")) {
        console.log(data);
        toastManager.add(successMessage, "success");
      } else {
        console.error(data);
        toastManager.add(errorMessage, "error");
      }
    } catch (error) {
      console.error(error);
      toastManager.add(unexpectedMessage, "error");
    }
  }

  async function updateProgress(additionalData?: FormData) {
    // ensure status has a valid value
    if (!status || !statusOptions.some((o) => o.value === status)) {
      status = "In Progress";
    }

    const form = additionalData || new FormData();
    form.append("status", status);

    // add rating if valid
    if (rating && !isNaN(rating)) {
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

    if (status === "Completed" && !completionPercentage) {
      completionPercentage = 100;
    }

    await actionRequest(
      `/levels/${data.level.id}?/updateProgress`,
      form,
      "successfully updated progress!",
      "failed to update progress!",
      "an unexpected error occurred!",
    );
  }

  async function quickUpdate(event: Event) {
    event.preventDefault();
    await updateProgress();
  }

  async function detailedUpdate(event: Event) {
    event.preventDefault();
    const form = new FormData(event.target as HTMLFormElement);
    await updateProgress(form);
  }

  async function handleSubmitLevelDetails(event: Event) {
    event.preventDefault();
    const form = new FormData(event.target as HTMLFormElement);
    await actionRequest(
      `/levels/${data.level.id}?/updateLevel`,
      form,
      "successfully updated level details!",
      "failed to update level details!",
      "an unexpected error occurred!",
    );
  }
</script>

<svelte:head>
  <title>{data.level.name} - loggd</title>
</svelte:head>

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
                  >edit level details</button
                >
              </div>
            </div>
          {/if}

          <div class="card bg-base-200 w-full">
            <div class="card-body">
              <select class="select" bind:value={rating} onchange={quickUpdate}>
                <option disabled selected value={undefined}>rating</option>
                {#each ratingOptions as option}
                  <option value={option.value}
                    >{option.value} - {option.label}</option
                  >
                {/each}
              </select>
              <select class="select" bind:value={status} onchange={quickUpdate}>
                <option disabled selected value={undefined}>status</option>
                {#each statusOptions as option}
                  <option value={option.value}>{option.label}</option>
                {/each}
              </select>
              <button
                class="btn btn-secondary btn-block"
                onclick={() => progressDetails?.showModal()}
                >more details</button
              >
            </div>
          </div>
        {/if}
        <!-- Stats -->
        <div class="stats stats-vertical shadow bg-base-200 w-full">
          <div class="stat">
            <div class="stat-title">enjoyment</div>
            <div class="stat-value">
              {average ? average.toFixed(1) : "N/A"}
            </div>
          </div>

          <div class="stat">
            <div class="stat-title">completions</div>
            <div class="stat-value">
              {data.level.completion_count}
            </div>
          </div>

          <div class="stat">
            <div class="stat-title">reviews</div>
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
              <span class="text-sm">id: {data.level.id}</span>
            </h1>
            <h2 class="text-2xl">
              {#if data.level.release_date}
                released on <span class="font-semibold"
                  >{dateToString(data.level.release_date)}</span
                >
              {/if}
              by
              <span class="font-semibold">{data.level.publisher}</span>
            </h2>
            <p class="italic">{data.level.description}</p>
            <span>
              <div class="badge badge-neutral">
                <span class="font-semibold">{data.level.song_title}</span>
                by
                <span class="font-semibold">{data.level.song_artist}</span>
              </div>
              <div class="badge badge-neutral">
                {data.level.length.toLowerCase()}
              </div>
              {#if data.level.two_player}
                <div class="badge badge-neutral">two-player</div>
              {/if}
              {#if data.level.coins && data.level.coins >= 1}
                <div class="badge badge-neutral">
                  {data.level.coins} coins
                </div>
              {/if}
              <div class="badge badge-warning">
                {data.level.rating.toLowerCase()}
              </div>
              <div class="badge badge-error">
                {data.level.difficulty.toLowerCase()}
              </div>
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
          <h3 class="text-xl">reviews</h3>
          {#if !data.level.reviews || data.level.reviews.length == 0}
            <div class="opacity-50">no reviews yet.</div>
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

<dialog bind:this={levelDetails} class="modal backdrop-blur-sm">
  <div class="modal-box">
    <h3 class="text-lg font-bold">
      {data.level.name} details
    </h3>
    <form onsubmit={async (event) => await handleSubmitLevelDetails(event)}>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <fieldset class="fieldset">
          <legend class="fieldset-legend">release Date</legend>
          <label class="input w-full">
            <input name="release_date" type="date" bind:value={releaseDate} />
          </label>
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">difficulty</legend>
          <select class="select" name="difficulty" bind:value={difficulty}>
            <option selected>Extreme Demon</option>
          </select>
        </fieldset>
      </div>

      <fieldset class="fieldset w-full">
        <legend class="fieldset-legend">video url</legend>
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
        <p class="validator-hint hidden">must be valid url</p>
      </fieldset>

      <fieldset class="fieldset w-full">
        <legend class="fieldset-legend">description</legend>
        <textarea
          name="description"
          class="textarea w-full"
          placeholder="What is this level about?"
          bind:value={description}
        ></textarea>
      </fieldset>

      <div>
        {#each data.skillsets as skillset}
          <input
            class="btn"
            type="checkbox"
            name="skillsets"
            value={skillset.id}
            aria-label={skillset.name}
            checked={skillsets.includes(skillset.id)}
          />
        {/each}
        <input class="btn btn-square" type="reset" value="×" />
      </div>

      <div class="modal-action flex justify-end gap-2">
        <button type="button" class="btn" onclick={() => levelDetails!.close()}>
          close
        </button>
        <button
          type="submit"
          class="btn btn-primary"
          onclick={() => levelDetails!.close()}>save details</button
        >
      </div>
    </form>
  </div>
</dialog>

<dialog bind:this={progressDetails} class="modal backdrop-blur-sm">
  <div class="modal-box">
    <h3 class="text-lg font-bold">
      {data.level.name} progress
    </h3>
    <form onsubmit={async (event) => await detailedUpdate(event)}>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <fieldset class="fieldset">
          {#if data.level.length !== "Platformer"}
            <legend class="fieldset-legend">completion percentage</legend>
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
            <legend class="fieldset-legend">completion time</legend>
            <label class="input w-full">
              <input name="completion_time" type="number" min="0" />
            </label>
          {/if}
        </fieldset>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">attempts</legend>
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
          <legend class="fieldset-legend">start date</legend>
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
          <legend class="fieldset-legend">completion date</legend>
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
        <legend class="fieldset-legend">video url</legend>
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
        <p class="validator-hint hidden">must be valid url</p>
      </fieldset>

      <fieldset class="fieldset w-full">
        <legend class="fieldset-legend">review</legend>
        <textarea
          name="review"
          bind:value={review}
          class="textarea w-full"
          placeholder="enter your thoughts..."
        ></textarea>
      </fieldset>

      <div class="modal-action flex justify-end gap-2">
        <button
          type="button"
          class="btn"
          onclick={() => progressDetails!.close()}
        >
          close
        </button>
        <button
          type="submit"
          class="btn btn-primary"
          onclick={() => progressDetails!.close()}>save progress</button
        >
      </div>
    </form>
  </div>
</dialog>
