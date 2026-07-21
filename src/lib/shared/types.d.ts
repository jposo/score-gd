import type { SelectProgress } from "$lib/server/db/schema";

export type ListItem = {
    levelId: number;
    status: string;
    score?: number;
    completionPercentage?: number;
    completionTime?: string;
    attempts?: number;
    startedAt?: Date;
    completedAt?: Date;
    videoUrl?: string;
    review?: string;
};
//   id: number;
//   placement: number;
//   levelId: number;
//   levelName: string;
// };

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

type SearchResultLevel = {
    id: number;
    name: string;
    publisher: string | undefined;
    difficulty: string;
    releaseDate: Date | null;
    length: string;
    averageScore: number;
}

type SearchResult = {
    levels?: SearchResultLevel[];
    page?: number;
};
