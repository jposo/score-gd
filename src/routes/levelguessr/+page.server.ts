import type { PageServerLoad, Actions } from "./$types";
import Database from "$lib/server/db";
import { PUBLIC_SUPABASE_PROJECT_ID } from "$env/static/public";
import { error, fail } from "@sveltejs/kit";
import * as z from "zod";
import { getCurrentDay, getNextDayDateTime } from "$lib/server/index";
import { get } from "$lib/server/gd/client";

const HINT_CONFIG = [
  { threshold: 0, when: 1, value: "rating" },
  { threshold: 1, when: 2, value: "difficulty" },
  { threshold: 2, when: 3, value: "releaseYear" },
  { threshold: 3, when: 4, value: "song" },
  { threshold: 4, when: 5, value: "publisher" },
];

function giveHints(guessCount: number) {
  const hints: Record<number, string> = {};

  for (const config of HINT_CONFIG) {
    if (guessCount >= config.threshold) {
      hints[config.when] = config.value;
    }
  }

  return hints;
}

const Guess = z.object({
  day: z.coerce.number().min(1).max(9999),
  guessCount: z.coerce.number().max(6),
  guessId: z.coerce.number().min(1),
});

const db = Database.instance;

export const load: PageServerLoad = async ({ url }) => {
  const currentDay = getCurrentDay();
  const requestedDay = parseInt(url.searchParams.get("day") ?? "");

  const dayNumber = !Number.isNaN(requestedDay) ? requestedDay : currentDay;

  const day = await db.findDaySimple(dayNumber);
  if (!day) {
    error(404, "day not found");
  }

  return {
    updatesOn: getNextDayDateTime(dayNumber).toISOString(),
    day: {
      number: day.day,
      images: day.imagePaths.map(
        (image) =>
          `https://${PUBLIC_SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/images/${image}`,
      ),
    },
  };
};

export const actions = {
  default: async ({ request }) => {
    const form = await request.formData();

    const result = Guess.safeParse({
      day: form.get("day"),
      guessCount: form.get("guessCount"),
      guessId: form.get("guessId"),
    });

    if (!result.success) {
      return fail(400, {
        message: "invalid request",
        error: result.error.message,
      });
    }

    const data = result.data;

    // if (!data.guessId) {
    // const fallbackLevel = await db.findLevelByNameSimple(data.guess);
    // if (!fallbackLevel) {
    //   return fail(400, { message: "Invalid Level" });
    // }
    // data.guessId = fallbackLevel.id;
    // }

    const level = await get("levels").search(data.guessId);
    // const levelGuess = await db.findLevelById(data.guessId);
    if (!level) {
      return fail(404, { message: "guess not found" });
    }

    const answerId = await db.findDayFull(data.day);
    const correct = answerId.id == data.guessId ? true : false;
    const answerResult = (await get("levels").search(answerId.id))?.levels[0];
    if (!answerResult) {
      return fail(404, { message: "answer not found" });
    }
    const answer = {
      name: answerResult.name,
      publisher: answerResult.creator?.username,
      difficulty: answerResult.difficulty,
      rating: answerResult.rating,
      song: answerResult.song?.name,
      releaseYear: 2000,
    };
    const lost = !correct && data.guessCount === 6;

    const hintsKeys = giveHints(correct ? 6 : data.guessCount);
    const hints: Record<number, Record<string, string | number | null>> = {};
    for (const [answerKey, answerValue] of Object.entries(answer)) {
      for (const [hintIndex, hintKey] of Object.entries(hintsKeys)) {
        if (hintKey === answerKey) {
          hints[parseInt(hintIndex)] = {
            hint: hintKey,
            value: answerValue ?? null,
          };
        }
      }
    }

    return {
      correct,
      hints,
      answer: correct || lost ? answer : null,
    };
  },
} satisfies Actions;
