<script lang="ts">
  import { goto } from "$app/navigation";
  import getDifficultyColor from "$lib/tools/getDifficultyColor";
  import type { PageData } from "./$types";
  import { page } from "$app/state";
  import Card from "$lib/components/LevelCard.svelte";
  import { difficulties, ratings, lengths } from "$lib/shared/gd";

  let { data }: { data: PageData } = $props();

  let pageParam = $state(page.url.searchParams.get("page") || "1");
  let selectedDifficulty = $state(
    page.url.searchParams.get("difficulty") || undefined,
  );
  let selectedRating = $state(page.url.searchParams.get("rating") || undefined);
  let selectedLength = $state(page.url.searchParams.get("length") || undefined);

  function advancePage(direction?: "back" | "next") {
    const delta = direction === "next" ? 1 : direction === "back" ? -1 : 0;
    const targetPage = parseInt(pageParam) + delta;
    const paramsObject: Record<string, string> = {
      page: targetPage.toString(),
    };
    if (selectedDifficulty) {
      paramsObject.difficulty = selectedDifficulty;
    }
    if (selectedRating) {
      paramsObject.rating = selectedRating;
    }
    if (selectedLength) {
      paramsObject.length = selectedLength;
    }
    const params = new URLSearchParams(paramsObject);
    goto(`/levels?${params.toString()}`);
    pageParam = targetPage.toString();
  }

  function changeDifficulty(value: string | undefined) {
    selectedDifficulty = value;
    advancePage();
  }

  function changeRating(value: string | undefined) {
    selectedRating = value;
    advancePage();
  }

  function changeLength(value: string | undefined) {
    selectedLength = value;
    advancePage();
  }
</script>

<svelte:head>
  <title>levels - loggd</title>
</svelte:head>

<div class="container mx-auto p-4">
  <div class="pb-4">
    <form class="filter [&>*]:mb-0.5">
      <input
        class="btn btn-square"
        type="reset"
        value="×"
        onclick={() => changeDifficulty(undefined)}
      />
      {#each difficulties as difficulty}
        <input
          class="btn"
          type="radio"
          name="difficulty"
          value={difficulty}
          aria-label={difficulty}
          onclick={() => changeDifficulty(difficulty)}
          checked={selectedDifficulty === difficulty}
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
        onclick={() => changeRating(undefined)}
      />
      {#each ratings as rating}
        <input
          class="btn"
          type="radio"
          name="rating"
          value={rating}
          aria-label={rating}
          onclick={() => changeRating(rating)}
          checked={selectedRating === rating}
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
        onclick={() => changeRating(undefined)}
      />
      {#each lengths as length}
        <input
          class="btn"
          type="radio"
          name="rating"
          value={length}
          aria-label={length}
          onclick={() => changeLength(length)}
          checked={selectedLength === length}
        />
      {/each}
    </form>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {#if data.levels.length === 0}
      <p>no levels found :(</p>
    {:else}
      {#each data.levels as level, index (level.id)}
        <Card
          id={level.id}
          name={level.name}
          publisher={level.publisher ?? "unknown"}
          difficulty={level.difficulty}
          length={level.length}
          releaseDate={level.releaseDate}
          tabIndex={index}
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
