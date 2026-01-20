<script lang="ts">
  import "../app.css";
  import favicon from "$lib/assets/favicon.svg";
  import { themeManager } from "$lib/state/theme.svelte";
  import { onMount } from "svelte";
  import type { PageData } from "./$types";
  import { goto, invalidateAll } from "$app/navigation";
  import { guessesState } from "$lib/state/guesses.svelte";
  import Toast from "$lib/components/Toast.svelte";
  import { toastManager } from "$lib/state/toasts.svelte";
  import { navigating } from "$app/state";
  import type { SearchResult } from "$lib/shared/types";
  import Avatar from "$lib/components/Avatar.svelte";

  let { children, data }: { children: any; data: PageData } = $props();

  let vaultModal: HTMLDialogElement;
  let searchModal: HTMLDialogElement;
  let guesses = $derived(guessesState.value);

  let searchResults: SearchResult[] = $state([]);
  let isSearchOpen = $state(false);
  let searchInput: string | undefined = $state();
  let search: HTMLInputElement;

  const greetings = ["hi", "hello", "hey", "howdy", "greetings", "yo"];
  const greeting = greetings[Math.floor(Math.random() * greetings.length)];

  // Initialize theme on mount
  onMount(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    if (!themeManager.themes.includes(savedTheme)) {
      themeManager.setTheme(savedTheme);
    }
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
        await invalidateAll();
        // window.location.href = "/";
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  function openSearch() {
    isSearchOpen = true;
    searchModal?.showModal();
  }

  $effect(() => {
    if (isSearchOpen && search) {
      setTimeout(() => search?.focus(), 50);
    }
  });

  $effect(() => {
    if (!searchInput || searchInput.trim().length < 3) {
      searchResults = [];
      return;
    }

    // timer debounce between api requests
    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(`/search?q=${searchInput}`);
        if (response.ok) {
          const results = await response.json();
          searchResults = results;
        }
      } catch (error) {
        console.error("Search failed", error);
      }
    }, 300);

    // cleanup function: If the user types again before 300ms,
    // Svelte runs this to cancel the previous timer.
    return () => clearTimeout(timeoutId);
  });
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <title>loggd</title>
</svelte:head>

{#each toastManager.queue as toast (toast.id)}
  <Toast type={toast.type} message={toast.message} />
{/each}

<div class="flex flex-col min-h-screen">
  <nav
    class="navbar bg-base-300/80 shadow-sm px-4 sticky top-0 z-10 backdrop-blur"
  >
    <div class="navbar-start gap-2">
      <a href="/" class="btn btn-ghost text-2xl">loggd</a>

      <button class="btn btn-ghost" onclick={() => openSearch()}>
        search...
      </button>
      <div class="dropdown dropdown-end">
        {#if searchResults.length > 0}
          <ul
            tabindex="-1"
            class="dropdown-content z-10 p-2 mt-2 shadow bg-base-300 rounded-box w-52 max-h-96 overflow-y-auto"
          >
            {#each searchResults as result}
              <li>
                <a
                  href="/levels/{result.id}"
                  class="block py-2 px-4 hover:bg-base-200"
                >
                  {result.name}</a
                >
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    </div>

    <div class="navbar-end gap-1">
      <div class="dropdown dropdown-hover">
        <div tabindex="0" role="button" class="btn btn-ghost">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="h-5 w-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
            />
          </svg>
          levelguessr
        </div>
        <ul
          tabindex="-1"
          class="dropdown-content menu bg-base-300 rounded-box z-1 w-52 p-2 shadow-sm"
        >
          <li>
            <a href="/levelguessr">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="h-5 w-5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                />
              </svg>
              daily
            </a>
          </li>
          <li>
            <button onclick={() => vaultModal?.showModal()}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="h-5 w-5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z"
                />
              </svg>
              vault
            </button>
          </li>
        </ul>
      </div>
      <a href="/levels" class="btn btn-ghost">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="h-5 w-5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z"
          />
        </svg>
        levels
      </a>
      <!-- Theme Controller -->
      <div class="dropdown dropdown-end">
        <div tabindex="0" role="button" class="btn btn-ghost">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="h-5 w-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42"
            />
          </svg>
          appearance
        </div>
        <ul
          tabindex="-1"
          class="dropdown-content z-10 p-2 mt-2 shadow bg-base-300 rounded-box w-52 max-h-96 overflow-y-auto"
        >
          {#each themeManager.themes as themeOption}
            {@const isCurrentTheme = themeManager.currentTheme === themeOption}
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
                onchange={() => themeManager.setTheme(themeOption)}
              />
            </li>
          {/each}
        </ul>
      </div>

      {#if data.user}
        <!-- Authenticated user menu -->
        <div class="dropdown dropdown-end">
          <Avatar username={data.user.username} />
          <ul
            tabindex="-1"
            class="menu menu-sm dropdown-content bg-base-300 rounded-box z-1 mt-2 w-52 p-2 shadow"
          >
            <li class="menu-title">
              <span>{greeting}, {data.user.username}!</span>
            </li>
            <li>
              <a href="/profile/{data.user.username}">profile</a>
            </li>
            {#if data.user.roles?.includes("admin")}
              <li><a href="/admin">admin</a></li>
            {/if}
            <li><a href="/settings">settings</a></li>
            <li>
              <button onclick={handleLogout} class="text-error">logout</button>
            </li>
          </ul>
        </div>
      {:else}
        <!-- Unauthenticated user options -->
        <a href="/signup" class="btn btn-ghost w-24">sign up</a>
        <a href="/login" class="btn btn-primary w-24">login</a>
      {/if}
    </div>
  </nav>

  <dialog bind:this={vaultModal} class="modal backdrop-blur-sm">
    <div class="modal-box w-11/12 max-w-5xl">
      <h3 class="text-lg font-bold">vault</h3>
      <p class="py-4">select one of the previous levels</p>
      <div class="flex flex-wrap justify-center gap-2">
        {#each data.vault as day}
          <a
            role="button"
            href={`/levelguessr?day=${day}`}
            class="btn btn-xl btn-square {day in guesses &&
            guesses[day].some((guess) => guess.correct)
              ? 'border-success'
              : guesses[day]?.length >= 6
                ? 'border-error'
                : ''}"
            onclick={() => vaultModal?.close()}>{day}</a
          >
        {/each}
      </div>
      <div class="modal-action">
        <form method="dialog">
          <button class="btn">close</button>
        </form>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>

  <dialog
    bind:this={searchModal}
    class="modal backdrop-blur-sm"
    onclose={() => {
      isSearchOpen = false;
      searchInput = "";
    }}
  >
    <div class="modal-box w-5/6 max-w-5xl h-3/5 flex flex-col gap-4">
      <label class="input w-full border-b border-base-100 text-lg">
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
          placeholder="search..."
          bind:value={searchInput}
          bind:this={search}
        />
      </label>
      <div class="flex flex-wrap justify-center gap-4">
        {#if searchResults && searchResults.length > 0}
          <div class="flex flex-col w-full gap-2">
            <form method="dialog">
              {#each searchResults as result}
                <div class="flex w-full items-center px-4" tabindex="-1">
                  <a
                    role="button"
                    href="/levels/{result.id}"
                    onclick={() => searchModal.close()}
                    class="w-full hover:bg-base-300 px-4 py-2 rounded-box"
                  >
                    <div class="grid w-full items-center gap-0">
                      <div class="col-span-3 text-lg">
                        <span class="text-[0.75em] opacity-50">
                          {result.publisher}
                        </span>
                        <span class="block">
                          {result.name}
                        </span>
                      </div>
                    </div>
                  </a>
                </div>
              {/each}
            </form>
          </div>
        {:else}
          <p>no results found</p>
        {/if}
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>

  <main class="flex-grow">
    {#if navigating.complete}
      <div class="absolute inset-0 flex justify-center items-center h-full">
        <span class="loading loading-dots loading-xl"></span>
      </div>
    {:else}
      {@render children?.()}
    {/if}
  </main>

  <footer
    class="footer sm:footer-horizontal bg-neutral text-neutral-content items-center p-4"
  >
    <aside class="grid-flow-col items-center">
      <!-- <svg
        width="36"
        height="36"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        fill-rule="evenodd"
        clip-rule="evenodd"
        class="fill-current"
      >
        <path
          d="M22.672 15.226l-2.432.811.841 2.515c.33 1.019-.209 2.127-1.23 2.456-1.15.325-2.148-.321-2.463-1.226l-.84-2.518-5.013 1.677.84 2.517c.391 1.203-.434 2.542-1.831 2.542-.88 0-1.601-.564-1.86-1.314l-.842-2.516-2.431.809c-1.135.328-2.145-.317-2.463-1.229-.329-1.018.211-2.127 1.231-2.456l2.432-.809-1.621-4.823-2.432.808c-1.355.384-2.558-.59-2.558-1.839 0-.817.509-1.582 1.327-1.846l2.433-.809-.842-2.515c-.33-1.02.211-2.129 1.232-2.458 1.02-.329 2.13.209 2.461 1.229l.842 2.515 5.011-1.677-.839-2.517c-.403-1.238.484-2.553 1.843-2.553.819 0 1.585.509 1.85 1.326l.841 2.517 2.431-.81c1.02-.33 2.131.211 2.461 1.229.332 1.018-.21 2.126-1.23 2.456l-2.433.809 1.622 4.823 2.433-.809c1.242-.401 2.557.484 2.557 1.838 0 .819-.51 1.583-1.328 1.847m-8.992-6.428l-5.01 1.675 1.619 4.828 5.011-1.674-1.62-4.829z"
        ></path>
      </svg> -->
      <p>
        This site is a fan-made web page and is not affiliated with RobTop Games
        AB.
      </p>
    </aside>
    <nav class="grid-flow-col gap-4 md:place-self-center md:justify-self-end">
      <a
        aria-label="youtube channel url"
        href="https://www.youtube.com/@devpixel7"
        target="_blank"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          class="fill-current"
        >
          <path
            d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"
          ></path>
        </svg>
      </a>
    </nav>
  </footer>
</div>
