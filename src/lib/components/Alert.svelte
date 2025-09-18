<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { fade } from "svelte/transition";

  let props: { message: string; type: string; duration: number } = $props();

  let visible = $state(true);
  let timeoutId: NodeJS.Timeout;

  onMount(() => {
    timeoutId = setTimeout(() => {
      visible = false;
    }, props.duration);
  });

  onDestroy(() => {
    clearTimeout(timeoutId);
  });
</script>

{#if visible}
  <div class="alert-container" transition:fade>
    <div role="alert" class="alert alert-{props.type} w-fit">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6 shrink-0 stroke-current"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>{props.message}</span>
    </div>
  </div>
{/if}

<style>
  .alert-container {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
  }
</style>
