import { error, type ServerLoadEvent } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
// import db from "$lib/server/db/instance";
// import { get } from "$lib/server/gd/client";
// import winston from "winston";
// import SearchParams from "$lib/server/schemas/SearchParams";

export const load: PageServerLoad = async ({ url }: ServerLoadEvent) => {
    // try {
    //     const paramsResult = SearchParams.safeParse({
    //         page: url.searchParams.get("page") ?? undefined,
    //         query: url.searchParams.get("q") ?? undefined,
    //         difficulty: url.searchParams.get("difficulty") ?? undefined,
    //         rating: url.searchParams.get("rating") ?? undefined,
    //         length: url.searchParams.get("length") ?? undefined,
    //     });
    //     if (!paramsResult.success) {
    //         error(400, "invalid parameters");
    //     }
    //     const params = paramsResult.data;
    //     // const levels = await db.findLevelsByPage(parseInt(page));
    //     let query = get("levels")
    //         .type("most liked")
    //         .page(Math.max(0, params.page - 1));
    //     if (params.difficulty) {
    //         query = query.difficulty(params.difficulty);
    //     }
    //     if (params.rating) {
    //         query = query.rating(params.rating);
    //     }
    //     if (params.length) {
    //         query = query.length(params.length);
    //     }
    //     if (params.query) {
    //         query = query.search(params.query);
    //     }
    //     const searchResult = await query;
    //     if (!searchResult) {
    //         return {
    //             levels: [],
    //             page: params.page,
    //         };
    //     }
    //     const stats = await db.accrueProgressByLevelIds(
    //         searchResult.result.map((level) => level.id),
    //     );
    //     const statsMap = new Map(stats.map((stat) => [stat.levelId, stat]));
    //     const levels = searchResult.result.map((level) => ({
    //         id: level.id,
    //         name: level.name,
    //         publisher: level.creator?.username,
    //         difficulty: level.difficulty,
    //         releaseDate: null,
    //         length: level.length,
    //         averageScore: statsMap.get(level.id)?.averageScore || 0,
    //     }));
    //     return {
    //         levels,
    //         page: params.page,
    //     };
    // } catch (err) {
    //     winston.error("failed to load levels", err);
    //     error(500, "internal server error");
    // }
};
