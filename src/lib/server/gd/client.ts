import { LevelQuery } from "./levels";
import { UserQuery } from "./users";

// function get(object: "levels"): LevelQuery;
// function get(object: "users"): LevelQuery;

export function get(object: "levels" | "users"): any {
  if (object === "levels") return new LevelQuery(object);
  if (object === "users") return new UserQuery(object);
}

// onst result = await get("levels").ids([27732941, 27448202]);
// console.log(result);

// const result = await get("users").search("zaaph");
// console.log(result);
