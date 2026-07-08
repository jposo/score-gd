<script lang="ts">
  import { goto } from "$app/navigation";
  import type { PageData } from "./$types";
  import { page } from "$app/state";
  import Card from "$lib/components/LevelCard.svelte";
  import { difficulties, ratings, lengths } from "$lib/shared/gd";

  let { data }: { data: PageData } = $props();

  let pageParam = $state(page.url.searchParams.get("page") || "1");
  let selectedDifficulties = $state(
    page.url.searchParams.getAll("difficulty") || [],
  );
  let selectedRatings = $state(page.url.searchParams.getAll("rating") || []);
  let selectedLengths = $state(page.url.searchParams.getAll("length") || []);
  let searchQuery = $state(page.url.searchParams.get("q") || "");

  function advancePage(direction?: "back" | "next") {
    const delta = direction === "next" ? 1 : direction === "back" ? -1 : 0;
    const targetPage = parseInt(pageParam) + delta;
    const params = new URLSearchParams();

    params.set("page", targetPage.toString());
    if (searchQuery) params.set("q", searchQuery);

    const appendArray = (key: string, values: string[]) => {
      values.forEach((value) => params.append(key, value));
    };

    if (selectedDifficulties.length > 0) {
      appendArray("difficulty", selectedDifficulties);
    }
    if (selectedRatings.length > 0) {
      appendArray("rating", selectedRatings);
    }
    if (selectedLengths.length > 0) {
      appendArray("length", selectedLengths);
    }

    goto(`/levels?${params.toString()}`);
    pageParam = targetPage.toString();
  }

  function addDifficulty(value: string | undefined) {
    selectedDifficulties = value
      ? [value, ...difficulties.filter((d) => d !== value)]
      : [...difficulties];
    advancePage();
  }

  function addRating(value: string | undefined) {
    selectedRatings = value
      ? [value, ...ratings.filter((r) => r !== value)]
      : [...ratings];
    advancePage();
  }

  function addLength(value: string | undefined) {
    selectedLengths = value
      ? [value, ...lengths.filter((l) => l !== value)]
      : [...lengths];
    advancePage();
  }
</script>

<svelte:head>
  <title>levels - loggd</title>
</svelte:head>

<div class="container mx-auto py-4 px-8">
  <div class="pb-4">
    <form class="filter [&>*]:mb-0.5">
      <input
        class="btn btn-square"
        type="reset"
        value="×"
        onclick={() => addDifficulty(undefined)}
      />
      {#each difficulties as difficulty}
        <input
          class="btn"
          type="checkbox"
          name="difficulty"
          value={difficulty}
          aria-label={difficulty}
          onclick={() => addDifficulty(difficulty)}
          checked={selectedDifficulties.includes(difficulty)}
        />
      {/each}
    </form>
  </div>

  <div class="pb-4">
    <form class="filter [&>*]:mb-0.5">
      <input
        class="btn btn-square"
        type="reset"
        value="×"
        onclick={() => addRating(undefined)}
      />
      {#each ratings as rating}
        <input
          class="btn"
          type="checkbox"
          name="rating"
          value={rating}
          aria-label={rating}
          onclick={() => addRating(rating)}
          checked={selectedRatings.includes(rating)}
        />
      {/each}
    </form>
  </div>

  <div class="pb-4">
    <form class="filter [&>*]:mb-0.5">
      <input
        class="btn btn-square"
        type="reset"
        value="×"
        onclick={() => addLength(undefined)}
      />
      {#each lengths as length}
        <input
          class="btn"
          type="checkbox"
          name="length"
          value={length}
          aria-label={length}
          onclick={() => addLength(length)}
          checked={selectedLengths.includes(length)}
        />
      {/each}
    </form>
  </div>

  <div class="pb-4">
    <form>
      <input
        type="text"
        placeholder="search..."
        class="input"
        name="query"
        bind:value={searchQuery}
        onkeydown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            advancePage();
          }
        }}
      />
    </form>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {#if data.levels.length === 0}
      <p>no levels found :(</p>
    {:else}
      {#each data.levels as level (level.id)}
        <Card
          id={level.id}
          name={level.name}
          publisher={level.publisher ?? "unknown"}
          difficulty={level.difficulty}
          length={level.length}
          releaseDate={level.releaseDate}
        />
      {/each}
    {/if}
  </div>
  <div class="flex justify-center py-4">
    <div class="join">
      {#if parseInt(pageParam) > 1}
        <button class="join-item btn" onclick={() => advancePage("back")}
          >«</button
        >
      {/if}
      <button class="join-item btn">Page {pageParam}</button>
      <!-- {#if !data.page.isLastPage} -->
      <button class="join-item btn" onclick={() => advancePage("next")}
        >»</button
      >
      <!-- {/if} -->
    </div>
  </div>
</div>
