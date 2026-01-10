<script lang="ts">
  import { goto } from "$app/navigation";
  import getDifficultyColor from "$lib/tools/getDifficultyColor";
  import type { PageData } from "./$types";
  import { page } from "$app/state";
  import Card from "$lib/components/LevelCard.svelte";

  let { data }: { data: PageData } = $props();

  let pageNumber = $state(page.url.searchParams.get("page") || "1");

  function navigateToLevel(gd_id: number) {
    goto(`/levels/${gd_id}`);
  }

  function advancePage(next?: boolean) {
    const nextPage = parseInt(pageNumber) + (next ? 1 : -1);
    goto(`/levels?page=${nextPage}`);
    pageNumber = nextPage.toString();
  }
</script>

<svelte:head>
  <title>levels - loggd</title>
</svelte:head>

<div class="container mx-auto p-4">
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
  </div>
  <div class="flex justify-center py-4">
    <div class="join">
      {#if parseInt(pageNumber) > 1}
        <button class="join-item btn" onclick={() => advancePage(false)}
          >«</button
        >
      {/if}
      <button class="join-item btn">Page {pageNumber}</button>
      <!-- {#if !data.page.isLastPage} -->
      <button class="join-item btn" onclick={() => advancePage(true)}>»</button>
      <!-- {/if} -->
    </div>
  </div>
</div>
