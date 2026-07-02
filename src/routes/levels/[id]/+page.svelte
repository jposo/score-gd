<script lang="ts">
    import type { PageData, SubmitFunction } from "./$types";
    import { dateToLocaleString, getYouTubeEmbedUrl } from "$lib/tools/utils";
    import Review from "$lib/components/Review.svelte";
    import { toastManager } from "$lib/state/toasts.svelte";
    import { enhance } from "$app/forms";
    import {
        PROGRESS_SCORE_OPTIONS,
        PROGRESS_STATUS_OPTIONS,
    } from "$lib/constants";
    import ProgressDialog from "$lib/components/ProgressDialog.svelte";

    let { data }: { data: PageData } = $props();

    let quickUpdateForm: HTMLFormElement | undefined = $state();
    let levelDetails: HTMLDialogElement | undefined = $state();
    let progressDetails: ProgressDialog | undefined = $state();

    // level Data
    let average = $derived(data.level.averageScore);
    let releaseDate = $derived(data.level.releaseDate);
    let videoUrl = $derived(data.level.videoUrl);

    // progress data (undefined means no user is logged in)
    let score = $derived(data.progress?.score ?? undefined);
    let status = $derived(data.progress?.status ?? undefined);
    let completionPercentage = $derived(
        data.progress?.completionPercentage ?? undefined,
    );
    let attempts = $derived(data.progress?.attempts ?? undefined);
    let startDate = $derived(data.progress?.startedAt ?? undefined);
    let completionDate = $derived(data.progress?.completedAt ?? undefined);
    let review = $derived(data.progress?.review ?? undefined);
    let progressVideoUrl = $derived(data.progress?.videoUrl ?? undefined);

    const scoreOptions = PROGRESS_SCORE_OPTIONS;
    const statusOptions = PROGRESS_STATUS_OPTIONS;

    async function quickUpdate(event: Event) {
        event.preventDefault();
        if (quickUpdateForm) {
            quickUpdateForm.requestSubmit();
        }
    }
</script>

<svelte:head>
    <title>{data.level.name} - loggd</title>
</svelte:head>

<div class="container mx-auto p-4">
    <div class="flex flex-row gap-8">
        <div class="flex flex-col gap-4 w-1/5">
            {#if data.user}
                {#if data.user.roles?.includes("admin")}
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
                        <!-- <form
                            class="space-y-2"
                            method="POST"
                            bind:this={quickUpdateForm}
                            action="?/updateProgress"
                            use:enhance={(() => {
                                if (status === "completed") {
                                    completionPercentage = 100;
                                }
                                return async ({ result }) => {
                                    if (result.type === "success") {
                                        toastManager.add(
                                            result.data?.message ??
                                                "successfully updated progress",
                                            "success",
                                        );
                                    } else if (result.type === "failure") {
                                        toastManager.add(
                                            result.data?.message ??
                                                "failed to update progress",
                                            "error",
                                        );
                                    } else {
                                        console.error(result);
                                        toastManager.add(
                                            "unknown error occurred",
                                            "error",
                                        );
                                    }
                                };
                            }) satisfies SubmitFunction}
                        >
                            <select
                                class="select"
                                name="status"
                                onchange={quickUpdate}
                                bind:value={status}
                            >
                                <option disabled selected value={undefined}
                                    >status</option
                                >
                                {#each statusOptions as option}
                                    <option value={option.value}
                                        >{option.label}</option
                                    >
                                {/each}
                            </select>
                            <select
                                class="select"
                                name="score"
                                onchange={quickUpdate}
                                bind:value={score}
                            >
                                <option disabled selected value={undefined}
                                    >score</option
                                >
                                {#each scoreOptions as option}
                                    <option value={option.value}
                                        >{option.value} - {option.label}</option
                                    >
                                {/each}
                            </select>
                            <input
                                value={completionPercentage}
                                name="completionPercentage"
                                min="0"
                                max="100"
                                type="hidden"
                            />
                        </form> -->
                        <button
                            class="btn btn-secondary btn-block"
                            onclick={() => progressDetails?.open()}
                            >update progress</button
                        >
                    </div>
                </div>
            {/if}
            <!-- Stats -->
            <div class="stats stats-vertical shadow bg-base-200 w-full">
                <div class="stat">
                    <div class="stat-title">score</div>
                    <div class="stat-value">
                        {average ? average.toFixed(1) : "n/a"}
                    </div>
                </div>

                <div class="stat">
                    <div class="stat-title">completions</div>
                    <div class="stat-value">
                        {data.level.completionCount}
                    </div>
                </div>

                <div class="stat">
                    <div class="stat-title">reviews</div>
                    <div class="stat-value">
                        {data.level.reviewCount}
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
                        {#if data.level.releaseDate}
                            released on <span class="font-semibold"
                                >{dateToLocaleString(
                                    new Date(data.level.releaseDate),
                                ).toLowerCase()}</span
                            >
                        {/if}
                        by
                        <span class="font-semibold">{data.level.publisher}</span
                        >
                    </h2>
                    <p class="italic">{data.level.description}</p>
                    <span>
                        <div class="badge badge-neutral">
                            <span class="font-semibold"
                                >{data.level.songTitle}</span
                            >
                            by
                            <span class="font-semibold"
                                >{data.level.songArtist}</span
                            >
                        </div>
                        <div class="badge badge-neutral">
                            {data.level.length.toLowerCase()}
                        </div>
                        {#if data.level.twoPlayer}
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
                    {#if data.level.videoUrl}
                        <iframe
                            width="388"
                            height="218"
                            src={getYouTubeEmbedUrl(data.level.videoUrl)}
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
                <h3 class="text-xl font-bold">reviews</h3>
                {#if !data.level.reviews || data.level.reviews.length == 0}
                    <div class="opacity-50">no reviews yet.</div>
                {:else}
                    {#each data.level.reviews as r}
                        <Review
                            id={r.id}
                            username={r.username}
                            profilePictureUrl={r.profilePicturePath}
                            rating={r.score}
                            attempts={r.attempts}
                            status={r.status}
                            date={new Date(r.updatedAt)}
                            review={r.review!}
                            showModeratorOptions={data.user?.roles?.includes(
                                "admin",
                            ) ?? false}
                        />
                        <div class="divider"></div>
                    {/each}
                {/if}
            </div>
        </div>
    </div>
</div>

<dialog bind:this={levelDetails} class="modal backdrop-blur-sm">
    <div class="modal-box">
        <h3 class="text-lg font-bold">
            {data.level.name} details
        </h3>
        <form
            method="POST"
            action="?/updateLevel"
            use:enhance={(() => {
                return async ({ result }) => {
                    if (result.type === "success") {
                        toastManager.add(
                            result.data?.message ??
                                "successfully updated level",
                            "success",
                        );
                    } else if (result.type === "failure") {
                        toastManager.add(
                            result.data?.message ?? "failed to update level",
                            "error",
                        );
                    } else {
                        toastManager.add("unknown error occurred", "error");
                    }
                };
            }) satisfies SubmitFunction}
        >
            <fieldset class="fieldset">
                <legend class="fieldset-legend">release date</legend>
                <label class="input w-full">
                    <input
                        name="releaseDate"
                        type="date"
                        bind:value={releaseDate}
                    />
                </label>
            </fieldset>

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
                        name="videoUrl"
                        type="url"
                        placeholder="https://www.youtube.com/watch?v=xvFZjo5PgG0"
                        pattern="^(https?://)?([a-zA-Z0-9]([a-zA-Z0-9\-].*[a-zA-Z0-9])?\.)+[a-zA-Z].*$"
                        title="Must be valid URL"
                        bind:value={videoUrl}
                    />
                </label>
                <p class="validator-hint hidden">must be valid url</p>
            </fieldset>

            <div class="modal-action flex justify-end gap-2">
                <button
                    type="button"
                    class="btn"
                    onclick={() => levelDetails!.close()}
                >
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

<ProgressDialog
    bind:this={progressDetails}
    level={data.level}
    {statusOptions}
    {scoreOptions}
    bind:status
    bind:score
    bind:completionPercentage
    bind:attempts
    bind:startDate
    bind:completionDate
    bind:review
    bind:progressVideoUrl
/>
