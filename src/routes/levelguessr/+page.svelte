<script lang="ts">
  import Carousel from "$lib/components/Carousel.svelte";
  import { onMount } from "svelte";
  import type { PageProps } from "./$types";
  import { enhance } from "$app/forms";
  import { guessesState } from "$lib/state/guesses.svelte";
  import { toastManager } from "$lib/state/toasts.svelte";

  let { data }: PageProps = $props();

  type SearchResult = {
    id: number;
    name: string | null;
    publisher: string | null;
  };

  let now = $state(Date.now());
  let target = new Date(data.updatesOn).getTime();

  let diff = $derived(Math.max(0, target - now));
  let diffHours = $derived(Math.floor(diff / (1000 * 60 * 60)));
  let diffMinutes = $derived(
    Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
  );
  let diffSeconds = $derived(Math.floor((diff % (1000 * 60)) / 1000));

  // let images = $derived(data.day.images.sort((a, b) => a.index - b.index));

  let viewImage = $state(0);
  let input = $state("");
  let guessId = $state<number>();
  let searchResults = $state<SearchResult[]>([]);
  let guesses = $derived(guessesState.value);
  let currentGuess = $derived(
    data.day.number in guesses ? guesses[data.day.number].length + 1 : 1,
  );
  let status = $derived(
    guesses[data.day.number]?.some((guess) => guess.correct)
      ? "correct"
      : guesses[data.day.number]?.length >= 6
        ? "incorrect"
        : "ongoing",
  );
  let hints = $state<
    Record<
      number,
      Record<number, { hint: string; value: string | number | null }>
    >
  >({});

  let answer = $derived(
    guesses[data.day.number]?.filter((guess) => guess.answer)?.[0]?.answer,
  );
  let showAlert = $state(false);
  let alertMessage = $state("");

  onMount(() => {
    const interval = setInterval(() => {
      now = Date.now();
    }, 1000);

    const storedHints = localStorage.getItem("hints");
    if (storedHints) {
      hints = JSON.parse(storedHints);
    }

    return () => clearInterval(interval);
  });

  let images = $derived(
    data.day.images
      .map((image, index) => ({
        src: image,
        caption: hints[data.day.number]?.[index]
          ? `${hints[data.day.number]?.[index]?.hint ?? ""}: ${hints[data.day.number]?.[index]?.value ?? ""}`.toLowerCase()
          : "",
      }))
      .slice(0, status === "correct" ? data.day.images.length : currentGuess),
  );

  $effect(() => {
    viewImage = Math.max(0, Math.min(currentGuess - 1, images.length - 1));
  });

  $effect(() => {
    // timer debounce between api requests
    input = input;
    const timeoutId = setTimeout(async () => {
      try {
        if (input.length < 2) {
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

  // function displayError(message: string) {
  //   console.error(message);
  //   showAlert = true;
  //   alertMessage = message;
  //   setTimeout(() => {
  //     showAlert = false;
  //   }, 3000);
  // }
</script>

<!-- {#if showAlert}
  <div
    role="alert"
    class="alert alert-error fixed top-4 left-1/2 -translate-x-1/2 w-96 transition-all"
  >
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
    <span>{alertMessage}</span>
  </div>
{/if} -->

<Carousel {images} select={viewImage} />

{#if status === "ongoing"}
  <div class="flex w-full justify-center">
    <div class="dropdown **dropdown-open**">
      <form
        method="POST"
        use:enhance={() => {
          return async ({ result }) => {
            console.log(result);
            if (result.type === "success") {
              guessesState.addGuess(data.day.number, {
                guess: input,
                correct: (result.data?.correct as boolean) ?? false,
                answer: result.data?.answer ?? null,
              });
              const day = data.day.number;

              if (!hints[day]) {
                hints[day] = {};
              }

              const newHints = result.data?.hints ?? {};

              hints[day] = {
                ...hints[day],
                ...newHints,
              };

              localStorage.setItem("hints", JSON.stringify(hints));

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
          };
        }}
      >
        <input name="day" type="hidden" value={data.day.number} />
        <input name="guess" type="hidden" value={input} />
        <input name="guessId" type="hidden" value={guessId} />
        <input
          name="guessCount"
          type="hidden"
          value={(guesses[data.day.number]?.length ?? 0) + 1}
        />
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
            />
          </label>
          <button type="submit" class="btn btn-2xl join-item">guess</button>
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
      the answer was <span class="font-bold">{answer?.name ?? "level"}</span>
      by
      <span class="font-bold">{answer?.publisher ?? "publisher"}</span>
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
  {#each guesses[data.day.number]?.toReversed() ?? [] as guess}
    <div
      class="card card-border max-w-xl {guess.correct
        ? 'border-success shadow-lg shadow-success/30'
        : 'border-error shadow-lg shadow-error/30'} my-1 w-1/2 bg-base-300 rounded-box grid h-10 place-items-center"
    >
      {guess.guess}
      <!-- <span class="font-bold">{guess.publisher}</span> -->
    </div>
  {/each}
</div>
