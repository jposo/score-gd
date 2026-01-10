export function safeB64Encode(input: string): string {
  let standardBase64 = input
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .replace(/>/g, "/");

  while (standardBase64.length % 4 !== 0) {
    standardBase64 += "=";
  }

  return atob(standardBase64);
}
