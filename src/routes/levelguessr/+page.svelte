<script lang="ts">
  import Carousel from "$lib/components/Carousel.svelte";
  import { onMount } from "svelte";
  import type { PageProps, SubmitFunction } from "./$types";
  import { enhance } from "$app/forms";
  import { guessesState } from "$lib/state/guesses.svelte";
  import { toastManager } from "$lib/state/toasts.svelte";
  import type { SearchResult } from "$lib/shared/types";

  let { data }: PageProps = $props();

  let now = $state(Date.now());
  let target = $derived(new Date(data.updatesOn).getTime());

  let diff = $derived(Math.max(0, target - now));
  let diffHours = $derived(Math.floor(diff / (1000 * 60 * 60)));
  let diffMinutes = $derived(
    Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
  );
  let diffSeconds = $derived(Math.floor((diff % (1000 * 60)) / 1000));

  let isSubmitting = $state(false);
  let viewImage = $state(0);
  let input = $state("");
  let guessId = $state<number>();
  let searchResults = $state<SearchResult[]>([]);

  let guesses = $derived(data.guessHistory);
  let hints = $derived(data.game.hints);
  let answer = $derived(data.game.answer);
  let imageUrls = $derived(data.game.images);

  let currentGuess = $derived(guesses.length + 1);
  let status = $derived(
    guesses.some((guess) => guess.correct)
      ? "correct"
      : guesses.length >= 6
        ? "incorrect"
        : "ongoing",
  );
  let imageGallery = $derived(
    imageUrls
      .map((image, index) => ({
        src: image,
        caption:
          hints && hints[index]
            ? `${hints[index].hint ?? ""}: ${hints[index]?.value ?? ""}`.toLowerCase()
            : "",
      }))
      .slice(0, status === "correct" ? imageUrls.length : currentGuess),
  );

  onMount(() => {
    const interval = setInterval(() => {
      now = Date.now();
    }, 1000);

    return () => clearInterval(interval);
  });

  $effect(() => {
    viewImage = Math.max(
      0,
      Math.min(currentGuess - 1, imageGallery.length - 1),
    );
  });

  $effect(() => {
    // timer debounce between api requests
    input = input;
    const timeoutId = setTimeout(async () => {
      try {
        if (input.length < 1 || input.length > 20) {
          searchResults = [];
          return;
        }
        const response = await fetch(`/search?q=${input}&s=levelguessr`);
        if (response.ok) {
          const results = await response.json();
          // console.log(`Search successful, returned ${results.length} results.`);
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

  function selectResult(result: SearchResult) {
    input = result.name!;
    guessId = result.id;
    searchResults = [];
  }
</script>

<Carousel images={imageGallery} select={viewImage} />

{#if status === "ongoing"}
  <div class="flex w-full justify-center">
    <div class="dropdown **dropdown-open**">
      <form
        method="POST"
        use:enhance={(() => {
          isSubmitting = true;
          return async ({ result }) => {
            console.log(result);
            if (result.type === "success") {
              if (result.data?.guesses) {
                guessesState.setGuesses(data.game.day, result.data.guesses);
                guesses = result.data.guesses;
              }

              if (result.data?.hints) {
                hints = result.data.hints;
              }
              if (result.data?.images) {
                imageUrls = result.data.images;
              }
              if (result.data?.answer) {
                answer = result.data.answer;
              }

              input = "";
              guessId = undefined;
            } else if (result.type === "failure") {
              toastManager.add(
                (result.data?.message as string) ?? "unknown error",
                "error",
              );
            } else {
              toastManager.add("unknown error", "error");
              console.log(result);
            }
            isSubmitting = false;
          };
        }) satisfies SubmitFunction}
      >
        <input name="day" type="hidden" value={data.game.day} />
        <input name="guess" type="hidden" value={input} />
        <input name="guessId" type="hidden" value={guessId} />
        <div class="join">
          <label class="input w-full join-item">
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
              required
              placeholder="search"
              bind:value={input}
              class="text-2xl"
              disabled={isSubmitting}
            />
          </label>
          <button
            type="submit"
            class="btn btn-primary btn-2xl join-item w-18"
            disabled={isSubmitting}
          >
            {#if isSubmitting}
              <span class="loading loading-dots loading-xs"></span>
            {:else}
              guess
            {/if}
          </button>
        </div>
      </form>
      {#if searchResults.length > 0}
        <ul
          tabindex="-1"
          class="dropdown-content overflow-y-auto flex-nowrap z-1 menu p-2 shadow bg-base-300 rounded-box w-full max-h-52 text-2xl **mt-2**"
        >
          {#each searchResults as result}
            <li value={result.id}>
              <button
                class="flex justify-between"
                onclick={() => selectResult(result)}
                onkeydown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    selectResult(result);
                  }
                }}
                >{result.name}<span class="text-base text-right opacity-60"
                  >{result.publisher}</span
                ></button
              >
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  </div>
{/if}

{#if status === "correct" || status === "incorrect"}
  <div class="flex w-full flex-col my-4 items-center">
    <h1 class="text-3xl font-bold">
      {#if status === "correct"}
        you guessed correctly!
      {:else}
        better luck next time!
      {/if}
    </h1>
    <p class="text-xl pt-2">
      the answer was <span class="font-bold"
        >{answer?.name ?? "unknown level"}</span
      >
      by
      <span class="font-bold">{answer?.publisher ?? "unknown publisher"}</span>
    </p>
    <p class="text-md pt-2 opacity-60">
      come back in <span class="countdown font-mono">
        <span
          style="--value:{diffHours};"
          aria-live="polite"
          aria-label={`${diffHours}`}>{diffHours}</span
        >
        h
        <span
          style="--value:{diffMinutes};"
          aria-live="polite"
          aria-label={`${diffMinutes}`}>{diffMinutes}</span
        >
        m
        <span
          style="--value:{diffSeconds};"
          aria-live="polite"
          aria-label={`${diffSeconds}`}>{diffSeconds}</span
        >
        s
      </span>
    </p>
  </div>
{/if}

<div class="flex w-full flex-col my-4 items-center">
  {#each guesses.toReversed() ?? [] as guess}
    <div
      class="card card-border max-w-xl flex flex-row {guess.correct
        ? 'bg-success text-success-content'
        : 'bg-error text-error-content'} my-1 w-1/2 bg-base-300 rounded-box h-10 items-center justify-center gap-1"
    >
      <span class="font-bold">{guess.name}</span>
      <span>{guess.publisher}</span>
    </div>
  {/each}
</div>
