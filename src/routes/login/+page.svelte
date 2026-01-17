<script lang="ts">
  import { goto, invalidateAll } from "$app/navigation";
  import { page } from "$app/state";
  import { onMount } from "svelte";
  import { toastManager } from "$lib/state/toasts.svelte";
  import { enhance } from "$app/forms";
  import type { SubmitFunction } from "./$types";

  let loggingIn = $state(false);
  const redirectTo = page.url.searchParams.get("redirectTo") ?? "/";

  // Redirect if already logged in
  onMount(() => {
    if (page.data.user) {
      goto(redirectTo);
    }
  });
</script>

<svelte:head>
  <title>login - loggd</title>
</svelte:head>

<div class="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    <div>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-base-content">
        sign in to your account
      </h2>
    </div>

    <form
      class="mt-8 space-y-6"
      method="POST"
      use:enhance={(() => {
        loggingIn = true;
        return async ({ result }) => {
          if (result.type === "success" || result.type === "redirect") {
            toastManager.add("successfully logged in", "success");
            await invalidateAll();
            goto(redirectTo);
          } else if (result.type === "failure") {
            toastManager.add(
              result.data?.message ?? "failed to log in",
              "error",
            );
          } else {
            toastManager.add("unknown error occurred", "error");
          }
          loggingIn = false;
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
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </g>
            </svg>
            <input
              name="login"
              type="text"
              autocomplete="username"
              required
              placeholder="enter your email or username"
              disabled={loggingIn}
            />
          </label>
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">password</legend>
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
                  d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"
                ></path>
                <circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle>
              </g>
            </svg>
            <input
              name="password"
              type="password"
              autocomplete="current-password"
              required
              placeholder="Enter your password"
              disabled={loggingIn}
            />
          </label>
        </fieldset>

        <div>
          <button
            type="submit"
            class="btn btn-primary w-full"
            disabled={loggingIn}
          >
            {#if loggingIn}
              <span class="loading loading-dots loading-xs"></span>
            {:else}
              sign in
            {/if}
          </button>
        </div>

        <div class="text-center">
          <p class="text-sm text-base-content/70">
            don't have an account?
            <a
              href="/signup"
              class="font-medium text-primary hover:text-primary-focus"
            >
              sign up here
            </a>
          </p>
        </div>
      </div>
    </form>
  </div>
</div>
