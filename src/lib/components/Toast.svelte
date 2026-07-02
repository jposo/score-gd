<script lang="ts">
    import { fade } from "svelte/transition";
    interface Props {
        type: "info" | "success" | "error";
        message: string;
    }

    let { type: level, message }: Props = $props();
</script>

<div
    class="toast toast-center toast-top z-50 shadow-sm"
    transition:fade={{ duration: 300 }}
>
    <!--  this stopped working for some reason alert-{level} -->
    <div class="alert alert-{level}">
        <span>{message}</span>
    </div>
</div>
