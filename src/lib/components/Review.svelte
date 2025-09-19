<script lang="ts">
  import { dateToString, abbreviateNumber } from "$lib/tools/utils";

  let props: {
    username: string;
    profilePictureUrl: string | null;
    status: string;
    date: Date;
    rating: number | null;
    attempts: number | null;
    review: string;
  } = $props();

  const formattedAttempts = props.attempts
    ? abbreviateNumber(props.attempts)
    : null;

  const subtitle = [props.rating, props.status, formattedAttempts]
    .filter((p) => p !== null)
    .join(" • ");
</script>

<div class="flex flex-col gap-2">
  <div class="avatar flex flex-row gap-4 h-12">
    <div class="w-12 rounded-full text-neutral-content bg-neutral">
      {#if props.profilePictureUrl}
        <img alt={props.username} src={props.profilePictureUrl} />
      {:else}
        <span class="text-sm">{props.username.charAt(0)}</span>
      {/if}
    </div>
    <div class="flex flex-col content-center w-full">
      <div class="flex flex-row justify-between">
        <span class="font-bold text-primary hover:underline"
          ><a href="/profile/{props.username}">{props.username}</a></span
        >
        <span class="opacity-50">{dateToString(props.date)}</span>
      </div>
      <div class="font-semibold">{subtitle}</div>
    </div>
  </div>
  <div>
    {props.review}
  </div>
</div>
