import { error, type ServerLoadEvent } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import Database from "$lib/server/db/index";
import { get } from "$lib/server/gd/client";

const db = Database.instance;

export const load: PageServerLoad = async ({ url }: ServerLoadEvent) => {
  try {
    const pageParam = url.searchParams.get("page") || "1";
    if (!pageParam.match(/^[1-9]\d*$/)) {
      error(400, "Invalid page parameter");
    }
    const page = parseInt(pageParam);

    // const levels = await db.findLevelsByPage(parseInt(page));
    const result = await get("levels").type("most liked").page(page);
    if (!result) {
      error(404, "Levels not found");
    }
    const stats = await db.accrueProgressByLevelIds(
      result.levels.map((level) => level.id),
    );
    const statsMap = new Map(stats.map((stat) => [stat.levelId, stat]));
    const levels = result.levels.map((level) => ({
      id: level.id,
      name: level.name,
      publisher: level.creator?.username,
      difficulty: level.difficulty,
      releaseDate: null,
      length: level.length,
      averageRating: statsMap.get(level.id)?.averageRating || 0,
    }));
    return {
      levels,
      page,
    };
  } catch (err) {
    console.error(err);
    error(500, "Internal server error");
  }
};
