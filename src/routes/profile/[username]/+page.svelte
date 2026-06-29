<script lang="ts">
    import type { PageData } from "./$types";
    import { Icon, Check, ListBullet, Clock, Pencil } from "svelte-hero-icons";
    import Activity from "$lib/components/Activity.svelte";
    import List from "$lib/components/ListDragAndDrop.svelte";
    import { formatDate } from "$lib/tools/utils";
    import type { ListItem } from "$lib/shared/types";
    import { toastManager } from "$lib/state/toasts.svelte";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { page } from "$app/state";
    import { enhance } from "$app/forms";
    import {
        PROGRESS_SCORE_OPTIONS,
        PROGRESS_STATUS_OPTIONS,
    } from "$lib/constants";

    let { data }: { data: PageData } = $props();

    let editMode = $state(false);
    let activeItems = $state<any[]>([]);
    let inactiveItems = $state<any[]>([]);
    let initialActiveState = $state<number[]>([]);
    let initialInactiveState = $state<number[]>([]);
    let initialActiveItems = $state<any[]>([]);
    let initialInactiveItems = $state<any[]>([]);
    let requestingUpdate = $state(false);
    let snapshotModal = $state<HTMLDialogElement | null>(null);
    let progressModal = $state<HTMLDialogElement | null>(null);

    type EditableProgress = {
        levelId: number;
        status: "to try" | "in progress" | "completed" | "dropped" | "";
        score: number | "";
        levelName: string;
    };

    let selectedProgress = $state<EditableProgress>({
        levelId: 0,
        status: "",
        score: "",
        levelName: "",
    });

    const tabs = {
        recent: "recent",
        list: "list",
        progress: "progress",
    };

    let tab = $state(tabs.recent);

    const zoneType = "profile-list-transfer";
    const activeLimit = 25;

    const isActiveListFull = $derived(activeItems.length >= activeLimit);

    const hasChanges = $derived.by(() => {
        const activeIds = activeItems.map((item) => item.id);
        const inactiveIds = inactiveItems.map((item) => item.id);

        if (activeIds.length !== initialActiveState.length) {
            return true;
        }

        if (inactiveIds.length !== initialInactiveState.length) {
            return true;
        }

        for (let i = 0; i < activeIds.length; i++) {
            if (activeIds[i] !== initialActiveState[i]) {
                return true;
            }
        }

        for (let i = 0; i < inactiveIds.length; i++) {
            if (inactiveIds[i] !== initialInactiveState[i]) {
                return true;
            }
        }

        return false;
    });

    const progressStatuses = [
        "completed",
        "in progress",
        "to try",
        "dropped",
    ] as const;

    const statusOptions = PROGRESS_STATUS_OPTIONS;
    const scoreOptions = PROGRESS_SCORE_OPTIONS;

    const groupedProgress = $derived.by(() => {
        const groups = {
            completed: [] as any[],
            "in progress": [] as any[],
            "to try": [] as any[],
            dropped: [] as any[],
        };

        for (const item of data.profile.allProgress ?? []) {
            if (item.status === "completed") {
                groups.completed.push(item);
            } else if (item.status === "in progress") {
                groups["in progress"].push(item);
            } else if (item.status === "to try") {
                groups["to try"].push(item);
            } else if (item.status === "dropped") {
                groups.dropped.push(item);
            }
        }

        return groups;
    });

    onMount(() => {
        activeItems = data.profile.list ?? [];
        inactiveItems = data.profile.inactiveList ?? [];
        initialActiveItems = [...activeItems];
        initialInactiveItems = [...inactiveItems];
        initialActiveState = activeItems.map((item) => item.id);
        initialInactiveState = inactiveItems.map((item) => item.id);

        if (data.profile.snapshotAtParam) {
            tab = tabs.list;
            return;
        }

        if (page.url.hash === "#" + tabs.recent) {
            tab = tabs.recent;
        } else if (page.url.hash === "#" + tabs.list) {
            tab = tabs.list;
        } else if (page.url.hash === "#" + tabs.progress) {
            tab = tabs.progress;
        }
    });

    function handleDrop(
        listKey: string,
        newItems: any[],
        _movedItemId: number | null,
    ) {
        if (listKey === "active") {
            activeItems = newItems;
        } else if (listKey === "inactive") {
            inactiveItems = newItems;
        }

        if (activeItems.length > 25) {
            toastManager.add(
                "active list is capped at 25 items. move one back to inactive.",
                "error",
            );
        }
    }

    function resetPendingChanges() {
        activeItems = [...initialActiveItems];
        inactiveItems = [...initialInactiveItems];
    }

    function cancelEditMode() {
        resetPendingChanges();
        editMode = false;
    }

    function clearSnapshotFilter() {
        goto(page.url.pathname + "#" + tabs.list);
    }

    function openProgressEditor(item: any) {
        selectedProgress = {
            levelId: item.levelId,
            status: (item.status ?? "") as EditableProgress["status"],
            score: item.score ?? "",
            levelName: item.details?.name ?? `level ${item.levelId}`,
        };
        progressModal?.showModal();
    }
</script>

<svelte:head>
    <title>profile: {data.user?.username} - loggd</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto flex flex-col gap-4">
        <!-- Profile Header -->
        <div class="bg-base-200 shadow p-6 rounded-lg">
            <div
                class="flex flex-col md:flex-row items-center md:items-start gap-6"
            >
                <!-- Profile Picture -->
                <div class="avatar avatar-placeholder">
                    <div
                        class="w-32 h-32 rounded-full text-neutral-content bg-neutral"
                    >
                        <!-- {#if data.profile.profilePicturePath}
              <img
                src={data.profile.profilePicturePath}
                alt={data.profile.username}
                class="w-full h-full object-cover"
              />
            {:else} -->
                        <span class="text-3xl"
                            >{data.profile.username?.charAt(0)}</span
                        >
                        <!-- {/if} -->
                    </div>
                </div>

                <!-- Profile Info -->
                <div class="flex-1 text-center md:text-left">
                    <h1 class="text-3xl font-bold text-base-content mb-2">
                        {data.profile.username}
                    </h1>

                    <p class="text-base-content/70 mb-4">
                        member since <b
                            >{formatDate(
                                data.profile.registeredAt ?? new Date(),
                            ).toLowerCase()}</b
                        >
                    </p>

                    <p class="text-base-content/80 mb-4 italic">
                        {data.profile.bio ? data.profile.bio : ""}
                    </p>

                    {#if data.profile.isUser}
                        <div
                            class="flex flex-wrap gap-2 justify-center md:justify-start"
                        >
                            <a
                                href="/profile/{data.profile.username}/edit"
                                class="btn btn-primary btn-sm"
                            >
                                edit profile
                            </a>
                            <button class="btn btn-outline btn-sm">
                                view progress
                            </button>
                        </div>
                    {/if}
                </div>
            </div>
        </div>

        <!-- Stats Cards -->
        <!-- <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-"> -->
        <div class="stats shadow bg-base-200 w-full rounded-lg">
            <div class="stat">
                <div class="stat-title">average score</div>
                <div class="stat-value text-secondary">
                    {data.profile.stats.averageScore
                        ? data.profile.stats.averageScore.toFixed(1)
                        : "n/a"}
                </div>
                <!-- <div class="stat-desc">No demons yet</div> -->
            </div>

            <div class="stat">
                <div class="stat-title">levels completed</div>
                <div class="stat-value text-primary">
                    {data.profile.stats.levelsCompleted}
                </div>
                <!-- <div class="stat-desc">Pump those numbers up!</div> -->
            </div>

            <div class="stat">
                <div class="stat-title">reviews written</div>
                <div class="stat-value text-accent">
                    {data.profile.stats.reviewsWritten}
                </div>
                <!-- <div class="stat-desc">No reviews yet</div> -->
            </div>
        </div>

        <div class="bg-base-200 shadow p-6 rounded-lg">
            <div class="tabs tabs-lift">
                <label class="tab">
                    <input
                        type="radio"
                        name="user_activity"
                        checked={tab === tabs.recent}
                        onclick={() => goto("#" + tabs.recent)}
                    />
                    <Icon src={Clock} class="size-4 me-2" />
                    recent activity
                </label>
                <div class="tab-content bg-base-100 border-base-300 p-6">
                    <div class="text-center">
                        {#if !data.profile.recentActivity || data.profile.recentActivity.length === 0}
                            <!-- <div class="text-6xl mb-4">📊</div> -->
                            <h3
                                class="text-lg font-semibold text-base-content/70 mb-2"
                            >
                                no activity yet
                            </h3>
                            {#if data.profile.isUser}
                                <p class="text-base-content/50 mb-4">
                                    start tracking your <span class="font-bold"
                                        >geometry dash</span
                                    > progress to see activity here!
                                </p>
                                <a href="/levels" class="btn btn-primary">
                                    browse levels
                                </a>
                            {/if}
                        {:else}
                            {#each data.profile.recentActivity as a}
                                <Activity
                                    link={`/levels/${a.levelId}`}
                                    title={a.details?.name ?? "unknown level"}
                                    score={a.score}
                                    status={a.status}
                                    completionPercentage={a.completionPercentage}
                                    createdAt={new Date(a.createdAt)}
                                    review={a.review}
                                />
                                <div class="divider"></div>
                            {/each}
                        {/if}
                    </div>
                </div>

                <label class="tab">
                    <input
                        type="radio"
                        name="user_activity"
                        checked={tab === tabs.list}
                        onclick={() => goto("#" + tabs.list)}
                    />
                    <Icon src={ListBullet} class="size-4 me-2" />
                    list
                </label>
                <div class="tab-content bg-base-100 border-base-300 p-6">
                    {#if data.profile.isUser}
                        <div class="flex justify-end gap-2">
                            <button
                                type="button"
                                class="btn btn-sm btn-outline"
                                onclick={() => snapshotModal?.showModal()}
                            >
                                time machine
                            </button>

                            <form
                                method="POST"
                                use:enhance={() => {
                                    requestingUpdate = true;
                                    return async ({ result }) => {
                                        requestingUpdate = false;
                                        if (result.type === "success") {
                                            editMode = false;
                                            initialActiveItems = [
                                                ...activeItems,
                                            ];
                                            initialInactiveItems = [
                                                ...inactiveItems,
                                            ];
                                            initialActiveState =
                                                activeItems.map(
                                                    (item) => item.id,
                                                );
                                            initialInactiveState =
                                                inactiveItems.map(
                                                    (item) => item.id,
                                                );
                                            toastManager.add(
                                                "successfully updated list",
                                                "success",
                                            );
                                        } else if (result.type === "failure") {
                                            toastManager.add(
                                                (result.data
                                                    ?.message as string) ??
                                                    "error updating list",
                                                "error",
                                            );
                                        } else {
                                            toastManager.add(
                                                "unknown error",
                                                "error",
                                            );
                                        }
                                    };
                                }}
                            >
                                <input
                                    type="hidden"
                                    name="activeList"
                                    value={JSON.stringify(
                                        activeItems.map((item) => item.id),
                                    )}
                                />
                                <input
                                    type="hidden"
                                    name="inactiveList"
                                    value={JSON.stringify(
                                        inactiveItems.map((item) => item.id),
                                    )}
                                />
                                <!-- onclick={updateListPlacement} -->
                                <button
                                    class="btn btn-sm btn-square"
                                    type={editMode && hasChanges
                                        ? "submit"
                                        : "button"}
                                    onclick={() => {
                                        if (!editMode) {
                                            editMode = true;
                                        } else if (!hasChanges) {
                                            editMode = false;
                                        }
                                    }}
                                    disabled={requestingUpdate ||
                                        activeItems.length > activeLimit}
                                >
                                    {#if editMode}
                                        <Icon
                                            src={Check}
                                            class="size-[1.2em]"
                                        />
                                    {:else if requestingUpdate}
                                        <span
                                            class="loading loading-dots size-[1.2em]"
                                        ></span>
                                        <!-- <Icon
                                            src={Pencil}
                                            class="size-[1.2em]"
                                        /> -->
                                    {:else}
                                        <Icon
                                            src={Pencil}
                                            class="size-[1.2em]"
                                        />
                                    {/if}
                                </button>
                            </form>
                        </div>
                    {/if}

                    {#if data.profile.snapshot}
                        <div class="bg-base-200 p-4 rounded-lg mb-4">
                            <div
                                class="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3"
                            >
                                <p class="text-sm text-base-content/80">
                                    showing snapshot for {new Date(
                                        data.profile.snapshot.at,
                                    ).toLocaleString()}
                                </p>
                                <button
                                    type="button"
                                    class="btn btn-xs btn-ghost"
                                    onclick={clearSnapshotFilter}
                                >
                                    clear snapshot
                                </button>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div class="bg-base-100 p-4 rounded-lg">
                                    <h3 class="text-lg font-semibold mb-2">
                                        active list at time
                                    </h3>
                                    {#if data.profile.snapshot.activeList.length > 0}
                                        <List
                                            listKey="snapshot-active"
                                            {zoneType}
                                            items={data.profile.snapshot
                                                .activeList}
                                            editMode={false}
                                            onDrop={() => {}}
                                        />
                                    {:else}
                                        <p class="text-sm text-base-content/70">
                                            no active items at this time.
                                        </p>
                                    {/if}
                                </div>

                                <div class="bg-base-100 p-4 rounded-lg">
                                    <h3 class="text-lg font-semibold mb-2">
                                        inactive completed at time
                                    </h3>
                                    {#if data.profile.snapshot.inactiveList.length > 0}
                                        <List
                                            listKey="snapshot-inactive"
                                            {zoneType}
                                            items={data.profile.snapshot
                                                .inactiveList}
                                            editMode={false}
                                            onDrop={() => {}}
                                        />
                                    {:else}
                                        <p class="text-sm text-base-content/70">
                                            no inactive completed items at this
                                            time.
                                        </p>
                                    {/if}
                                </div>
                            </div>
                        </div>
                    {/if}

                    {#if editMode}
                        {#if hasChanges}
                            <div
                                class="alert alert-info mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                            >
                                <span> you have unsaved list changes. </span>
                                <div class="flex gap-2">
                                    <button
                                        type="button"
                                        class="btn btn-sm btn-ghost"
                                        onclick={resetPendingChanges}
                                    >
                                        reset changes
                                    </button>
                                    <button
                                        type="button"
                                        class="btn btn-sm btn-outline"
                                        onclick={cancelEditMode}
                                    >
                                        cancel editing
                                    </button>
                                </div>
                            </div>
                        {/if}

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="bg-base-200 p-4 rounded-lg">
                                <div
                                    class="flex items-center justify-between mb-2"
                                >
                                    <h3 class="text-lg font-semibold">
                                        active list
                                    </h3>
                                    <span
                                        class="badge {isActiveListFull
                                            ? 'badge-warning'
                                            : 'badge-primary'}"
                                    >
                                        {activeItems.length}/{activeLimit}
                                    </span>
                                </div>
                                {#if isActiveListFull}
                                    <p
                                        class="text-xs text-base-content/70 mb-2"
                                    >
                                        active list is full. drag an item to
                                        inactive before promoting another.
                                    </p>
                                {/if}
                                <List
                                    listKey="active"
                                    {zoneType}
                                    items={activeItems}
                                    {editMode}
                                    dropFromOthersDisabled={isActiveListFull}
                                    onDrop={handleDrop}
                                />
                            </div>

                            <div class="bg-base-200 p-4 rounded-lg">
                                <div
                                    class="flex items-center justify-between mb-2"
                                >
                                    <h3 class="text-lg font-semibold">
                                        inactive completed
                                    </h3>
                                    <span class="badge badge-outline">
                                        {inactiveItems.length}
                                    </span>
                                </div>
                                <List
                                    listKey="inactive"
                                    {zoneType}
                                    items={inactiveItems}
                                    {editMode}
                                    onDrop={handleDrop}
                                />
                            </div>
                        </div>
                    {:else if activeItems.length > 0}
                        <List
                            listKey="active"
                            {zoneType}
                            items={activeItems}
                            {editMode}
                            onDrop={handleDrop}
                        />
                    {:else}
                        <div class="text-center">
                            <h3
                                class="text-lg font-semibold text-base-content/70 mb-2"
                            >
                                no active list items yet
                            </h3>
                        </div>
                    {/if}
                </div>

                <label class="tab">
                    <input
                        type="radio"
                        name="user_activity"
                        checked={tab === tabs.progress}
                        onclick={() => goto("#" + tabs.progress)}
                    />
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="size-4 me-2"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M2.25 6 9 12.75l4.286-4.286a11.948 11.948 0 0 1 4.306 6.43l.776 2.898m0 0 3.182-5.511m-3.182 5.51-5.511-3.181"
                        />
                    </svg>
                    all progress
                </label>
                <div class="tab-content bg-base-100 border-base-300 p-6">
                    {#if !data.profile.allProgress || data.profile.allProgress.length === 0}
                        <div class="text-center">
                            <h3
                                class="text-lg font-semibold text-base-content/70 mb-2"
                            >
                                no progress yet
                            </h3>
                        </div>
                    {:else}
                        <div class="flex flex-col gap-6">
                            {#each progressStatuses as statusName}
                                <div class="bg-base-200 p-4 rounded-lg">
                                    <div
                                        class="flex items-center justify-between mb-3"
                                    >
                                        <h3 class="text-lg font-semibold">
                                            {statusName}
                                        </h3>
                                        <span class="badge badge-outline">
                                            {groupedProgress[statusName].length}
                                        </span>
                                    </div>

                                    {#if groupedProgress[statusName].length === 0}
                                        <p class="text-sm text-base-content/60">
                                            nothing here yet.
                                        </p>
                                    {:else}
                                        <div class="flex flex-col gap-2">
                                            {#each groupedProgress[statusName] as item}
                                                <div
                                                    class="bg-base-100 rounded-lg p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
                                                >
                                                    <div>
                                                        <a
                                                            href={`/levels/${item.levelId}`}
                                                            class="font-semibold hover:link"
                                                        >
                                                            {item.details
                                                                ?.name ??
                                                                `level ${item.levelId}`}
                                                        </a>
                                                        <div
                                                            class="text-xs text-base-content/60"
                                                        >
                                                            by {item.details
                                                                ?.publisher ??
                                                                "unknown"}
                                                        </div>
                                                    </div>

                                                    <div
                                                        class="flex items-center gap-3"
                                                    >
                                                        <div
                                                            class="text-xs text-base-content/70 flex gap-3"
                                                        >
                                                            {#if item.score !== null}
                                                                <span>
                                                                    {item.score}/10
                                                                </span>
                                                            {/if}
                                                            {#if item.completionPercentage !== null}
                                                                <span>
                                                                    {item.completionPercentage}%
                                                                </span>
                                                            {/if}
                                                            <span>
                                                                {new Date(
                                                                    item.updatedAt,
                                                                ).toLocaleDateString()}
                                                            </span>
                                                        </div>

                                                        {#if data.profile.isUser}
                                                            <button
                                                                type="button"
                                                                class="btn btn-xs btn-outline"
                                                                onclick={() =>
                                                                    openProgressEditor(
                                                                        item,
                                                                    )}
                                                            >
                                                                edit
                                                            </button>
                                                        {/if}
                                                    </div>
                                                </div>
                                            {/each}
                                        </div>
                                    {/if}
                                </div>
                            {/each}
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    </div>
</div>

<dialog class="modal" bind:this={snapshotModal}>
    <div class="modal-box">
        <h3 class="font-semibold text-lg mb-3">time machine</h3>
        <p class="text-sm text-base-content/70 mb-4">
            pick a timestamp to load a historical snapshot of active and
            inactive completed lists.
        </p>

        <form method="GET" action="" class="flex flex-col gap-3">
            <label class="form-control w-full">
                <span class="label-text text-sm mb-1">
                    view list at a point in time
                </span>
                <input
                    type="datetime-local"
                    name="at"
                    class="input input-bordered input-sm w-full"
                    value={data.profile.snapshotAtParam
                        ? data.profile.snapshotAtParam.slice(0, 16)
                        : ""}
                />
            </label>

            <div class="modal-action mt-2">
                <button class="btn btn-sm btn-primary" type="submit">
                    load snapshot
                </button>
                <button
                    class="btn btn-sm btn-ghost"
                    type="button"
                    onclick={() => snapshotModal?.close()}
                >
                    close
                </button>
            </div>
        </form>
    </div>
</dialog>

<dialog class="modal" bind:this={progressModal}>
    <div class="modal-box">
        <h3 class="font-semibold text-lg mb-3">
            edit progress: {selectedProgress.levelName}
        </h3>

        <form
            method="POST"
            action="?/updateProgress"
            class="flex flex-col gap-3"
            use:enhance={() => {
                return async ({ result }) => {
                    if (result.type === "success") {
                        toastManager.add(
                            (result.data?.message as string) ??
                                "successfully updated progress",
                            "success",
                        );
                        progressModal?.close();
                        await goto(
                            page.url.pathname +
                                page.url.search +
                                "#" +
                                tabs.progress,
                            {
                                invalidateAll: true,
                            },
                        );
                    } else if (result.type === "failure") {
                        toastManager.add(
                            (result.data?.message as string) ??
                                "failed to update progress",
                            "error",
                        );
                    } else {
                        toastManager.add("unknown error occurred", "error");
                    }
                };
            }}
        >
            <input
                type="hidden"
                name="levelId"
                value={selectedProgress.levelId}
            />

            <label class="form-control w-full">
                <span class="label-text text-sm mb-1">status</span>
                <select
                    class="select select-bordered"
                    name="status"
                    bind:value={selectedProgress.status}
                >
                    <option value="">leave unchanged</option>
                    {#each statusOptions as option}
                        <option value={option.value}>{option.label}</option>
                    {/each}
                </select>
            </label>

            <label class="form-control w-full">
                <span class="label-text text-sm mb-1">score</span>
                <select
                    class="select select-bordered"
                    name="score"
                    bind:value={selectedProgress.score}
                >
                    <option value="">no score</option>
                    {#each scoreOptions as option}
                        <option value={option.value}>
                            {option.value} - {option.label}
                        </option>
                    {/each}
                </select>
            </label>

            <div class="modal-action mt-2">
                <button class="btn btn-sm btn-primary" type="submit">
                    save
                </button>
                <button
                    class="btn btn-sm btn-ghost"
                    type="button"
                    onclick={() => progressModal?.close()}
                >
                    cancel
                </button>
            </div>
        </form>
    </div>
</dialog>
