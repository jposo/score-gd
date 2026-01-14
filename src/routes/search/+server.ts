import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import Database from "$lib/server/db/index";
import { get } from "$lib/server/gd/client";

const db = Database.instance;

export const GET: RequestHandler = async ({ url }) => {
  const searchTerm = url.searchParams.get("q");
  const service = url.searchParams.get("s") ?? "";

  if (!searchTerm || searchTerm.length < 1) {
    return json([]);
  }

  if (service === "levelguessr") {
    // const levels = await db.search(searchTerm);
    const result = await get("levels").search(searchTerm).rating("star");
    return json(
      result?.levels.map((level) => ({
        id: level.id,
        name: level.name,
        publisher: level.creator?.username ?? "unknown",
      })) ?? [],
    );
  }
  // const levels = await db.search(searchTerm);
  const result = await get("levels").search(searchTerm);
  return json(
    result?.levels.map((level) => ({
      id: level.id,
      name: level.name,
      publisher: level.creator?.username ?? "unknown",
    })) ?? [],
  );
};
