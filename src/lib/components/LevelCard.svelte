<script lang="ts">
  import { goto } from "$app/navigation";

  let props: {
    id: number;
    name: string;
    publisher: string | null;
    score?: number;
    difficulty: string;
    length: string;
    releaseDate?: string | null;
    spotlightType?: "daily" | "weekly" | "event" | null;
  } = $props();

  let thumbnailFailed = $state(false);

  const thumbnailUrl = $derived(
    `https://levelthumbs.prevter.me/thumbnail/${props.id}/small`,
  );

  function navigateToLevel(gdId: number) {
    goto(`/levels/${gdId}`);
  }

  const spotlightBadgeClass = $derived(
    props.spotlightType === "daily"
      ? "badge-primary"
      : props.spotlightType === "weekly"
        ? "badge-secondary"
        : props.spotlightType === "event"
          ? "badge-accent"
          : "badge-neutral",
  );
</script>

<div class="indicator w-full">
  {#if props.spotlightType}
    <span
      class={`indicator-item badge badge-sm ${spotlightBadgeClass} lowercase font-semibold z-20`}
    >
      {props.spotlightType}
    </span>
  {/if}

  <div
    class="card group w-full bg-base-200 shadow-sm hover:shadow-xl transition-all duration-200 cursor-pointer hover:bg-base-300 overflow-hidden relative hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] outline-none ring-0 hover:ring-2 hover:ring-white/30 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100"
    onclick={() => navigateToLevel(props.id)}
    onkeydown={(e) => {
      if (e.key === "Enter" || e.key === " ") {
        navigateToLevel(props.id);
      }
    }}
    tabindex={0}
    role="button"
  >
    {#if !thumbnailFailed}
      <div class="absolute inset-0">
        <img
          src={thumbnailUrl}
          alt={`${props.name} thumbnail`}
          class="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
          onerror={() => {
            thumbnailFailed = true;
          }}
        />
      </div>
      <div
        class="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/80"
      ></div>
      <div
        class="absolute inset-0 bg-white/0 transition-colors duration-200 group-hover:bg-white/10 group-focus-visible:bg-white/15"
      ></div>
    {/if}

    <div
      class="card-body relative z-5 min-h-44 justify-end p-4 text-neutral-content [text-shadow:0_1px_2px_rgba(0,0,0,0.65)]"
    >
      <h2 class="card-title text-lg leading-tight">{props.name}</h2>
      <div class="text-sm opacity-90">
        by <span class="font-medium">{props.publisher ?? "unknown"}</span>
      </div>

      <div class="flex flex-wrap items-center gap-2 text-xs">
        <div class="badge border-white/40 bg-black/30 text-neutral-content">
          <span class="font-semibold">{props.difficulty.toLowerCase()}</span>
        </div>
        <div class="badge border-white/40 bg-black/30 text-neutral-content">
          {props.length.toLowerCase()}
        </div>
        {#if props.score !== undefined && props.score !== null}
          <div class="badge border-white/40 bg-black/30 text-neutral-content">
            {props.score.toFixed(1)}
          </div>
        {/if}
        {#if props.releaseDate}
          <div class="badge border-white/40 bg-black/30 text-neutral-content">
            {new Date(props.releaseDate).getFullYear()}
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
