export function convertDate(date: Date | undefined | null) {
  if (!date) return undefined;
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function dateToString(date: Date): string {
  // return in format Month Day, Year
  const options: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  };
  return date.toLocaleDateString(undefined, options);
}

export function abbreviateNumber(num: number): string {
  if (num < 1000) {
    return num.toString();
  }

  const units = ["", "K", "M"];
  let unitIndex = 0;

  while (Math.abs(num) >= 1000 && unitIndex < units.length - 1) {
    num /= 1000;
    unitIndex++;
  }
  return num.toFixed(1).replace(/\.0$/, "") + units[unitIndex];
}

export function formatDate(dateString: string | Date) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function calculateNewAverage(
  count: number,
  oldAverage: number,
  oldRating: number,
  newRating: number,
) {
  const total = oldAverage * count - oldRating + newRating;
  return total / count;
}

export function isVideoUrl(url: string): boolean {
  const regex =
    /^(https?:\/\/)?([a-zA-Z0-9]([a-zA-Z0-9\-].*[a-zA-Z0-9])?\.)+[a-zA-Z].*$/;
  return regex.test(url);
}

export function getYouTubeEmbedUrl(url) {
  let videoId = "";
  // Use a regular expression to find the video ID in various URL formats
  const regex =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);

  if (match && match[1]) {
    videoId = match[1];
  } else {
    return null; // Return null if no valid ID is found
  }

  return `https://www.youtube.com/embed/${videoId}`;
}

export function equalArrayOfObjectsWithIds(arr1: object[], arr2: object[]) {
  if (arr1.length !== arr2.length) {
    return false;
  }
  const idsA = new Set(arr1.map((obj) => obj.id));
  const idsB = new Set(arr2.map((obj) => obj.id));
  return idsA.size === idsB.size && [...idsA].every((id) => idsB.has(id));
}
