import { createHash } from "crypto";

export function gjp2(password: string, salt: string = "mI29fmAnxgTs"): string {
  const saltedPassword = password + salt;
  const hash = createHash("sha1").update(saltedPassword).digest("hex");
  return hash;
}
