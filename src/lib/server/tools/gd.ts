import { Parser } from "./parser.ts";
import {
  SearchType,
  Difficulty,
  type SearchSettings,
  DemonDifficulty,
  Length,
  Rating,
} from "./types.ts";
import { levelDateEstimation } from "./history.ts";

const LEVEL_SECRET = "Wmfd2893gb7";
const ACCOUNT_SECRET = "Wmfv3899gc9";
const BASE_URL = "http://www.boomlings.com/database";

function isType(type: object, value: string): value is keyof typeof type {
  return Object.values(SearchType).includes(value as SearchType);
}

export class Accounts {
  static login(userUUID: string, username: string, password: string) {}
}

export class Levels {
  private static parameterized(settings: SearchSettings) {
    const params: Record<string, string | number> = {};
    const table = {
      type: {
        [SearchType.MostDownloaded]: 1,
        [SearchType.MostLiked]: 2,
        [SearchType.Trending]: 3,
        [SearchType.Recent]: 4,
        [SearchType.Featured]: 6,
      },
      difficulty: {
        base: {
          [Difficulty.NA]: -1,
          [Difficulty.Easy]: 1,
          [Difficulty.Normal]: 2,
          [Difficulty.Hard]: 3,
          [Difficulty.Harder]: 4,
          [Difficulty.Insane]: 5,
          [Difficulty.Demon]: -2,
        },
        demon: {
          [DemonDifficulty.EasyDemon]: 1,
          [DemonDifficulty.MediumDemon]: 2,
          [DemonDifficulty.HardDemon]: 3,
          [DemonDifficulty.InsaneDemon]: 4,
          [DemonDifficulty.ExtremeDemon]: 5,
        },
      },
      length: {
        [Length.Tiny]: 0,
        [Length.Short]: 1,
        [Length.Medium]: 2,
        [Length.Long]: 3,
        [Length.XL]: 4,
        [Length.Platformer]: 5,
      },
    };
    for (const [key, value] of Object.entries(settings)) {
      if (key === "type") {
        params["type"] = table.type[value];
      } else if (key === "length") {
        params["len"] = table.length[value];
      } else if (key === "difficulty") {
        if (isType(Difficulty, value as string)) {
          params["diff"] = table.difficulty.base[value];
        } else {
          params["diff"] = table.difficulty.base[Difficulty.Demon];
          params["demonFilter"] = table.difficulty.demon[value];
        }
      } else if (key === "page") {
        params["page"] = value;
      } else if (key === "rating") {
        if (value === Rating.Mythic) {
          params["mythic"] = 1;
        } else if (value === Rating.Legendary) {
          params["legendary"] = 1;
        } else if (value === Rating.Epic) {
          params["epic"] = 1;
        } else if (value === Rating.Featured) {
          params["featured"] = 1;
        } else if (value === Rating.Star) {
          params["star"] = 1;
        } else if (value === Rating.NoStar) {
          params["noStar"] = 1;
        }
      }
    }
    return params;
  }

  static async search(
    settings: SearchSettings = {},
    estimateDate: boolean = false,
  ) {
    const headers = {
      "User-Agent": "",
    };

    const params = Levels.parameterized(settings);
    console.log("Searching with params:", params);

    const url = BASE_URL + "/getGJLevels21.php";
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: new URLSearchParams({
        ...params,
        secret: LEVEL_SECRET,
      }),
    });
    const text = await response.text();

    const levels = Parser.parseLevelSearch(text);
    if (estimateDate) {
      for (const level of levels) {
        level.date = (await levelDateEstimation(level.id)) ?? null;
      }
    }
    return levels;
  }
}
