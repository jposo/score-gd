<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { onMount } from "svelte";

  let login = "";
  let password = "";
  let loading = false;
  let error = "";

  // Redirect if already logged in
  onMount(() => {
    if (page.data.user) {
      goto("/");
    }
  });

  async function handleSubmit() {
    if (!login || !password) {
      error = "Please fill in all fields";
      return;
    }

    loading = true;
    error = "";

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
      if (response.ok) {
        // Redirect to home page or the page they came from
        const redirectTo =
          new URL(window.location.href).searchParams.get("redirectTo") || "/";
        window.location.href = redirectTo;
      } else {
        error = data.error || "Login failed";
      }
    } catch (err) {
      console.error("Login error:", err);
      error = "Network error. Please try again.";
    } finally {
      loading = false;
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

<div
  class="min-h-full flex items-center justify-center bg-base-200 py-12 px-4 sm:px-6 lg:px-8"
>
  <div class="max-w-md w-full space-y-8">
    <div>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-base-content">
        Sign in to your account
      </h2>
    </div>

    <form class="mt-8 space-y-6" on:submit|preventDefault={handleSubmit}>
      <div class="space-y-4">
        <div>
          <label
            for="login"
            class="block text-sm font-medium text-base-content"
          >
            Email or Username
          </label>
          <input
            id="login"
            name="login"
            type="text"
            autocomplete="username"
            required
            class="input input-bordered w-full mt-1"
            placeholder="Enter your email or username"
            bind:value={login}
            on:keydown={handleKeydown}
            disabled={loading}
          />
        </div>

        <div>
          <label
            for="password"
            class="block text-sm font-medium text-base-content"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autocomplete="current-password"
            required
            class="input input-bordered w-full mt-1"
            placeholder="Enter your password"
            bind:value={password}
            on:keydown={handleKeydown}
            disabled={loading}
          />
        </div>
      </div>

      {#if error}
        <div role="alert" class="alert alert-error">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </div>
      {/if}

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
    </form>
  </div>
</div>
