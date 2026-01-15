<script lang="ts">
  import type { PageData } from "./$types";
  import Card from "$lib/components/LevelCard.svelte";

  let { data }: { data: PageData } = $props();
</script>

<div class="container mx-auto p-4">
  <h1 class="text-3xl font-bold mb-6">top levels</h1>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {#each data.levels as level, index (level.id)}
      <Card
        id={level.id}
        name={level.name}
        publisher={level.publisher}
        rating={level.averageScore}
        difficulty={level.difficulty}
        length={level.length}
        tabIndex={index}
      />
    {/each}
  </div>
</div>
