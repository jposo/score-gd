<script lang="ts">
  import "../app.css";
  import favicon from "$lib/assets/favicon.svg";
  import { theme, themes, setTheme } from "$lib/tools/theme";
  import { onMount } from "svelte";
  import type { PageData } from "./$types";
  import type { KeyboardEventHandler } from "svelte/elements";

  let { children, data }: { children: any; data: PageData } = $props();

  let searchResults:
    | { id: number; name: string; publisher: string }[]
    | undefined = $state();
  let searchInput: string | undefined = $state();

  // Initialize theme on mount
  onMount(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    theme.set(savedTheme);
  });

  // Logout function
  async function handleLogout() {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Reload the page to clear all client-side state
        window.location.href = "/";
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  async function handleSearch() {
    return;
    if (!searchInput) return;
    if (searchInput && searchInput.length < 4) {
      searchResults = [];
      return;
    }

    const response = await fetch(`/api/search?q=${searchInput}`);
    const results = await response.json();
    searchResults = results;
  }
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <title>loggd</title>
</svelte:head>

<nav class="navbar bg-base-300 shadow-sm">
  <div class="navbar-start">
    <a href="/" class="btn btn-ghost text-xl">loggd</a>
  </div>

  <div class="navbar-center">
    <a href="/levels" class="btn">Levels</a>
  </div>

  <div class="navbar-end flex gap-4">
    <div class="dropdown dropdown-end">
      <div>
        <label class="input">
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
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </g>
          </svg>
          <input
            type="search"
            placeholder="Search"
            bind:value={searchInput}
            onkeydown={handleSearch}
          />
        </label>
      </div>
      {#if searchResults}
        <ul
          tabindex="-1"
          class="dropdown-content z-10 p-2 mt-2 shadow bg-base-300 rounded-box w-52 max-h-96 overflow-y-auto"
        >
          {#if searchResults.length > 0}
            <li>fucky 1</li>
            {#each searchResults as result}
              <li>
                {result.name}
              </li>
            {/each}
          {:else}
            <li>fucky 2</li>
          {/if}
        </ul>
      {/if}
    </div>

    <!-- Theme Controller -->
    <div class="dropdown dropdown-end">
      <div tabindex="0" role="button" class="btn btn-ghost">
        <svg
          class="fill-current w-4 h-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
        >
          <path
            d="M448,256c0-106-86-192-192-192V448C362,448,448,362,448,256Z"
          />
          <path d="M256,64C150,64,64,150,64,256s86,192,192,192V64Z" />
        </svg>
        Theme
      </div>
      <ul
        tabindex="-1"
        class="dropdown-content z-10 p-2 mt-2 shadow bg-base-300 rounded-box w-52 max-h-96 overflow-y-auto"
      >
        {#each themes as themeOption}
          {@const isCurrentTheme = $theme === themeOption}
          <li>
            <input
              type="radio"
              name="theme-dropdown"
              class="theme-controller btn btn-sm btn-block {!isCurrentTheme
                ? 'btn-ghost'
                : ''} justify-start"
              aria-label={themeOption}
              value={themeOption}
              checked={isCurrentTheme}
              onchange={() => setTheme(themeOption)}
            />
          </li>
        {/each}
      </ul>
    </div>

    {#if data.user}
      <!-- Authenticated user menu -->
      <div class="dropdown dropdown-end">
        <div
          tabindex="0"
          role="button"
          class="btn btn-ghost btn-circle avatar {data.user.profile_picture_url
            ? ''
            : 'avatar-placeholder'} "
        >
          <div class="w-10 rounded-full text-neutral-content bg-neutral">
            {#if data.user.profile_picture_url}
              <img
                alt={data.user.username}
                src={data.user.profile_picture_url}
              />
            {:else}
              <span class="text-sm">{data.user.username.charAt(0)}</span>
            {/if}
          </div>
        </div>
        <ul
          tabindex="-1"
          class="menu menu-sm dropdown-content bg-base-300 rounded-box z-1 mt-2 w-52 p-2 shadow"
        >
          <li class="menu-title">
            <span>Hi, {data.user.username}!</span>
          </li>
          <li>
            <a href="/profile/{data.user.username}"> Profile </a>
          </li>
          {#if data.user.roles.includes("Admin")}
            <li><a href="/admin">Admin</a></li>
          {/if}
          <li><a href="/settings">Settings</a></li>
          <li><button onclick={handleLogout}>Logout</button></li>
        </ul>
      </div>
    {:else}
      <!-- Unauthenticated user options -->
      <div class="flex gap-2">
        <a href="/signup" class="btn btn-ghost w-22">Sign Up</a>
        <a href="/login" class="btn btn-primary w-22">Login</a>
      </div>
    {/if}
  </div>
</nav>
<main>
  {@render children?.()}
</main>
