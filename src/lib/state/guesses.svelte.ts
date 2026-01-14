import { browser } from "$app/environment";
import type { Guesses, Guess } from "$lib/shared/types";

export let guesses = $state<
  Record<
    number,
    {
      guess: string;
      correct: boolean;
      answer?: {
        day: number;
        name: string;
        rating: string;
        song: string;
        releaseYear: number;
        publisher: string;
      };
    }[]
  >
>({});

// type Guesses = Record<
//   number,
//   {
//     guess: string;
//     correct: boolean;
//     answer?: {
//       day: number;
//       name: string;
//       rating: string;
//       song: string;
//       releaseYear: number;
//       publisher: string;
//     };
//   }[]
// >;

function createGuessesState() {
  const stored = browser ? localStorage.getItem("guesses") : null;
  let guesses = $state<Guesses>(stored ? JSON.parse(stored) : {});
  return {
    get value() {
      return guesses;
    },
    addGuess(day: number, guess: Guess) {
      if (!guesses[day]) {
        guesses[day] = [];
      }
      guesses[day].push(guess);
      if (browser) {
        localStorage.setItem("guesses", JSON.stringify(guesses));
      }
    },
    setGuesses(day: number, _guesses: Guess[]) {
      guesses[day] = _guesses;
      if (browser) {
        localStorage.setItem("guesses", JSON.stringify(guesses));
      }
    },
    set(newGuesses: Guesses) {
      guesses = newGuesses;
      if (browser) {
        localStorage.setItem("guesses", JSON.stringify(guesses));
      }
    },
  };
}

export const guessesState = createGuessesState();
