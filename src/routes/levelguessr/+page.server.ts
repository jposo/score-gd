import type { PageServerLoad, Actions } from "./$types";
import {
  fetchDay,
  validateGuess,
  fetchLevel,
  fetchLevelByName,
} from "$lib/server/db";
import { PUBLIC_SUPABASE_PROJECT_ID } from "$env/static/public";
import { error, fail } from "@sveltejs/kit";
import * as z from "zod";
import { getCurrentDay, getNextDayDateTime } from "$lib/server/index";

const HINT_CONFIG = [
  { threshold: 1, when: 2, value: "rating" },
  { threshold: 2, when: 3, value: "difficulty" },
  { threshold: 3, when: 4, value: "releaseYear" },
  { threshold: 4, when: 5, value: "song" },
  { threshold: 5, when: 6, value: "publisher" },
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
  guess: z.coerce.string().max(20),
  guessCount: z.coerce.number().max(6),
  guessId: z.coerce.number().min(1).optional(),
});

export const load: PageServerLoad = async ({ url }) => {
  const currentDay = getCurrentDay();
  const requestedDay = parseInt(url.searchParams.get("day") ?? "");

  const dayNumber = !Number.isNaN(requestedDay) ? requestedDay : currentDay;

  const rawDay = await fetchDay(dayNumber);
  if (!rawDay) {
    error(404, "Day not found");
  }

  return {
    updatesOn: getNextDayDateTime(dayNumber).toISOString(),
    day: {
      number: rawDay.day,
      images: rawDay.images.map((i) => ({
        index: i.index,
        url: `https://${PUBLIC_SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/images/${i.url}`,
      })),
    },
  };
};

export const actions = {
  default: async ({ request }) => {
    const form = await request.formData();

    const result = Guess.safeParse({
      day: form.get("day"),
      guess: form.get("guess"),
      guessCount: form.get("guessCount"),
      guessId: form.get("guessId"),
    });

    if (!result.success) {
      return fail(400, {
        message: `Invalid form data: ${result.error.message}`,
      });
    }

    const data = result.data;

    if (!data.guessId) {
      const fallbackLevel = await fetchLevelByName(data.guess);
      if (!fallbackLevel) {
        return fail(400, { message: "Invalid Level" });
      }
      data.guessId = fallbackLevel.id;
    }

    const levelGuess = await fetchLevel(data.guessId);
    if (!levelGuess) {
      return fail(404, { message: "Level Not Found" });
    }

    const answer = await validateGuess(data.day);
    const correct = answer.id == data.guessId ? true : false;
    const lost = !correct && data.guessCount === 6;

    const hintsKeys = giveHints(correct ? 6 : data.guessCount);
    const hints: Record<number, Record<string, string | number | null>> = {};
    for (const [answerKey, answerValue] of Object.entries(answer)) {
      for (const [hintIndex, hintKey] of Object.entries(hintsKeys)) {
        if (hintKey === answerKey) {
          hints[parseInt(hintIndex)] = {
            hint: hintKey,
            value: answerValue,
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
