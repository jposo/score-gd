<script lang="ts">
    import { Icon, Pencil } from "svelte-hero-icons";

    let props: {
        id: number;
        name?: string;
        publisher?: string;
        score: number | null;
        status: string | null;
        completionPercentage: number | null;
        updatedAt: Date;
        isUser: boolean;
        onClick: () => void;
    } = $props();

    // const subtitle = [
    //     props.score ? `${props.score}/10` : null,
    //     props.status,
    //     props.completionPercentage ? `${props.completionPercentage}%` : null,
    // ]
    //     .filter((p) => p !== null)
    //     .join(" • ");
</script>

<div
    class="bg-base-200 rounded-lg p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
>
    <div>
        <a href={`/levels/${props.id}`} class="font-semibold hover:link">
            {props.name ?? `level ${props.id}`}
        </a>
        <div class="text-xs text-base-content/60">
            by {props.publisher ?? "unknown"}
        </div>
    </div>

    <div class="flex items-center gap-3">
        <div class="text-xs text-base-content/70 flex gap-3">
            {#if props.score !== null}
                <span>
                    {props.score}/10
                </span>
            {/if}
            {#if props.completionPercentage !== null}
                <span>
                    {props.completionPercentage}%
                </span>
            {/if}
            <span>
                <div>
                    {new Date(props.updatedAt).toLocaleDateString()}
                </div>
                <div class="font-bold">
                    {props.status}
                </div>
            </span>
        </div>

        {#if props.isUser}
            <button
                type="button"
                class="btn btn-xs btn-square btn-outline"
                onclick={props.onClick}
            >
                <Icon src={Pencil} class="size-[1.2em]" />
            </button>
        {/if}
    </div>
</div>
