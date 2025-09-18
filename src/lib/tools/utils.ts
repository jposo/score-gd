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
