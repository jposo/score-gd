<script lang="ts">
  import { dateToString } from "$lib/tools/utils";

  let props: {
    link: string | null;
    title: string;
    status: string;
    createdAt: Date;
    rating: number | null;
    review: string | null;
  } = $props();

  const subtitle = [props.rating, props.status]
    .filter((p) => p !== null)
    .join(" • ");
</script>

<div class="flex flex-col gap-2 text-left">
  <div class="flex flex-col content-center w-full">
    <div class="flex flex-row justify-between">
      <span class="font-bold text-primary hover:underline"
        ><a href={props.link}>{props.title}</a></span
      >
      <span class="opacity-50">{dateToString(props.createdAt)}</span>
    </div>
    <div class="font-semibold">{subtitle}</div>
  </div>
  {#if props.review}
    <div>
      {props.review}
    </div>
  {/if}
</div>
