<script lang="ts">
  import { goto, invalidateAll } from "$app/navigation";
  import { page } from "$app/state";
  import { onMount } from "svelte";
  import { toastManager } from "$lib/state/toasts.svelte";
  import { enhance } from "$app/forms";
  import type { SubmitFunction } from "./$types";

  let creating = $state(false);
  const redirectTo = page.url.searchParams.get("redirectTo") ?? "/";

  // Redirect if already logged in
  onMount(() => {
    if (page.data.user) {
      goto("/");
    }
  });
</script>

<svelte:head>
  <title>sign up - loggd</title>
</svelte:head>

<div class="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    <div>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-base-content">
        create your account
      </h2>
      <p class="mt-2 text-center text-sm text-base-content/70">
        or
        <a
          href="/login"
          class="font-medium text-primary hover:text-primary-focus"
        >
          sign in to your existing account
        </a>
      </p>
    </div>

    <form
      class="mt-8 space-y-6"
      method="POST"
      use:enhance={(() => {
        creating = true;
        return async ({ result }) => {
          if (result.type === "success" || result.type === "redirect") {
            toastManager.add("successfully created account", "success");
            await invalidateAll();
            goto(redirectTo);
          } else if (result.type === "failure") {
            toastManager.add(
              result.data?.message ?? "failed to create account",
              "error",
            );
          } else {
            toastManager.add("unknown error occurred", "error");
          }
          creating = false;
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
              name="username"
              type="text"
              autocomplete="username"
              required
              placeholder="choose a username"
              disabled={creating}
            />
          </label>
          <p class="label">
            3-20 characters, letters, numbers, hyphens, and underscores only
          </p>
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">email address</legend>
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
                <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
              </g>
            </svg>
            <input
              name="email"
              type="email"
              autocomplete="email"
              required
              placeholder="enter your email address"
              disabled={creating}
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
              autocomplete="new-password"
              required
              placeholder="create a password"
              disabled={creating}
            />
          </label>
          <p class="label">
            at least 8 characters with uppercase, lowercase, and number
          </p>
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">confirm password</legend>
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
              name="confirmPassword"
              type="password"
              autocomplete="new-password"
              required
              placeholder="confirm your password"
              disabled={creating}
            />
          </label>
        </fieldset>

        <div>
          <button
            type="submit"
            class="btn btn-primary w-full"
            disabled={creating}
          >
            {#if creating}
              <span class="loading loading-dots loading-xs"></span>
            {:else}
              create account
            {/if}
          </button>
        </div>
      </div>
    </form>
  </div>
</div>
