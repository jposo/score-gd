<script lang="ts">
  import { dateToLocaleString } from "$lib/tools/utils";

  let { levelId, name, placement, ...restProps } = $props<{
    levelId: number;
    name: string;
    placement: number;
  }>();

  // const subtitle = [props.rating, props.status]
  //   .filter((p) => p !== null)
  //   .join(" • ");
</script>

<div class="flex flex-col gap-2 text-left" {...restProps}>
  <div class="flex flex-col content-center w-full">
    <div class="flex flex-row justify-between">
      <span class="font-bold text-primary hover:underline"
        ><a href="/level/{levelId}">{name}</a></span
      >
      <!-- <span class="opacity-50">{dateToString(props.createdAt)}</span> -->
    </div>
    <!-- <div class="font-semibold">{subtitle}</div> -->
  </div>
  <!-- {#if props.review}
    <div>
      {props.review}
    </div>
  {/if} -->
</div>
