<script lang="ts">
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import getDifficultyColor from "$lib/tools/getDifficultyColor";
  import type { Level } from "$lib/db-types";
  import type { PageProps } from "./$types";

  let { data }: { data: PageProps } = $props();

  let levels: Level[] = $state([]);
  let loading = $state(true);

  onMount(() => {
    levels = data.data as Level[];
    loading = false;
  });

  function navigateToLevel(gd_id: number) {
    goto(`/level/${gd_id}`);
  }
</script>

<div class="container mx-auto p-4">
  <h1 class="text-3xl font-bold mb-6">Trending Levels</h1>

  <!-- <button
    class="btn btn-primary"
    onclick={async () => {
      fetch("/api/levels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pageCount: 3 }),
      })
        .then((response) => response.json())
        .then((data) => console.log(data));
    }}>Click me</button
  > -->

  {#if loading}
    <div class="flex justify-center items-center py-12">
      <span class="loading loading-ball loading-lg"></span>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each levels as level, index (level.id)}
        <div
          class="card bg-base-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer hover:bg-base-300"
          onclick={() => navigateToLevel(level.geometry_dash_id)}
          onkeydown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              navigateToLevel(level.geometry_dash_id);
            }
          }}
          tabindex={-2 - index}
          role="button"
        >
          <div class="card-body">
            <h2 class="card-title text-lg">{level.name}</h2>
            <div class="text-sm opacity-75 space-y-1">
              <div>by <span class="font-medium">{level.publisher}</span></div>
              <div class={getDifficultyColor(level.difficulty)}>
                <span class="font-semibold">{level.difficulty}</span>
              </div>
              <div class="text-xs">
                {level.type === "Classic" ? level.length : level.type}
                {#if level.release_date}
                  &#8226;
                  {new Date(level.release_date).getFullYear()} &#8226;
                {/if}
                <!-- {level.aggregated?.avgEnjoymentRating.toFixed(1)} -->
              </div>
            </div>
            <div class="card-actions justify-end mt-2">
              <div class="badge badge-outline text-xs">
                #{level.geometry_dash_id}
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
