import { splitPairings } from "../utils";
import Database from "../database";
import { OfficialSongs } from "./officialSongs";

/** Level search types */
export enum LevelSearchType {
  SearchQuery = "0",
  MostDownloaded = "1",
  MostLiked = "2",
  Trending = "3",
  Recent = "4",
  UsersLevels = "5",
  Featured = "6",
  Magic = "7",
  ModeratorSentLevels = "8",
  ListOfLevels = "10",
  Awarded = "11",
  Followed = "12",
  Friends = "13",
  MostLikedGDW = "15",
  HallOfFame = "16",
  FeaturedGDW = "17",
  DailyHistory = "21",
  WeeklyHistory = "22",
  LevelList = "25",
}

export enum Difficulty {
  NA = "-1",
  Demons = "-2",
  Easy = "1",
  Normal = "2",
  Hard = "3",
  Harder = "4",
  Insane = "5",
}

export enum DemonDifficulty {
  Easy = "1",
  Normal = "2",
  Hard = "3",
  Insane = "4",
  Extreme = "5",
}

export enum LevelLength {
  Tiny = "0",
  Short = "1",
  Medium = "2",
  Long = "3",
  XL = "4",
  Platformer = "5",
}

const API_URL = "http://www.boomlings.com/database/getGJLevels21.php";

/** Utility converters */
const toInt = (val: string): number => parseInt(val || "0", 10);
const toBool = (val: string): boolean => toInt(val) === 1;
const decodeBase64 = (val: string): string | null => {
  try {
    return atob(val);
  } catch {
    return null;
  }
};

export interface CreatorData {
  userID: number;
  username: string;
  accountID: number;
}

export interface LevelData {
  id: number;
  name: string;
  description: string | null;
  version: number;
  playerID: number;
  difficultyDenominator: number;
  difficultyNumerator: number;
  downloads: number;
  officialSong: number;
  gameVersion: number;
  likes: number;
  length: number;
  dislikes: number;
  demon: boolean;
  stars: number;
  featureScore: number;
  auto: boolean;
  twoPlayer: boolean;
  customSongID: number;
  coins: number;
  verifiedCoins: boolean;
  starsRequested: number;
  epic: number;
  demonDifficulty: number;
  isGauntlet: boolean;
  objects: number;
  editorTime: number;
  editorTimeCopies: number;
}

/** Maps numeric codes to readable values */
function mapLevelLength(len: number): string {
  const mapping: Record<number, string> = {
    0: "Tiny",
    1: "Short",
    2: "Medium",
    3: "Long",
    4: "XL",
    5: "Platformer",
  };
  return mapping[len] ?? "Unknown";
}

function mapDifficulty(
  denom: number,
  num: number,
  isDemon: boolean,
  demonDiff: number,
  auto: boolean,
): string {
  if (auto) return "Auto";
  if (denom === 0) return "N/A";

  if (isDemon) {
    const demonMap: Record<number, string> = {
      3: "Easy Demon",
      4: "Medium Demon",
      0: "Hard Demon",
      5: "Insane Demon",
      6: "Extreme Demon",
    };
    return demonMap[demonDiff] ?? "Demon";
  }

  const normalMap: Record<number, string> = {
    10: "Easy",
    20: "Normal",
    30: "Hard",
    40: "Harder",
    50: "Insane",
  };
  return normalMap[num] ?? "N/A";
}

function mapRating(featureScore: number, epic: number): string {
  if (epic === 3) return "Mythic";
  if (epic === 2) return "Legendary";
  if (epic === 1) return "Epic";
  if (featureScore > 0) return "Featured";
  return "Rated";
}

async function fetchLevels(params: Record<string, string>) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "User-Agent": "" },
    body: new URLSearchParams(params),
  });

  return response.text();
}

async function parseResponse(text: string) {
  const [levelsRaw, creatorsRaw, songsRaw, pageInfoRaw, hash] = text.split("#");
  const [total, offset, amount] = pageInfoRaw.split(":");

  console.log(`Page Hash: ${hash}`);
  console.log(`Total: ${total}, Offset: ${offset}, Amount: ${amount}`);

  const creators: Record<number, CreatorData> = {};
  creatorsRaw.split("|").forEach((creatorData) => {
    const [userID, name, accountID] = creatorData.split(":");
    const creator = {
      userID: parseInt(userID),
      username: name,
      accountID: parseInt(accountID),
    };
    creators[parseInt(userID)] = creator;
  });

  const songs: Record<string, { title: string; artist: string }> = {};
  songsRaw.split("~:~").forEach((song) => {
    const s = splitPairings(song, "~|~");
    songs[s[1]] = { title: s[2], artist: s[4] };
  });

  for (const level of levelsRaw.split("|")) {
    const obj = splitPairings(level, ":");

    const data: LevelData = {
      id: toInt(obj[1]),
      name: obj[2] ?? "",
      description: decodeBase64(obj[3]),
      version: toInt(obj[5]),
      playerID: toInt(obj[6]),
      difficultyDenominator: toInt(obj[8]),
      difficultyNumerator: toInt(obj[9]),
      downloads: toInt(obj[10]),
      officialSong: toInt(obj[12]),
      gameVersion: toInt(obj[13]),
      likes: toInt(obj[14]),
      length: toInt(obj[15]),
      dislikes: toInt(obj[16]),
      demon: toBool(obj[17]),
      stars: toInt(obj[18]),
      featureScore: toInt(obj[19]),
      auto: toBool(obj[25]),
      twoPlayer: toBool(obj[31]),
      customSongID: toInt(obj[35]),
      coins: toInt(obj[37]),
      verifiedCoins: toBool(obj[38]),
      starsRequested: toInt(obj[39]),
      epic: toInt(obj[42]),
      demonDifficulty: toInt(obj[43]),
      isGauntlet: toBool(obj[44]),
      objects: toInt(obj[45]),
      editorTime: toInt(obj[46]),
      editorTimeCopies: toInt(obj[47]),
    };

    const difficulty = mapDifficulty(
      data.difficultyDenominator,
      data.difficultyNumerator,
      data.demon,
      data.demonDifficulty,
      data.auto,
    );
    const length = mapLevelLength(data.length);

    const rating = mapRating(data.featureScore, data.epic);

    // Publisher handling
    const publisher = creators[data.playerID];
    await Database.instance.insertAccount(
      publisher.accountID,
      publisher.username,
    );

    // Song handling
    let song = { artist: "", title: "" };
    let songId: number | undefined;

    if (data.customSongID === 0) {
      song = OfficialSongs[data.officialSong];
      const existing = await Database.instance.getSong(-data.officialSong);
      songId =
        existing?.id ??
        (await Database.instance.insertSong({
          id: -data.officialSong,
          ...song,
        }));
    } else {
      song = songs[data.customSongID];
      const existing = await Database.instance.getSong(data.customSongID);
      songId =
        existing?.id ??
        (await Database.instance.insertSong({
          id: data.customSongID,
          ...song,
        }));
    }

    // Insert level
    await Database.instance.insertLevel({
      id: data.id,
      name: data.name,
      description: data.description,
      publisher_account_id: publisher.accountID,
      release_date: null,
      difficulty,
      length,
      song_id: songId!,
      video_url: null,
      coins: data.verifiedCoins ? data.coins : 0,
      two_player: data.twoPlayer,
      rating,
    });
  }
}

export async function addLevelsToDatabase(pageStart: number, pageEnd: number) {
  for (let i = pageStart; i <= pageEnd; i++) {
    console.log(`Fetching page ${i}...`);
    const text = await fetchLevels({
      secret: "Wmfd2893gb7",
      diff: Difficulty.Demons,
      demonFilter: DemonDifficulty.Extreme,
      type: LevelSearchType.MostDownloaded,
      page: `${i}`,
    });
    await parseResponse(text);
  }
}
