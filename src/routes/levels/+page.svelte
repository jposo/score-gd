<script lang="ts">
  import { goto } from "$app/navigation";
  import type { PageData } from "./$types";
  import { page } from "$app/state";
  import Card from "$lib/components/LevelCard.svelte";
  import { difficulties, ratings, lengths } from "$lib/shared/gd";

  let { data }: { data: PageData } = $props();

    let pageParam = $state(page.url.searchParams.get("page") || "1");
    let selectedDifficulties = $state(
        page.url.searchParams.getAll("difficulty") || [],
    );
    let selectedRatings = $state(page.url.searchParams.getAll("rating") || []);
    let selectedLengths = $state(page.url.searchParams.getAll("length") || []);
    let searchQuery = $state(page.url.searchParams.get("q") || "");

    let activeFilterCount = $derived(
        selectedDifficulties.length +
            selectedRatings.length +
            selectedLengths.length,
    );

    function advancePage(direction?: "back" | "next") {
        const delta = direction === "next" ? 1 : direction === "back" ? -1 : 0;
        const targetPage = parseInt(pageParam) + delta;
        const params = new URLSearchParams();

        params.set("page", targetPage.toString());
        if (searchQuery) params.set("q", searchQuery);

        const appendArray = (key: string, values: string[]) => {
            values.forEach((value) => params.append(key, value));
        };

        if (selectedDifficulties.length > 0) {
            appendArray("difficulty", selectedDifficulties);
        }
        if (selectedRatings.length > 0) {
            appendArray("rating", selectedRatings);
        }
        if (selectedLengths.length > 0) {
            appendArray("length", selectedLengths);
        }

        goto(`/levels?${params.toString()}`);
        pageParam = targetPage.toString();
    }

    function toggle(list: string[], value: string) {
        return list.includes(value)
            ? list.filter((v) => v !== value)
            : [...list, value];
    }

    function addDifficulty(value: string | undefined) {
        if (!value) {
            selectedDifficulties = []; // Clear all
        } else if (selectedDifficulties.includes(value)) {
            selectedDifficulties = selectedDifficulties.filter(
                (d) => d !== value,
            ); // Remove if already checked
        } else {
            selectedDifficulties = [...selectedDifficulties, value]; // Add if not checked
        }
    }

    function addRating(value: string | undefined) {
        if (!value) {
            selectedRatings = [];
        } else if (selectedRatings.includes(value)) {
            selectedRatings = selectedRatings.filter((r) => r !== value);
        } else {
            selectedRatings = [...selectedRatings, value];
        }
    }

    function addLength(value: string | undefined) {
        if (!value) {
            selectedLengths = [];
        } else if (selectedLengths.includes(value)) {
            selectedLengths = selectedLengths.filter((l) => l !== value);
        } else {
            selectedLengths = [...selectedLengths, value];
        }
    }

    function clearAll() {
        selectedDifficulties = [];
        selectedRatings = [];
        selectedLengths = [];
        advancePage();
    }
</script>

<svelte:head>
  <title>levels - loggd</title>
</svelte:head>

{#snippet filterDropdown(
    label: string,
    options: string[],
    selected: string[],
    onToggle: (v: string | undefined) => void,
)}
    <div class="dropdown">
        <div tabindex="0" role="button" class="btn gap-1.5">
            {label}
            {#if selected.length > 0}
                <span class="badge badge-sm badge-primary"
                    >{selected.length}</span
                >
            {/if}
        </div>
        <ul
            tabindex="-1"
            class="dropdown-content menu bg-base-100 rounded-box z-20 w-48 p-2 shadow-lg border border-base-300"
        >
            {#each options as option}
                <li>
                    <label
                        class="label cursor-pointer justify-start gap-2 px-2"
                    >
                        <input
                            type="checkbox"
                            class="checkbox checkbox-sm"
                            checked={selected.includes(option)}
                            onclick={() => onToggle(option)}
                        />
                        <span class="label-text">{option}</span>
                    </label>
                </li>
            {/each}
            {#if selected.length > 0}
                <li class="mt-1 pt-1 border-t border-base-300">
                    <button
                        class="text-error text-sm"
                        onclick={() => onToggle(undefined)}
                    >
                        clear {label.toLowerCase()}
                    </button>
                </li>
            {/if}
        </ul>
    </div>
{/snippet}

<div class="container mx-auto p-4">
    <!-- search -->
    <div class="mb-4 w-full">
        <div class="join w-full">
            <label class="input input-lg join-item grow">
                <svg
                    class="h-[1em] opacity-50"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                >
                    <g
                        stroke-linejoin="round"
                        stroke-linecap="round"
                        stroke-width="2.5"
                        fill="none"
                        stroke="currentColor"
                    >
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.3-4.3"></path>
                    </g>
                </svg>
                <input
                    type="text"
                    placeholder="search levels..."
                    maxlength="20"
                    bind:value={searchQuery}
                    onkeydown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            advancePage();
                        }
                    }}
                />
            </label>
            <button
                class="btn btn-neutral btn-lg join-item"
                onclick={() => advancePage()}>search</button
            >
        </div>
        <!-- <form>
            <input
                type="text"
                placeholder="search..."
                class="input input-lg w-full"
                name="query"
                maxlength="20"
                bind:value={searchQuery}
                onkeydown={(e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        advancePage();
                    }
                }}
            />
        </form> -->
    </div>
    <!-- filter row -->
    <div class="flex flex-wrap items-center gap-2 mb-3">
        {@render filterDropdown(
            "difficulty",
            difficulties,
            selectedDifficulties,
            addDifficulty,
        )}
        {@render filterDropdown("rating", ratings, selectedRatings, addRating)}
        {@render filterDropdown("length", lengths, selectedLengths, addLength)}

        {#if activeFilterCount > 0}
            <button class="btn btn-ghost btn-sm text-error" onclick={clearAll}>
                clear all ×
            </button>
        {/if}
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#if data.levels.length === 0}
            <div class="text-center col-span-full">
                <h3 class="text-lg font-semibold text-base-content/70 mb-2">
                    no levels found
                </h3>
            </div>
        {:else}
            {#each data.levels as level, index (level.id)}
                <Card
                    id={level.id}
                    name={level.name}
                    publisher={level.publisher ?? "unknown"}
                    difficulty={level.difficulty}
                    length={level.length}
                    releaseDate={level.releaseDate}
                    tabIndex={index}
                />
            {/each}
        {/if}
    </div>
    <!-- prev/next page buttons -->
    <div class="flex justify-center py-4">
        <div class="join">
            {#if parseInt(pageParam) > 1}
                <button
                    class="join-item btn"
                    onclick={() => advancePage("back")}>«</button
                >
            {/if}
            <button class="join-item btn">Page {pageParam}</button>
            <!-- {#if !data.page.isLastPage} -->
            <button class="join-item btn" onclick={() => advancePage("next")}
                >»</button
            >
            <!-- {/if} -->
        </div>
    </div>
  </div>
</div>
