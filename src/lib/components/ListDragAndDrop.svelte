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
    class="list h-full gap-2"
>
    {#each items as item, index (item.id)}
        <li
            class="bg-base-200 rounded-lg p-3 flex items-center gap-3"
            animate:flip={{ duration: flipDurationMs }}
        >
            <div class="flex items-center gap-2 shrink-0">
                {#if editMode}
                    <span class="cursor-grab">
                        <Icon src={Bars3} class="size-6 opacity-60" />
                    </span>
                {/if}

                <span
                    class="text-2xl font-thin tabular-nums opacity-30 w-6 text-right"
                >
                    {index + 1}
                </span>

                {#if item.videoUrl}
                    <a
                        href={item.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="transition-opacity hover:opacity-80 shrink-0"
                    >
                        <img
                            src={`https://img.youtube.com/vi/${getYoutubeId(item.videoUrl)}/mqdefault.jpg`}
                            alt="YouTube thumbnail"
                            class="aspect-video rounded-lg shadow-sm h-14 w-auto object-cover"
                        />
                    </a>
                {/if}
            </div>

            <div
                class="flex flex-col md:flex-row md:items-center md:justify-between gap-2 grow min-w-0"
            >
                <div class="min-w-0">
                    <a
                        href={`/levels/${item.id}`}
                        class="font-semibold hover:link truncate block text-base"
                    >
                        {item.level.name}
                    </a>
                    <div class="text-xs text-base-content/60">
                        by {item.level.publisher}
                    </div>
                </div>

                <div
                    class="text-xs text-base-content/70 flex flex-wrap gap-3 shrink-0"
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
        </li>
    {/each}
</ul>
