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
    items: { id: number; level_name: string }[];
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

<div
  use:dndzone={{ items, flipDurationMs, dragDisabled: !editMode }}
  onconsider={handleDndConsider}
  onfinalize={handleDndFinalize}
  class="w-full"
>
  {#each items as item, index (item.id)}
    <div
      class="collapse bg-base-200 border border-base-300 my-2"
      animate:flip={{ duration: flipDurationMs }}
    >
      <!-- <input type="radio" name="my-accordion-1" checked={true} /> -->
      <div class="collapse-title font-semibold flex flex-row items-center">
        {#if editMode}
          <Icon src={Bars3} class="size-4 me-2" />
        {/if}
        #{index + 1}
        {item.level_name}
      </div>
      <div class="collapse-content text-sm">{item.level_name}</div>
    </div>
  {/each}
</div>
