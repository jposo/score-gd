<script lang="ts">
  import { fade } from "svelte/transition";
  interface Props {
    type: "info" | "success" | "error";
    message: string;
  }

  let { type: level, message }: Props = $props();
</script>

<div class="toast" transition:fade={{ duration: 300 }}>
  <div class="alert alert-{level}">
    <span>{message}</span>
  </div>
</div>
