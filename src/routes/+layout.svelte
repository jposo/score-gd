<script lang="ts">
  import "../app.css";
  import favicon from "$lib/assets/favicon.svg";
  import { theme, themes, setTheme } from "$lib/tools/theme";
  import { onMount } from "svelte";
  import type { PageData } from "./$types";
  import { goto } from "$app/navigation";
  import { guessesState } from "$lib/state/guesses.svelte";
  import Toast from "$lib/components/Toast.svelte";
  import { toastManager } from "$lib/state/toasts.svelte";

  let { children, data }: { children: any; data: PageData } = $props();

  let vaultModal: HTMLDialogElement;
  let searchModal: HTMLDialogElement;
  let guesses = $derived(guessesState.value);

  let searchResults:
    | { id: number; name: string; publisher: string }[]
    | undefined = $state();
  let isSearchOpen = $state(false);
  let searchInput: string | undefined = $state();
  let search: HTMLInputElement;

  // Initialize theme on mount
  onMount(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    theme.set(savedTheme);
    console.log(data.user);
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

  function navigateToLevel(gdId: number) {
    goto(`/levels/${gdId}`);
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

<nav
  class="navbar bg-base-300/80 shadow-sm px-4 sticky top-0 z-10 backdrop-blur"
>
  <div class="navbar-start gap-2">
    <a href="/" class="btn btn-ghost text-2xl">loggd</a>

    <button class="btn btn-ghost" onclick={() => openSearch()}>
      search...
    </button>
    <div class="dropdown dropdown-end">
      <!-- <div>
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
            onclick={() => searchModal.showModal()}
            type="search"
            placeholder="search"
            bind:value={searchInput}
          />
        </label>
      </div> -->
      {#if searchResults && searchResults.length > 0}
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

  <div class="navbar-end gap-2">
    <div class="dropdown dropdown-hover">
      <div tabindex="0" role="button" class="btn btn-ghost">levelguessr</div>
      <ul
        tabindex="-1"
        class="dropdown-content menu bg-base-300 rounded-box z-1 w-52 p-2 shadow-sm"
      >
        <li><a href="/levelguessr">daily</a></li>
        <li><button onclick={() => vaultModal?.showModal()}>vault</button></li>
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
          class="btn btn-ghost btn-circle avatar {data.user.profilePicturePath
            ? ''
            : 'avatar-placeholder'} "
        >
          <div class="w-10 rounded-full text-neutral-content bg-neutral">
            {#if data.user.profilePicturePath}
              <img
                alt={data.user.username}
                src={data.user.profilePicturePath}
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
            <span>hi, {data.user.username}!</span>
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
      <a href="/signup" class="btn btn-ghost w-24">sign Up</a>
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
  <div class="modal-box w-5/6 max-w-5xl h-3/4 flex flex-col gap-4">
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

{#each toastManager.queue as toast (toast.id)}
  <Toast type={toast.type} message={toast.message} />
{/each}

{@render children?.()}
