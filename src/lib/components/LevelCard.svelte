<script lang="ts">
  import { getDifficultyColor } from "$lib/tools/utils";
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
          <div class="flex flex-row gap-1 align-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="size-[1.5em]"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
              />
            </svg>
            {#if props.rating}
              {props.rating.toFixed(1)}
            {:else}
              n/a
            {/if}
          </div>
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
