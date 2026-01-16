import { Parser } from "./parser";
import type { Level, LevelSearchResponse } from "./types";
import { BaseQuery } from "./query";
import { levels } from "./official";

export class LevelQuery extends BaseQuery<LevelSearchResponse | null> {
  type(
    type:
      | "search"
      | "most downloaded"
      | "most liked"
      | "trending"
      | "recent"
      | "user levels"
      | "featured"
      | "magic"
      | "moderator sent"
      | "array"
      | "awarded"
      | "hall of fame"
      | "daily history"
      | "weekly history"
      | "list",
  ) {
    if (type === "search") {
      this.query.type = 0;
    } else if (type === "most downloaded") {
      this.query.type = 1;
    } else if (type === "most liked") {
      this.query.type = 2;
    } else if (type === "trending") {
      this.query.type = 3;
    } else if (type === "recent") {
      this.query.type = 4;
    } else if (type === "user levels") {
      this.query.type = 5;
    } else if (type === "featured") {
      this.query.type = 6;
    } else if (type === "magic") {
      this.query.type = 7;
    } else if (type === "moderator sent") {
      this.query.type = 8;
    } else if (type === "array") {
      this.query.type = 10;
    } else if (type === "awarded") {
      this.query.type = 11;
    } else if (type === "hall of fame") {
      this.query.type = 16;
    } else if (type === "daily history") {
      this.query.type = 21;
    } else if (type === "weekly history") {
      this.query.type = 22;
    } else if (type === "list") {
      this.query.type = 25;
    }
    return this;
  }

  search(query: string | number, setType: boolean = true) {
    if (setType) {
      this.query.type = 0;
    }
    if (typeof query === "number" && query < 50) {
      this.query.officialLevelId = query;
    }
    this.query.str = query.toString();
    return this;
  }

  ids(ids: number[]) {
    this.query.type = 10;
    return this.search(ids.join(","), false);
  }

  page(page: number) {
    this.query.page = Math.max(0, page);
    return this;
  }

  difficulty(
    difficulty:
      | "n/a"
      | "auto"
      | "easy"
      | "normal"
      | "hard"
      | "harder"
      | "insane"
      | "demon"
      | "easy demon"
      | "medium demon"
      | "hard demon"
      | "insane demon"
      | "extreme demon",
  ) {
    if (difficulty === "n/a") {
      this.query.diff = 0;
    } else if (difficulty === "auto") {
      this.query.diff = -3;
    } else if (difficulty === "easy") {
      this.query.diff = 1;
    } else if (difficulty === "normal") {
      this.query.diff = 2;
    } else if (difficulty === "hard") {
      this.query.diff = 3;
    } else if (difficulty === "harder") {
      this.query.diff = 4;
    } else if (difficulty === "insane") {
      this.query.diff = 5;
    } else if (difficulty === "demon") {
      this.query.diff = -2;
    } else if (difficulty === "easy demon") {
      this.query.diff = -2;
      this.query.demonFilter = 1;
    } else if (difficulty === "medium demon") {
      this.query.diff = -2;
      this.query.demonFilter = 2;
    } else if (difficulty === "hard demon") {
      this.query.diff = -2;
      this.query.demonFilter = 3;
    } else if (difficulty === "insane demon") {
      this.query.diff = -2;
      this.query.demonFilter = 4;
    } else if (difficulty === "extreme demon") {
      this.query.diff = -2;
      this.query.demonFilter = 5;
    }
    return this;
  }

  length(length: "tiny" | "short" | "medium" | "long" | "xl" | "platformer") {
    this.query.len = length;
    return this;
  }

  rating(
    rating: "no star" | "star" | "featured" | "epic" | "legendary" | "mythic",
  ) {
    if (rating === "no star") {
      this.query.noStar = 1;
    } else if (rating === "star") {
      this.query.star = 1;
    } else if (rating === "featured") {
      this.query.featured = 1;
    } else if (rating === "epic") {
      this.query.epic = 1;
    } else if (rating === "legendary") {
      this.query.legendary = 1;
    } else if (rating === "mythic") {
      this.query.mythic = 1;
    }
    this.query.rating = rating;
    return this;
  }

  twoPlayer(twoPlayer: boolean) {
    this.query.twoPlayer = twoPlayer ? 1 : 0;
    return this;
  }

  coins(coins: boolean) {
    this.query.coins = coins ? 1 : 0;
    return this;
  }

  protected async execute(): Promise<LevelSearchResponse | null> {
    const parser = new Parser();
    const searchTerm = this.query.str?.toString().toLowerCase();
    let officialResults: Level[] = [];

    if (this.query.type === 0 && searchTerm) {
      officialResults = Object.values(levels).filter(
        (l) =>
          l.name.toLowerCase().includes(searchTerm) ||
          l.id.toString() === searchTerm,
      );
    }

    if (this.query.officialLevelId) {
      return parser.parseOfficialLevelSearch(
        this.query.officialLevelId as number,
      );
    }
    const response = await fetch(
      this.BOOMLINGS_BASE_API + "/getGJLevels21.php",
      {
        method: "POST",
        headers: {
          "User-Agent": "",
        },
        body: new URLSearchParams({
          ...this.query,
          secret: this.COMMON_SECRET,
        }),
      },
    );

    const text = await response.text();
    const onlineResults = parser.parseLevelSearch(text);
    return {
      ...onlineResults,
      result: [...officialResults, ...(onlineResults?.result || [])],
    };
    return parser.parseLevelSearch(text);
  }
}
