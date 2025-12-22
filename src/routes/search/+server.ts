import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import Database from "$lib/server/db/index";

const db = Database.instance;

export const GET: RequestHandler = async ({ url }) => {
  const searchTerm = url.searchParams.get("q");
  // const service = url.searchParams.get("s") ?? "";

  if (!searchTerm || searchTerm.length < 3) {
    return json([]);
  }

  // if (service === "levelguessr") {
  //   const levels = await db.search(searchTerm);
  //   return json(levels);
  // }
  const levels = await db.search(searchTerm);
  return json(levels);
};
