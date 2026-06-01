<script lang="ts">
    import type { SubmitFunction } from "./$types";
    import { enhance } from "$app/forms";
    import { toastManager } from "$lib/state/toasts.svelte";
    import { goto, invalidateAll } from "$app/navigation";

    let settingUp = $state(false);
</script>

<div class="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
        <div>
            <h2
                class="mt-6 text-center text-3xl font-extrabold text-base-content"
            >
                initial profile setup
            </h2>
        </div>
        <form
            class="mt-8 space-y-6"
            method="POST"
            use:enhance={(() => {
                settingUp = true;
                return async ({ result }) => {
                    if (
                        result.type === "success" ||
                        result.type === "redirect"
                    ) {
                        toastManager.add(
                            "successfully set username",
                            "success",
                        );
                        await invalidateAll();
                        goto("/");
                    } else if (result.type === "failure") {
                        toastManager.add(
                            result.data?.message ?? "failed to set up",
                            "error",
                        );
                    } else {
                        toastManager.add("unknown error occurred", "error");
                    }
                    settingUp = false;
                };
            }) satisfies SubmitFunction}
        >
            <div class="space-y-2">
                <fieldset class="fieldset">
                    <legend class="fieldset-legend">username</legend>
                    <label class="input w-full">
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
                                    d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"
                                ></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </g>
                        </svg>
                        <input
                            name="username"
                            type="text"
                            autocomplete="username"
                            required
                            placeholder="enter your new username"
                            disabled={settingUp}
                        />
                    </label>
                </fieldset>

                <div>
                    <button
                        type="submit"
                        class="btn btn-primary w-full"
                        disabled={settingUp}
                    >
                        {#if settingUp}
                            <span class="loading loading-dots loading-xs"
                            ></span>
                        {:else}
                            finish setup up
                        {/if}
                    </button>
                </div>
            </div>
        </form>
    </div>
</div>
