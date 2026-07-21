<script lang="ts">
    import type { PageData } from "./$types";
    import Card from "$lib/components/LevelCard.svelte";

    let { data }: { data: PageData } = $props();

    let spotlightItems = $derived(
        (
            [
                { label: "daily", value: data.spotlight.daily },
                { label: "weekly", value: data.spotlight.weekly },
                { label: "event", value: data.spotlight.event },
            ] as const
        ).filter((item) => item.value),
    );
</script>

<div class="container mx-auto py-4 px-8">
    {#if spotlightItems.length > 0}
        <section class="mb-8">
            <h1 class="text-3xl font-bold mb-4">current spotlight</h1>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                {#each spotlightItems as item}
                    <Card
                        id={item.value!.id}
                        name={item.value!.name}
                        publisher={item.value!.publisher}
                        score={item.value!.score ?? undefined}
                        difficulty={item.value!.difficulty}
                        length={item.value!.length}
                        spotlightType={item.label}
                    />
                {/each}
            </div>
        </section>
    {/if}

    {#if data.recentActivity && data.recentActivity.length > 0}
        <section class="mb-8">
            <div class="flex items-center justify-between mb-4">
                <h1 class="text-3xl font-bold">your latest activity</h1>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {#each data.recentActivity as item (item.levelId)}
                    <div class="flex flex-col gap-2">
                        <Card
                            id={item.level.id}
                            name={item.level.name}
                            publisher={item.level.publisher}
                            score={item.score ?? undefined}
                            difficulty={item.level.difficulty}
                            length={item.level.length}
                        />
                        <div
                            class="text-xs opacity-70 px-1 flex flex-wrap gap-2"
                        >
                            <span class="badge badge-sm">{item.status}</span>
                            {#if item.completionPercentage !== null}
                                <span class="badge badge-sm"
                                    >{item.completionPercentage}%</span
                                >
                            {/if}
                        </div>
                    </div>
                {/each}
            </div>
        </section>
    {/if}

    <h1 class="text-3xl font-bold mb-6">top levels</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each data.levels as level (level.id)}
            <Card
                id={level.id}
                name={level.name}
                publisher={level.publisher}
                score={level.score}
                difficulty={level.difficulty}
                length={level.length}
            />
        {/each}
    </div>
</div>
