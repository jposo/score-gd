export const SearchType = {
  MostDownloaded: "Most Downloaded",
  MostLiked: "Most Liked",
  Trending: "Trending",
  Recent: "Recent",
  Featured: "Featured",
} as const;
export type SearchType = (typeof SearchType)[keyof typeof SearchType];

export const Difficulty = {
  NA: "n/a",
  Auto: "auto",
  Easy: "easy",
  Normal: "normal",
  Hard: "hard",
  Harder: "harder",
  Insane: "insane",
  Demon: "demon",
} as const;
export type Difficulty = (typeof Difficulty)[keyof typeof Difficulty];

export const DemonDifficulty = {
  EasyDemon: "easy demon",
  MediumDemon: "medium demon",
  HardDemon: "hard demon",
  InsaneDemon: "insane demon",
  ExtremeDemon: "extreme demon",
} as const;
export type DemonDifficulty =
  (typeof DemonDifficulty)[keyof typeof DemonDifficulty];

export const Length = {
  Tiny: "tiny",
  Short: "short",
  Medium: "medium",
  Long: "long",
  XL: "xl",
  Platformer: "platformer",
} as const;
export type Length = (typeof Length)[keyof typeof Length];

export const Rating = {
  NoStar: "no star",
  Star: "star",
  Featured: "featured",
  Epic: "epic",
  Legendary: "legendary",
  Mythic: "mythic",
} as const;
export type Rating = (typeof Rating)[keyof typeof Rating];

export type SearchSettings = {
  type?: SearchType;
  page?: number;
  difficulty?: Difficulty | DemonDifficulty;
  length?: Length;
  rating?: Rating;
};

export type Song = {
  id: number;
  name: string;
  artist: {
    id: number;
    name: string;
  };
};

export type LevelSearchResult = {
  id: number;
  name: string;
  description: string;
  version: number;
  creator: {
    id: number;
    username: string;
    accountId: number;
  };
  difficulty: Difficulty | DemonDifficulty;
  rating: Rating;
  length: Length;
  song: Song | null;
  date?: Date | null;
  gameVersion: number;
  coins: number;
  twoPlayer: boolean;
};
