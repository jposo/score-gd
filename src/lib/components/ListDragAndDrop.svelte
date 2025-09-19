<script lang="ts">
  import { flip } from "svelte/animate";
  import { dndzone } from "svelte-dnd-action";
  import type { ListItem } from "$lib/shared/types";
  import { Icon, Bars3 } from "svelte-hero-icons";

  let {
    items,
    editMode,
    onDrop,
  }: {
    items: {
      id: number;
      level_name: string;
      publisher: string;
      attempts: number;
      enjoyment_rating: number;
    }[];
    editMode: boolean;
    onDrop: (newItems: ListItem[]) => void;
  } = $props();

  const flipDurationMs = 300;
  function handleDndConsider(e) {
    items = e.detail.items;
  }
  function handleDndFinalize(e) {
    const { items: newItems } = e.detail;
    items = newItems;
    onDrop([...newItems]);
  }
</script>

<ul
  use:dndzone={{ items, flipDurationMs, dragDisabled: !editMode }}
  onconsider={handleDndConsider}
  onfinalize={handleDndFinalize}
  class="list shadow-sm"
>
  {#each items as item, index (item.id)}
    <li
      class="list-row flex items-center"
      animate:flip={{ duration: flipDurationMs }}
    >
      <div class="flex items-center text-4xl font-thin opacity-30 tabular-nums">
        {#if editMode}
          <span class="cursor-grab">
            <Icon src={Bars3} class="size-6 me-2" />
          </span>
        {/if}
        {index + 1}
      </div>
      <!-- <div class="text-4xl font-thin opacity-30 tabular-nums">
        {index + 1}
      </div> -->
      <div class="list-col-grow">
        <div class="text-xl bold">
          {item.level_name}
          <span class="text-xs font-semibold opacity-60">
            {item.publisher}
          </span>
        </div>
        <div class="text-xs uppercase font-semibold opacity-60">
          {#if item.attempts}
            {item.attempts} attempts
          {/if}
          {#if item.enjoyment_rating}
            {item.enjoyment_rating}/10
          {/if}
        </div>
      </div>
    </li>
  {/each}
</ul>
