<script lang="ts">
  import type { PageProps, SubmitFunction } from "./$types";
  import { enhance } from "$app/forms";

  let { data }: PageProps = $props();

  type Frame = {
    time: number;
    data: string;
    originalData: string;
    cropSettings?: CropSettings;
    saved?: boolean;
  };

  type CropSettings = {
    frameIndex: number;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  };

  type SearchResult = {
    id: number;
    name: string | null;
  };

  let cropModal: HTMLDialogElement;
  let cropCanvas: HTMLCanvasElement;
  let input = $state("");
  let levelId = $state<number>();
  let searchResults = $state<SearchResult[]>([]);
  let files = $state<FileList>();
  let videoElement = $state<HTMLVideoElement>();
  let video = $derived(files?.item(0) ?? null);
  let duration = $state<number>();
  let extractedFrames = $state<Frame[]>([]);
  let selectedFrames = $derived.by(() => {
    const frames: { data: string; index: number }[] = [];
    let index = 1;
    for (const [key, value] of Object.entries(
      extractedFrames.filter((frame) => frame.saved),
    )) {
      frames.push({ data: value.data, index: index++ });
      // console.log(key, value.data, value.originalData);
    }
    return frames;
  });
  let frameCount = $derived(Math.floor(duration ?? 0));
  let videoSrc = $derived.by(() => {
    if (files && files.length > 0) {
      const file = files.item(0);
      if (file) {
        return URL.createObjectURL(file);
      }
    }
    // if (videoSrc) {
    //     URL.revokeObjectURL(videoSrc);
    // }
    return null;
  });
  let currentImage = $state<HTMLImageElement | null>(null);
  let cropSettings = $state<CropSettings>({
    frameIndex: -1,
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
  });
  let isDrawing = $state(false);
  let nextDay = $state(data.latestDay + 1);
  let nextDate = $state(new Date(data.projectedDate.getTime() + 86400000));

  function handleMetadataLoaded(event: Event) {
    const videoElement = event.currentTarget as HTMLVideoElement;
    duration = videoElement.duration;
  }

  async function extractFrames() {
    if (!files) {
      console.log("No video file selected");
      return;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    canvas.width = videoElement!.videoWidth;
    canvas.height = videoElement!.videoHeight;

    // reset extractedFrames array
    extractedFrames = [];

    for (let time = 0; time < duration!; time += 1) {
      await seekToTime(time);
      ctx.drawImage(videoElement!, 0, 0, canvas.width, canvas.height);
      const frameData = canvas.toDataURL("image/png");

      extractedFrames.push({
        time: time,
        data: frameData,
        originalData: frameData,
      });
    }
  }

  function seekToTime(time: number) {
    return new Promise<void>((resolve) => {
      if (!videoElement) {
        console.error("Video element not found");
        resolve();
        return;
      }
      videoElement.currentTime = time;
      videoElement.onseeked = () => resolve();
    });
  }

  function openCropModal(index: number) {
    if (selectedFrames.length === 6) {
      alert("Maximum number of frames reached");
      return;
    }
    const frame = extractedFrames[index];
    const img = new Image();
    const ctx = cropCanvas.getContext("2d")!;

    cropSettings = frame.cropSettings ?? {
      frameIndex: index,
      startX: 0,
      startY: 0,
      endX: img.width,
      endY: img.height,
    };

    img.onload = () => {
      cropCanvas.width = img.width;
      cropCanvas.height = img.height;

      currentImage = img;
      ctx.drawImage(img, 0, 0);

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 5;
      ctx.setLineDash([]);
      ctx.strokeRect(
        cropSettings.startX,
        cropSettings.startY,
        cropSettings.endX - cropSettings.startX,
        cropSettings.endY - cropSettings.startY,
      );

      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(
        cropSettings.startX,
        cropSettings.startY,
        cropSettings.endX - cropSettings.startX,
        cropSettings.endY - cropSettings.startY,
      );

      ctx.setLineDash([]);
    };
    img.src = frame.originalData;

    cropModal.showModal();
  }

  function handleCanvasMouseDown(event: MouseEvent) {
    const rect = cropCanvas.getBoundingClientRect();

    const scaleX = cropCanvas.width / rect.width;
    const scaleY = cropCanvas.height / rect.height;

    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    cropSettings.startX = x;
    cropSettings.startY = y;
    isDrawing = true;
  }

  function handleCanvasMouseMove(event: MouseEvent) {
    if (!isDrawing || !currentImage) return;

    const rect = cropCanvas.getBoundingClientRect();
    const ASPECT_RATIO = 16 / 9;
    const ctx = cropCanvas.getContext("2d")!;

    const scaleX = cropCanvas.width / rect.width;
    // const scaleY = cropCanvas.height / rect.height;

    const x = (event.clientX - rect.left) * scaleX;
    const width = x - cropSettings.startX;
    // lock to 16:9 aspect ratio
    // const y = (event.clientY - rect.top) * scaleY;
    const height = (width / ASPECT_RATIO) * Math.sign(event.clientY - rect.top);
    const y = cropSettings.startY + height;
    cropSettings.endX = x;
    cropSettings.endY = y;

    ctx.clearRect(0, 0, cropCanvas.width, cropCanvas.height);
    ctx.drawImage(currentImage, 0, 0);

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 5;
    ctx.setLineDash([]);
    ctx.strokeRect(
      cropSettings.startX,
      cropSettings.startY,
      cropSettings.endX - cropSettings.startX,
      cropSettings.endY - cropSettings.startY,
    );

    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(
      cropSettings.startX,
      cropSettings.startY,
      cropSettings.endX - cropSettings.startX,
      cropSettings.endY - cropSettings.startY,
    );

    ctx.setLineDash([]);
  }

  function handleCanvasMouseUp(event: MouseEvent) {
    isDrawing = false;
  }

  function resetCropSettings() {
    cropSettings.startX = 0;
    cropSettings.startY = 0;
    cropSettings.endX = 0;
    cropSettings.endY = 0;
    extractedFrames[cropSettings.frameIndex].data =
      extractedFrames[cropSettings.frameIndex].originalData;
  }

  function handleSaveFrame() {
    if (!currentImage) {
      console.error("No image selected");
      return;
    }

    const MAX_IMAGE_SIZE = 1024 * 100;
    let quality = 0.9;

    const finalCanvas = document.createElement("canvas");
    finalCanvas.width = cropSettings.endX - cropSettings.startX;
    finalCanvas.height = cropSettings.endY - cropSettings.startY;

    const finalCtx = finalCanvas.getContext("2d")!;

    finalCtx.drawImage(
      currentImage,
      cropSettings.startX,
      cropSettings.startY,
      cropSettings.endX - cropSettings.startX,
      cropSettings.endY - cropSettings.startY,
      0,
      0,
      finalCanvas.width,
      finalCanvas.height,
    );

    let compressedDataUrl = "";
    while (quality >= 0.1) {
      compressedDataUrl = finalCanvas.toDataURL("image/jpeg", quality);
      const approxBytes = compressedDataUrl.length * 0.75;

      if (approxBytes <= MAX_IMAGE_SIZE) break;

      quality -= 0.1;
    }

    console.log("compressed to quality: ", quality);

    const croppedDataUrl = compressedDataUrl;

    extractedFrames[cropSettings.frameIndex].data = croppedDataUrl;
    extractedFrames[cropSettings.frameIndex].cropSettings = cropSettings;
    extractedFrames[cropSettings.frameIndex].saved = true;
    currentImage = null;
  }

  $effect(() => {
    // timer debounce between api requests
    input = input;
    const timeoutId = setTimeout(async () => {
      try {
        if (input.length < 3) {
          searchResults = [];
          return;
        }
        const response = await fetch(`/search?q=${input}`);
        if (response.ok) {
          const results = await response.json();
          console.log(`Search successful, returned ${results.length} results.`);
          searchResults = results;
        }
      } catch (error) {
        console.error("Search failed", error);
      }
    }, 300);

    // cleanup function: If the user types again before 300ms,
    // Svelte runs this to cancel the previous timer.
    return () => clearTimeout(timeoutId);
  });

  function selectResult(result: SearchResult) {
    input = result.name!;
    levelId = result.id;
    searchResults = [];
  }

  function formHandler() {
    return async ({ result }) => {
      if (result.type === "success") {
        alert(result.data?.message);
      } else if (result.type === "failure") {
        alert(
          "An error occurred while enqueuing the frames: " +
            result.data?.message,
        );
      } else {
        alert("An unexpected error occurred" + result.data?.message);
      }
    };
  }
</script>

<div class="container mx-auto max-w-7xl p-6 space-y-8">
  <div class="flex flex-col md:flex-row justify-between items-center gap-4">
    <div>
      <h1 class="text-4xl font-extrabold text-primary">Frame Processor</h1>
      <p class="text-base-content/60">
        Queue levels and extractr frames for day #{nextDay}
      </p>
    </div>

    <!-- No longer needed -->
    <!-- <form method="POST" action="?/update" use:enhance={formHandler}>
            <button type="submit" class="btn btn-lg btn-primary"
                >Update Ids</button
            >
        </form> -->
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div class="card bg-base-200 shadow-xl h-fit">
      <div class="card-body gap-4">
        <h2 class="text-3xl font-bold">Job Details</h2>

        <form
          method="POST"
          action="?/enqueue"
          use:enhance={formHandler}
          class="space-y-4"
        >
          <input
            type="hidden"
            name="frames"
            value={JSON.stringify(selectedFrames)}
          />
          <input type="hidden" name="levelId" value={levelId} />

          <div class="dropdown w-full **dropdown-open**">
            <label class="input flex items-center gap-2 w-full">
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
                type="search"
                required
                placeholder="Search level..."
                bind:value={input}
                class="grow"
              />
            </label>

            {#if searchResults.length > 0}
              <ul
                tabindex="-1"
                class="dropdown-content z-1 menu p-2 shadow bg-base-300 rounded-box w-full text-2xl **mt-2**"
              >
                {#each searchResults as result}
                  {@const played = data.levels.find(
                    (level) => level.id === result.id,
                  )}
                  <li value={result.id}>
                    <button
                      class="flex justify-between"
                      onclick={() => selectResult(result)}
                    >
                      <span>{result.name}</span>
                      {#if played}
                        <span class="badge badge-sm badge-neutral"
                          >Day #{played.day}</span
                        >
                      {/if}
                    </button>
                  </li>
                {/each}
              </ul>
            {/if}
          </div>

          <div class="form-control">
            <select name="sourceId" class="select w-full">
              <option disabled selected>Pick a Source</option>
              {#each data.sources as source}
                <option value={source.id}>{source.name}</option>
              {/each}
            </select>
          </div>

          <div class="divider"></div>

          <button
            type="submit"
            class="btn btn-primary w-full shadow-lg shadow-primary/30"
            >Submit Job</button
          >
        </form>
      </div>
    </div>

    <div class="col-span-1 lg:col-span-2 space-y-6">
      <div class="card bg-base-200 border-base-200 shadow-xl">
        <div class="card-body items-center text-center py-8">
          <h2 class="card-title">Upload Video</h2>
          <input
            bind:files
            type="file"
            accept="video/*"
            class="file-input file-input-lg"
          />
        </div>
      </div>

      {#if videoSrc && video}
        <div class="card bg-base-200 shadow-xl">
          <div class="card-body">
            <div class="flex flex-wrap gap-4 items-center justify-between">
              <div>
                <button class="btn btn-primary btn-lg" onclick={extractFrames}
                  >Extract Frames (1/sec)</button
                >
                <button type="submit" class="btn btn-lg btn-accent"
                  >Queue</button
                >
              </div>

              <div class="flex gap-2">
                <div class="badge badge-lg badge-outline gap-2 p-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    ><path
                      d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
                    /><polyline points="7 10 12 15 17 10" /><line
                      x1="12"
                      y1="15"
                      x2="12"
                      y2="3"
                    /></svg
                  >
                  {(video.size / 1024 / 1024).toFixed(1)} MB
                </div>
                <div class="badge badge-lg badge-outline gap-2 p-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    ><circle cx="12" cy="12" r="10" /><polyline
                      points="12 6 12 12 16 14"
                    /></svg
                  >
                  {duration?.toFixed(1) ?? 0}s
                </div>
              </div>
            </div>

            <video
              src={videoSrc}
              bind:this={videoElement}
              controls
              class="hidden"
              onloadedmetadata={handleMetadataLoaded}
              ><track kind="captions" /></video
            >

            {#if extractedFrames.length > 0}
              <div class="mt-4">
                <div class="flex justify-between text-xs mb-1">
                  <span>Processing...</span>
                  <span>{extractedFrames.length} / {frameCount}</span>
                </div>
                <progress
                  class="progress progress-primary w-full"
                  value={extractedFrames.length}
                  max={frameCount}
                ></progress>
              </div>
            {/if}
          </div>
        </div>
      {/if}
    </div>
  </div>

  {#if extractedFrames.length > 0}
    <div class="divider">Extracted Frames</div>

    <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      {#each extractedFrames as frame, index}
        <div
          class="card bg-base-100 shadow-sm hover:shadow-md transition-shadow duration-200 group border border-base-200 {frame.saved
            ? 'border-success ring-1 ring-success'
            : ''}"
        >
          <figure class="relative aspect-video bg-base-300">
            <img
              src={frame.data}
              class="object-cover w-full h-full"
              alt={`Frame at ${frame.time}s`}
            />
            {#if frame.saved}
              <div class="absolute top-2 right-2 badge badge-success shadow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="3"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  ><polyline points="20 6 9 17 4 12" /></svg
                >
                Saved
              </div>
            {/if}

            <div
              class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <button
                class="btn btn-white btn-sm"
                onclick={() => {
                  openCropModal(index);
                }}
              >
                Crop Frame
              </button>
            </div>
          </figure>
          <div class="card-body p-3">
            <div class="flex justify-between items-center">
              <span class="text-xs font-mono opacity-50">
                {frame.time.toFixed(2)}
              </span>
              {#if !frame.saved}
                <span class="badge badge-xs badge-ghost">Pending</span>
              {/if}
            </div>
            <!-- <div class="card-actions justify-end">
                            <button
                                class="btn btn-accent btn-lg"
                                onclick={() => openCropModal(index)}
                                >Crop</button
                            >
                        </div> -->
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<dialog bind:this={cropModal} class="modal backdrop-blur-sm">
  <div
    class="modal-box w-11/12 max-w-6xl space-y-2 p-0 overflow-hidden bg-base-200"
  >
    <div class="p-4 border-b border-base-300 flex justify-between items-center">
      <h3 class="text-lg font-bold">Crop Selection</h3>

      <form method="dialog">
        <button class="btn btn-sm btn-circle btn-ghost text-xl">&times;</button>
      </form>
    </div>

    <div class="p-4 flex justify-center bg-base-300/50">
      <canvas
        bind:this={cropCanvas}
        class="max-w-full shadow-xl"
        onmousedown={handleCanvasMouseDown}
        onmousemove={handleCanvasMouseMove}
        onmouseup={handleCanvasMouseUp}
      ></canvas>
    </div>

    <div class="modal-action p-4 bg-base-100 m-0 border-t border-base-300">
      <form method="dialog" class="flex gap-2 w-full justify-end">
        <button class="btn">Cancel</button>
        <button class="btn btn-primary px-8" onclick={handleSaveFrame}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            ><path
              d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
            /><polyline points="17 21 17 13 7 13 7 21" /><polyline
              points="7 3 7 8 15 8"
            /></svg
          >Save</button
        >
      </form>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
