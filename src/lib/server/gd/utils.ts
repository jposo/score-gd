import { createHash } from "crypto";

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

export function gjp2(password: string, salt: string = "mI29fmAnxgTs"): string {
  const saltedPassword = password + salt;
  const hash = createHash("sha1").update(saltedPassword).digest("hex");
  return hash;
}

export async function levelDateEstimation(levelId: number) {
  const baseUrl = "https://history.geometrydash.eu/api";
  const response = await fetch(`${baseUrl}/v1/date/level/${levelId}`);
  const data = await response.json();
  return new Date(data.approx.estimation as string);
}
