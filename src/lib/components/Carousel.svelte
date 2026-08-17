<script lang="ts">
  import { fade } from "svelte/transition";

  interface Props {
    images: { src: string; caption?: string }[];
    select?: number;
  }

  let { images, select = 0 }: Props = $props();

  let currentIndex = $derived(select);

  $effect(() => {
    currentIndex = select;
    const anchor = document.querySelector(`a[href="#image${select + 1}"]`);
    if (anchor instanceof HTMLAnchorElement) {
      anchor.click();
    }
  });

  let loaded: boolean[] = $state(Array(images.length).fill(false));

  $effect(() => {
      loaded = Array(images.length).fill(false);
  })
</script>

<div class="relative flex justify-center max-w-6xl mx-auto">
  {#if images[currentIndex]?.caption}
    {@const caption = images[currentIndex].caption}
    <div
      class="badge badge-xl badge-neutral text-xl absolute top-2 left-2 z-5 shadow-md shadow-black/50"
      transition:fade={{ duration: 300 }}
    >
      {#if caption?.startsWith("rating")}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
          />
        </svg>
      {:else if caption?.startsWith("difficulty")}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 0 1-2.031.352 5.988 5.988 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971Zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 0 1-2.031.352 5.989 5.989 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971Z"
          />
        </svg>
      {:else if caption?.startsWith("release")}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
          />
        </svg>
      {:else if caption?.startsWith("song")}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="m9 9 10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 0 1-.99-3.467l2.31-.66A2.25 2.25 0 0 0 9 15.553Z"
          />
        </svg>
      {:else if caption?.startsWith("publisher")}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
          />
        </svg>
      {:else}
        <svg
          class="size-[1em]"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          ><g fill="currentColor" stroke-linejoin="miter" stroke-linecap="butt"
            ><circle
              cx="12"
              cy="12"
              r="10"
              fill="none"
              stroke="currentColor"
              stroke-linecap="square"
              stroke-miterlimit="10"
              stroke-width="2"
            ></circle><path
              d="m12,17v-5.5c0-.276-.224-.5-.5-.5h-1.5"
              fill="none"
              stroke="currentColor"
              stroke-linecap="square"
              stroke-miterlimit="10"
              stroke-width="2"
            ></path><circle
              cx="12"
              cy="7.25"
              r="1.25"
              fill="currentColor"
              stroke-width="2"
            ></circle></g
          ></svg
        >
      {/if}
      {caption}
    </div>
  {/if}
  <div class="carousel w-full shadow-sm">
    {#each images as image, index}
      <div id="image{index + 1}" class="carousel-item w-full">
        <img
          alt="Freeze frame of a level"
          src={image.src}
          class="w-full rounded-b-box aspect-video object-cover overflow-hidden {loaded[
            index
          ]
            ? 'block'
            : 'hidden'}"
          onload={() => {
            loaded[index] = true;
          }}
        />
        {#if !loaded[index]}
          <div class="skeleton w-full aspect-video"></div>
        {/if}
      </div>
    {/each}
  </div>
</div>
<div class="flex w-full justify-center gap-2 py-2">
  {#each images as image, index}
    <a
      href="#image{index + 1}"
      class="btn btn-2xl text-2xl {index === currentIndex ? 'btn-active' : ''}"
      onclick={() => {
        currentIndex = index;
      }}>{index + 1}</a
    >
  {/each}
</div>
