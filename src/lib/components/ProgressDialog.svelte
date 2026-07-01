<script lang="ts">
    import { enhance } from "$app/forms";
    import type { SubmitFunction } from "@sveltejs/kit";
    import { toastManager } from "$lib/state/toasts.svelte";
    import {
        PROGRESS_SCORE_OPTIONS,
        PROGRESS_STATUS_OPTIONS,
    } from "$lib/constants";

    let {
        level,
        statusOptions,
        scoreOptions,
        status = $bindable(),
        score = $bindable(),
        completionPercentage = $bindable(),
        attempts = $bindable(),
        startDate = $bindable(),
        completionDate = $bindable(),
        review = $bindable(),
        progressVideoUrl = $bindable(),
    }: {
        level: { id: number; name: string; length: string };
        statusOptions: typeof PROGRESS_STATUS_OPTIONS;
        scoreOptions: typeof PROGRESS_SCORE_OPTIONS;
        status: string | undefined;
        score: number | undefined;
        completionPercentage: number | undefined;
        attempts: number | undefined;
        startDate: string | undefined;
        completionDate: string | undefined;
        review: string | undefined;
        progressVideoUrl: string | undefined;
    } = $props();

    let dialogEl: HTMLDialogElement;

    export function open() {
        dialogEl.showModal();
    }
</script>

<dialog bind:this={dialogEl} class="modal backdrop-blur-sm">
    <div class="modal-box">
        <h3 class="text-lg font-bold">{level.name} progress</h3>
        <form
            method="POST"
            action="/levels/{level.id}/?/updateProgress"
            use:enhance={(() => {
                return async ({ result }) => {
                    if (result.type === "success") {
                        toastManager.add(
                            result.data?.message ??
                                "successfully updated progress",
                            "success",
                        );
                    } else if (result.type === "failure") {
                        toastManager.add(
                            result.data?.message ?? "failed to update progress",
                            "error",
                        );
                    } else {
                        toastManager.add("unknown error occurred", "error");
                    }
                };
            }) satisfies SubmitFunction}
        >
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <fieldset class="fieldset">
                    <legend class="fieldset-legend">status</legend>
                    <select
                        class="select"
                        name="status"
                        bind:value={status}
                        onchange={() => {
                            if (status === "completed") {
                                completionPercentage = 100;
                            }
                        }}
                    >
                        <option disabled selected value={undefined}
                            >status</option
                        >
                        {#each statusOptions as option}
                            <option value={option.value}>{option.label}</option>
                        {/each}
                    </select>
                </fieldset>
                <fieldset class="fieldset">
                    <legend class="fieldset-legend">score</legend>
                    <select class="select" name="score" bind:value={score}>
                        <option disabled selected value={undefined}
                            >score</option
                        >
                        {#each scoreOptions as option}
                            <option value={option.value}
                                >{option.value} - {option.label}</option
                            >
                        {/each}
                    </select>
                </fieldset>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <fieldset class="fieldset">
                    {#if level.length !== "platformer"}
                        <legend class="fieldset-legend"
                            >completion percentage</legend
                        >
                        <label class="input w-full">
                            <input
                                bind:value={completionPercentage}
                                name="completionPercentage"
                                type="number"
                                min="0"
                                max="100"
                            />
                            <span class="label">%</span>
                        </label>
                    {:else}
                        <legend class="fieldset-legend">completion time</legend>
                        <label class="input w-full">
                            <input
                                name="completionTime"
                                type="number"
                                min="0"
                            />
                        </label>
                    {/if}
                </fieldset>
                <fieldset class="fieldset">
                    <legend class="fieldset-legend">attempts</legend>
                    <label class="input w-full">
                        <input
                            bind:value={attempts}
                            name="attempts"
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
                            name="startedAt"
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
                            name="completedAt"
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
                        name="videoUrl"
                        bind:value={progressVideoUrl}
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
                    placeholder="enter your thoughts..."></textarea>
            </fieldset>

            <div class="modal-action flex justify-end gap-2">
                <button
                    type="button"
                    class="btn"
                    onclick={() => dialogEl!.close()}
                >
                    close
                </button>
                <button
                    type="submit"
                    class="btn btn-primary"
                    onclick={() => dialogEl!.close()}>save progress</button
                >
            </div>
        </form>
    </div>
</dialog>
