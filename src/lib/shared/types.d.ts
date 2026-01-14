export type ListItem = {
  id: number;
  placement: number;
  levelId: number;
  levelName: string;
};

export type Guess = {
  id: number;
  name: string;
  publisher: string;
  correct: boolean;
};

export type Guesses = {
  [day: number]: Guess[];
};

export type Hint = {
  hint: string;
  value: string | number | null;
};

export type Hints = {
  [index: number]: Hint;
};
