import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import db from "$lib/server/db/instance";
import { get } from "$lib/server/gd/client";

export const load: PageServerLoad = async () => {
  try {
    const levelIds = await db.findTopRatedLevels();
    const ids = levelIds.map((level) => level.id);
    const result = await get("levels").ids(ids);

    const levelMap = new Map(result?.result.map((level) => [level.id, level]));

    if (!result) {
      return { levels: [] };
    }
    return {
      levels: levelIds.map((level) => ({
        id: level.id,
        name: levelMap.get(level.id)?.name ?? "unknown",
        publisher: levelMap.get(level.id)?.creator?.username ?? "unknown",
        difficulty: levelMap.get(level.id)?.difficulty!,
        length: levelMap.get(level.id)?.length!,
        averageScore: level.averageScore,
      })),
    };
  } catch (err) {
    console.error(err);
    error(500, "internal server error");
  }
};
