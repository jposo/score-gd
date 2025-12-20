export const SearchType = {
    MostDownloaded: "Most Downloaded",
    MostLiked: "Most Liked",
    Trending: "Trending",
    Recent: "Recent",
    Featured: "Featured",
} as const;
export type SearchType = (typeof SearchType)[keyof typeof SearchType];

export const Difficulty = {
    NA: "N/A",
    Easy: "Easy",
    Normal: "Normal",
    Hard: "Hard",
    Harder: "Harder",
    Insane: "Insane",
    Demon: "Demon",
} as const;
export type Difficulty = (typeof Difficulty)[keyof typeof Difficulty];

export const DemonDifficulty = {
    EasyDemon: "Easy Demon",
    MediumDemon: "Medium Demon",
    HardDemon: "Hard Demon",
    InsaneDemon: "Insane Demon",
    ExtremeDemon: "Extreme Demon",
} as const;
export type DemonDifficulty =
    (typeof DemonDifficulty)[keyof typeof DemonDifficulty];

export const Length = {
    Tiny: "Tiny",
    Short: "Short",
    Medium: "Medium",
    Long: "Long",
    XL: "XL",
    Platformer: "Platformer",
} as const;
export type Length = (typeof Length)[keyof typeof Length];

export const Rating = {
    NoStar: "No Star",
    Star: "Star",
    Featured: "Featured",
    Epic: "Epic",
    Legendary: "Legendary",
    Mythic: "Mythic",
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
    song: Song | null;
    date?: Date | null;
};
