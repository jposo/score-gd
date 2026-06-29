<script lang="ts">
    import { flip } from "svelte/animate";
    import { dndzone, type DndEvent } from "svelte-dnd-action";
    import { Icon, Bars3 } from "svelte-hero-icons";
    import { formatDate } from "$lib/tools/utils";

    let {
        listKey,
        zoneType,
        items,
        editMode,
        dropFromOthersDisabled = false,
        onDrop,
    }: {
        listKey: string;
        zoneType: string;
        items: any[];
        editMode: boolean;
        dropFromOthersDisabled?: boolean;
        onDrop: (
            listKey: string,
            newItems: any[],
            movedItemId: number | null,
        ) => void;
    } = $props();

    const flipDurationMs = 300;

    function handleDndConsider(e: CustomEvent<DndEvent<any>>) {
        items = e.detail.items;
    }

    function handleDndFinalize(e: CustomEvent<DndEvent<any>>) {
        const { items: newItems } = e.detail;
        items = newItems;
        const rawMovedItemId = e.detail.info?.id;
        const movedItemId =
            rawMovedItemId === undefined || rawMovedItemId === null
                ? null
                : Number(rawMovedItemId);
        onDrop(listKey, [...newItems], movedItemId);
    }

    function getYoutubeId(url: string) {
        if (!url) return "";

        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
            /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                return match[1];
            }
        }

        return "";
    }
</script>

<ul
    use:dndzone={{
        items,
        flipDurationMs,
        dragDisabled: !editMode,
        type: zoneType,
        dropFromOthersDisabled,
    }}
    onconsider={handleDndConsider}
    onfinalize={handleDndFinalize}
    class="list"
>
    {#each items as item, index (item.id)}
        <li
            class="list-row flex items-center px-0 py-4"
            animate:flip={{ duration: flipDurationMs }}
        >
            <div class="flex w-full items-center">
                <div class="flex items-center text-4xl font-thin tabular-nums">
                    {#if editMode}
                        <span class="cursor-grab">
                            <Icon src={Bars3} class="size-6 me-2" />
                        </span>
                    {:else if item.videoUrl}
                        <a
                            href={item.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="me-2 transition-opacity hover:opacity-80"
                        >
                            <img
                                src={`https://img.youtube.com/vi/${getYoutubeId(item.videoUrl)}/mqdefault.jpg`}
                                alt="YouTube thumbnail"
                                class="aspect-video rounded-lg shadow-sm h-14"
                            />
                        </a>
                    {/if}
                    <span class="opacity-30">{index + 1}</span>
                </div>

                <div class="list-col-grow ml-4">
                    <div class="text-xl bold">
                        <a href={`/levels/${item.id}`} class="hover:link">
                            {item.details.name}
                        </a>
                        <span class="text-xs font-semibold opacity-60">
                            {item.details.publisher}
                        </span>
                    </div>
                    <div
                        class="text-xs lowerecase font-semibold opacity-60 gd-stats"
                    >
                        {#if item.attempts}
                            <span>{item.attempts} attempts</span>
                        {/if}
                        {#if item.score !== null}
                            <span>{item.score}/10</span>
                        {/if}
                        {#if item.startedAt}
                            <span
                                >started: {formatDate(
                                    item.startedAt,
                                ).toLowerCase()}</span
                            >
                        {/if}
                        {#if item.completedAt}
                            <span
                                >completed: {formatDate(
                                    item.completedAt,
                                ).toLowerCase()}</span
                            >
                        {/if}
                    </div>
                </div>
            </div>

            <!-- <div
                class="mt-2 flex w-full flex-wrap gap-x-6 gap-y-1 text-sm opacity-70"
            >
                {#if item.attempts}
                    <div>
                        {item.attempts} attempt{item.attempts !== 1 ? "s" : ""}
                    </div>
                {/if}
                {#if item.startedAt}
                    <div>{formatDate(item.startedAt)}</div>
                {/if}
                {#if item.completedAt}
                    <div>completed: {formatDate(item.completedAt)}</div>
                {/if}
            </div> -->
        </li>
    {/each}
</ul>

<style>
    .gd-stats span:not(:last-child)::after {
        content: " • ";
    }
</style>
