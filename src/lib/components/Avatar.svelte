<script lang="ts">
    let props: {
        profilePictureUrl?: string;
        username: string | null;
    } = $props();
</script>

<div
    tabindex="0"
    role="button"
    class="btn btn-ghost btn-circle avatar {props.profilePictureUrl
        ? ''
        : 'avatar-placeholder'} "
>
    <div class="w-10 rounded-full text-neutral-content bg-neutral">
        {#if props.profilePictureUrl}
            <img alt={props.username} src={props.profilePictureUrl} />
        {:else}
            <span class="text-sm">{props.username?.charAt(0) ?? "0"}</span>
        {/if}
    </div>
</div>
