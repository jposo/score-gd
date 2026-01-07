<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { onMount } from "svelte";
  import { toastManager } from "$lib/state/toasts.svelte";

  let login = "";
  let password = "";
  let loading = false;

  // Redirect if already logged in
  onMount(() => {
    if (page.data.user) {
      goto("/");
    }
  });

  async function handleSubmit() {
    if (!login || !password) {
      toastManager.add("please fill in all fields", "error");
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          login: login.trim(),
          password,
        }),
      });

      const data = await response.json();
      console.log(data);
      if (data.success) {
        // Redirect to home page or the page they came from
        toastManager.add("successfully logged in", "success");
        const redirectTo =
          new URL(window.location.href).searchParams.get("redirectTo") || "/";
        window.location.href = redirectTo;
      } else {
        toastManager.add("login failed", "error");
        console.error(data.error);
      }
    } catch (err) {
      console.error("Login error:", err);
      toastManager.add("login failed", "error");
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      handleSubmit();
    }
  }
</script>

<svelte:head>
  <title>Login - Loggd</title>
</svelte:head>

<div class="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    <div>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-base-content">
        Sign in to your account
      </h2>
    </div>

    <form class="mt-8 space-y-6" on:submit|preventDefault={handleSubmit}>
      <div class="space-y-2">
        <fieldset class="fieldset">
          <legend class="fieldset-legend">Username</legend>
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
              placeholder="Enter your email or username"
              bind:value={login}
              on:keydown={handleKeydown}
              disabled={loading}
            />
          </label>
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">Password</legend>
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
              bind:value={password}
              on:keydown={handleKeydown}
              disabled={loading}
            />
          </label>
        </fieldset>

        <div>
          <button
            type="submit"
            class="btn btn-primary w-full"
            class:loading
            disabled={loading}
          >
            {#if loading}
              Signing in...
            {:else}
              Sign in
            {/if}
          </button>
        </div>

        <div class="text-center">
          <p class="text-sm text-base-content/70">
            Don't have an account?
            <a
              href="/signup"
              class="font-medium text-primary hover:text-primary-focus"
            >
              Sign up here
            </a>
          </p>
        </div>
      </div>
    </form>
  </div>
</div>
