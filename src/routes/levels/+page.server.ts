import { error, type ServerLoadEvent } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import Database from "$lib/server/db/instance";
import { get } from "$lib/server/gd/client";
import * as z from "zod";
import { difficulties, ratings, lengths } from "$lib/shared/gd";

const db = Database.instance;

const Params = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  difficulty: z.enum(difficulties).optional(),
  rating: z.enum(ratings).optional(),
  length: z.enum(lengths).optional(),
});

export const load: PageServerLoad = async ({ url }: ServerLoadEvent) => {
  try {
    const paramsResult = Params.safeParse({
      page: url.searchParams.get("page") ?? undefined,
      difficulty: url.searchParams.get("difficulty") ?? undefined,
      rating: url.searchParams.get("rating") ?? undefined,
      length: url.searchParams.get("length") ?? undefined,
    });
    if (!paramsResult.success) {
      error(400, "invalid parameters");
    }
    const params = paramsResult.data;

    // const levels = await db.findLevelsByPage(parseInt(page));
    let query = get("levels").type("most liked").page(params.page);
    if (params.difficulty) {
      query = query.difficulty(params.difficulty);
    }
    if (params.rating) {
      query = query.rating(params.rating);
    }
    if (params.length) {
      query = query.length(params.length);
    }
    const searchResult = await query;
    if (!searchResult) {
      return {
        levels: [],
        page: params.page,
      };
    }
    const stats = await db.accrueProgressByLevelIds(
      searchResult.levels.map((level) => level.id),
    );
    const statsMap = new Map(stats.map((stat) => [stat.levelId, stat]));
    const levels = searchResult.levels.map((level) => ({
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
      page: params.page,
    };
  } catch (err) {
    console.error(err);
    error(500, "internal server error");
  }
};
