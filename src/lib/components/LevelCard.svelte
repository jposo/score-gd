<script lang="ts">
  import getDifficultyColor from "$lib/tools/getDifficultyColor";
  import { goto } from "$app/navigation";

  let props: {
    id: number;
    name: string;
    publisher: string | null;
    rating?: number;
    difficulty: string;
    length: string;
    releaseDate?: string | null;
    tabIndex: number;
  } = $props();

  function navigateToLevel(gdId: number) {
    goto(`/levels/${gdId}`);
  }
</script>

<div
  class="card bg-base-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:bg-base-300"
  onclick={() => navigateToLevel(props.id)}
  onkeydown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      navigateToLevel(props.id);
    }
  }}
  tabindex={props.tabIndex ?? 0}
  role="button"
>
  <div class="card-body">
    <div class="flex flex-row justify-between">
      <div class="flex flex-col">
        <h2 class="card-title text-lg">{props.name}</h2>
        <div class="text-sm opacity-75 space-y-1">
          <div>
            by <span class="font-medium">{props.publisher ?? "unknown"}</span>
          </div>
          <div class={getDifficultyColor(props.difficulty)}>
            <span class="font-semibold">{props.difficulty.toLowerCase()}</span>
          </div>
          <div class="text-xs">
            {props.length.toLowerCase()}
            {#if props.releaseDate}
              <span class="mx-1">&#8226;</span>
              {new Date(props.releaseDate).getFullYear()}
            {/if}
          </div>
        </div>
      </div>
      <div class="flex flex-col justify-items-end">
        <div class="text-end">
          {#if props.rating}
            {props.rating.toFixed(1)}
          {:else}
            n/a
          {/if}
        </div>
      </div>
    </div>
    <div class="card-actions justify-end mt-2">
      <div class="badge badge-outline text-xs">
        #{props.id}
      </div>
    </div>
  </div>
</div>
