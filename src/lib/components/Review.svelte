<script lang="ts">
  import { dateToLocaleString, abbreviateNumber } from "$lib/tools/utils";
  import Avatar from "./Avatar.svelte";
  import { enhance } from "$app/forms";
  import { toastManager } from "$lib/state/toasts.svelte";

  let props: {
    id: number;
    username: string;
    profilePictureUrl: string | null;
    status: string;
    date: Date;
    rating: number | null;
    attempts: number | null;
    review: string;
    showModeratorOptions: boolean;
  } = $props();

  const formattedAttempts = props.attempts
    ? abbreviateNumber(props.attempts)
    : null;

  const subtitle = [props.rating, props.status, formattedAttempts]
    .filter((p) => p !== null)
    .join(" • ");
</script>

<div class="flex flex-col gap-2">
  <div class="flex flex-row justify-between gap-2">
    <a
      class="flex flex-row items-center gap-2"
      href={`/profile/${props.username}/`}
    >
      <Avatar
        username={props.username}
        profilePictureUrl={props.profilePictureUrl ?? undefined}
      />
      <div>
        <div class="font-bold text-primary hover:underline">
          {props.username}
        </div>
        <span class="opacity-60"
          >{dateToLocaleString(props.date).toLowerCase()}</span
        >
      </div>
    </a>
    {#if props.showModeratorOptions}
      <div class="dropdown dropdown-end">
        <div tabindex="0" role="button" class="btn btn-ghost btn-square m-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-6 text-neutral-content"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
          </svg>
        </div>
        <ul
          tabindex="-1"
          class="dropdown-content menu bg-base-200 rounded-box z-1 w-52 p-2 shadow-sm"
        >
          <li>
            <form
              method="POST"
              action="?/hideReview"
              use:enhance={() => {
                return async ({ result }) => {
                  if (result.type === "success") {
                    toastManager.add(
                      result.data?.message ?? "successfully hidden review",
                      "success",
                    );
                  } else if (result.type === "failure") {
                    toastManager.add(
                      result.data?.message ?? "failed to hide review",
                      "error",
                    );
                  } else {
                    toastManager.add("unknown error occurred", "error");
                  }
                };
              }}
            >
              <input type="hidden" name="reviewId" value={props.id} />
              <button type="submit" class="btn btn-ghost">hide</button>
            </form>
          </li>
        </ul>
      </div>
    {/if}
  </div>
  <div class="font-bold">
    {subtitle}
  </div>
  <div>
    {props.review}
  </div>
</div>

<!-- <div class="flex flex-col gap-2">
  <div class="avatar flex flex-row gap-4 h-12">
    <div
      class="h-12 w-12 rounded-full text-neutral-content bg-neutral flex items-center justify-center"
    >
      {#if props.profilePictureUrl}
        <img alt={props.username} src={props.profilePictureUrl} />
      {:else}
        <span class="text-sm">{props.username.charAt(0)}</span>
      {/if}
    </div>
    <div class="flex flex-col content-center w-full">
      <div class="flex flex-row justify-between">
        <div class="flex flex-row items-center gap-4">
          <span class="font-bold text-primary hover:underline">
            <a href="/profile/{props.username}">{props.username}</a>
          </span>
          <div class="dropdown dropdown-bottom">
            <div
              tabindex="0"
              role="button"
              class="btn btn-square btn-sm"
              aria-label="moderator settings"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="h-5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
                />
              </svg>
            </div>
            <ul
              tabindex="-1"
              class="dropdown-content menu bg-base-200 rounded-box z-100 w-52 p-2 shadow-sm mt-1"
            >
              <li><a>hide review</a></li>
              <li><a>hide review</a></li>
              <li><a>hide review</a></li>
            </ul>
          </div>
        </div>
        <span class="opacity-60"
          >{dateToLocaleString(props.date).toLowerCase()}</span
        >
      </div>
      <div class="font-semibold">{subtitle}</div>
    </div>
  </div>
  <div>
    {props.review}
  </div>
</div> -->
