import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import Database from "$lib/server/database";
import { searchLevels } from "$lib/server/db/index";

export const GET: RequestHandler = async ({ url }) => {
  const searchTerm = url.searchParams.get("q");
  const service = url.searchParams.get("s") ?? "";

  if (!searchTerm || searchTerm.length < 3) {
    return json([]);
  }

  if (service === "levelguessr") {
    const levels = await searchLevels(searchTerm);
    return json(levels);
  }
  const db = Database.instance;
  const levels = await db.search(searchTerm);
  return json(levels);
};
