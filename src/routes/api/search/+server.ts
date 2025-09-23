import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import Database from "$lib/server/database";

export const GET: RequestHandler = async ({ url }) => {
  const searchTerm = url.searchParams.get("q");

  if (!searchTerm) {
    return json([]);
  }

  const db = Database.instance;
  const levels = await db.search(searchTerm);
  return json(levels);
};
