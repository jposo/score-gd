<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { onMount } from "svelte";

  let username = "";
  let email = "";
  let password = "";
  let confirmPassword = "";
  let loading = false;
  let error = "";

  // Redirect if already logged in
  onMount(() => {
    if ($page.data.user) {
      goto("/");
    }
  });

  async function handleSubmit(event: Event) {
    event.preventDefault();
    // Basic validation
    if (!username || !email || !password || !confirmPassword) {
      error = "Please fill in all fields";
      return;
    }

    if (password !== confirmPassword) {
      error = "Passwords do not match";
      return;
    }

    loading = true;
    error = "";

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to home page
        window.location.href = "/";
      } else {
        error = data.error || "Registration failed";
      }
    } catch (err) {
      console.error("Signup error:", err);
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
  <title>Sign Up - Loggd</title>
</svelte:head>

<div class="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    <div>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-base-content">
        Create your account
      </h2>
      <p class="mt-2 text-center text-sm text-base-content/70">
        Or
        <a
          href="/login"
          class="font-medium text-primary hover:text-primary-focus"
        >
          sign in to your existing account
        </a>
      </p>
    </div>

    <form class="mt-8 space-y-6" onsubmit={handleSubmit}>
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
              name="username"
              type="text"
              autocomplete="username"
              required
              placeholder="Choose a username"
              bind:value={username}
              onkeydown={handleKeydown}
              disabled={loading}
            />
          </label>
          <p class="label">
            3-30 characters, letters, numbers, hyphens, and underscores only
          </p>
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">Email Address</legend>
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
              placeholder="Enter your email address"
              bind:value={email}
              onkeydown={handleKeydown}
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
              autocomplete="new-password"
              required
              placeholder="Create a password"
              bind:value={password}
              onkeydown={handleKeydown}
              disabled={loading}
            />
          </label>
          <p class="label">
            At least 8 characters with uppercase, lowercase, and number
          </p>
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">Confirm Password</legend>
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
              placeholder="Confirm your password"
              bind:value={confirmPassword}
              onkeydown={handleKeydown}
              disabled={loading}
            />
          </label>
        </fieldset>

        {#if error}
          <div class="alert alert-error">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="stroke-current shrink-0 h-6 w-6"
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
              Creating account...
            {:else}
              Create account
            {/if}
          </button>
        </div>

        <div class="text-center">
          <p class="text-sm text-base-content/70">
            Already have an account?
            <a
              href="/login"
              class="font-medium text-primary hover:text-primary-focus"
            >
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </form>
  </div>
</div>
