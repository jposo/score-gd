import { LevelQuery } from "./levels";
import { UserQuery } from "./users";

export function get(object: "levels"): LevelQuery;
export function get(object: "users"): UserQuery;

export function get(object: "levels" | "users"): LevelQuery | UserQuery | null {
  if (object === "levels") {
    return new LevelQuery(object);
  } else if (object === "users") {
    return new UserQuery(object);
  }
  return null;
}

// export function get(object: "levels" | "users"): any {
//   if (object === "levels") return new LevelQuery(object);
//   if (object === "users") return new UserQuery(object);
// }

// onst result = await get("levels").ids([27732941, 27448202]);
// console.log(result);

// const result = await get("users").search("zaaph");
// console.log(result);
