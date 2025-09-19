import { splitPairings } from "../utils";
import Database from "../database";
import { OfficialSongs } from "./officialSongs";

const Type = {
  SearchQuery: "0",
  MostDownloaded: "1",
  MostLiked: "2",
  Trending: "3",
  Recent: "4",
  UsersLevels: "5",
  Featured: "6",
  Magic: "7",
  ModeratorSentLevels: "8",
  ListOfLevels: "10",
  Awarded: "11",
  Followed: "12",
  Friends: "13",
  MostLikedGDW: "15",
  HallOfFame: "16",
  FeaturedGDW: "17",
  DailyHistory: "21",
  WeeklyHistory: "22",
  LevelList: "25",
};

const Difficulty = {
  NA: "-1",
  Demons: "-2",
  Easy: "1",
  Normal: "2",
  Hard: "3",
  Harder: "4",
  Insane: "5",
};

const Demon = {
  EasyDemon: "1",
  NormalDemon: "2",
  HardDemon: "3",
  InsaneDemon: "4",
  ExtremeDemon: "5",
};

const Length = {
  Tiny: "0",
  Short: "1",
  Medium: "2",
  Long: "3",
  XL: "4",
  Platformer: "5",
};

const Number2Length: Record<number, string> = {
  0: "Tiny",
  1: "Short",
  2: "Medium",
  3: "Long",
  4: "XL",
  5: "Platformer",
};

async function getLevels(params: {
  secret: string;
  gameVersion?: string;
  binaryVersion?: string;
  type?: string;
  str?: string;
  page?: string;
  total?: string;
  gjp?: string;
  gjp2?: string;
  accountID?: string;
  gdw?: string;
  gauntlet?: string;
  diff?: string;
  demonFilter?: string;
  len?: string;
  uncompleted?: string;
  onlyCompleted?: string;
  completedLevels?: string;
  featured?: string;
  original?: string;
  twoPlayer?: string;
  coins?: string;
  epic?: string;
  legendary?: string;
  mythic?: string;
  noStar?: string;
  star?: string;
  song?: string;
  customSong?: string;
  followed?: string;
  local?: string;
  udid?: string;
  uuid?: string;
}) {
  const headers = {
    "User-Agent": "",
  };

  const url = "http://www.boomlings.com/database/getGJLevels21.php";

  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: new URLSearchParams(params),
  });

  const text = await response.text();
  await parseResponse(text);
}

function getDifficulty(
  difficultyDenominator: number,
  difficultyNumerator: number,
  demon: boolean,
  demonDifficulty: number,
  auto: boolean,
) {
  if (auto) return "Auto";
  if (difficultyDenominator === 0) return "N/A";

  if (demon) {
    if (demonDifficulty === 3) return "Easy Demon";
    if (demonDifficulty === 4) return "Medium Demon";
    if (demonDifficulty === 0) return "Hard Demon";
    if (demonDifficulty === 5) return "Insane Demon";
    if (demonDifficulty === 6) return "Extreme Demon";
  }

  if (difficultyNumerator === 10) return "Easy";
  if (difficultyNumerator === 20) return "Normal";
  if (difficultyNumerator === 30) return "Hard";
  if (difficultyNumerator === 40) return "Harder";
  if (difficultyNumerator === 50) return "Insane";
}

export interface LevelData {
  /** The unique identifier for the level. (from index 1) */
  id: number;
  /** The name of the level. (from index 2) */
  name: string;
  /** The description of the level. (from index 3) */
  description: string | null;
  /** The version of the level. (from index 5) */
  version: number;
  /** The ID of the level's publisher/creator. (from index 6) */
  publisherID: number;
  /** The denominator for the difficulty calculation. (from index 8) */
  difficultyDenominator: number;
  /** The numerator for the difficulty calculation. (from index 9) */
  difficultyNumerator: number;
  /** The total number of downloads. (from index 10) */
  downloads: number;
  /** The ID of the official song, if used. (from index 12) */
  officialSong: number;
  /** The game version the level was created in. (from index 13) */
  gameVersion: number;
  /** The number of likes the level has received. (from index 14) */
  likes: number;
  /** The length of the level (e.g., 0=tiny, 1=short, 2=medium, 3=long, 4=xl). (from index 15) */
  length: number;
  /** The number of dislikes the level has received. (from index 16) */
  dislikes: number;
  /** A boolean (represented as 0 or 1) indicating if the level is a demon. (from index 17) */
  demon: boolean;
  /** The number of stars the level is rated. (from index 18) */
  stars: number;
  /** The feature score of the level. (from index 19) */
  featureScore: number;
  /** A boolean (represented as 0 or 1) indicating if the level is an auto level. (from index 25) */
  auto: boolean;
  /** A boolean (represented as 0 or 1) indicating if the level is for two players. (from index 31) */
  twoPlayer: boolean;
  /** The ID of the custom song, if used. (from index 35) */
  customSongID: number;
  /** The number of user coins in the level. (from index 37) */
  coins: number;
  /** A boolean (represented as 0 or 1) indicating if the user coins are verified. (from index 38) */
  verifiedCoins: boolean;
  /** The number of stars requested for the level. (from index 39) */
  starsRequested: number;
  epic: number;
  /** The demon difficulty rating (e.g., 0=easy, 1=medium, 2=hard, 3=insane, 4=extreme). (from index 43) */
  demonDifficulty: number;
  /** A boolean (represented as 0 or 1) indicating if the level is part of a gauntlet. (from index 44) */
  isGauntlet: boolean;
  /** The total number of objects in the level. (from index 45) */
  objects: number;
  /** The time spent in the editor in seconds. (from index 46) */
  editorTime: number;
  /** The number of copies made of the level. (from index 47) */
  editorTimeCopies: number;
}

const toInt = (value: any): number => parseInt(value || "0", 10);
const toBool = (value: any): boolean => toInt(value) === 1;

function getRating(featureScore: number, epic: number) {
  if (epic === 3) return "Mythic";
  if (epic === 2) return "Legendary";
  if (epic === 1) return "Epic";
  if (featureScore > 0) return "Featured";
  return "Rated";
}

async function parseResponse(text: string) {
  const [levelsRaw, creatorsRaw, songsRaw, pageInfoRaw, hash] = text.split("#");

  console.log(`Page Hash: ${hash}`);

  const [total, offset, amount] = pageInfoRaw.split(":");

  console.log(`Total: ${total}, Offset: ${offset}, Amount: ${amount}`);

  const levelsList = levelsRaw.split("|");
  const creatorsList = creatorsRaw.split("|");
  const songsList = songsRaw.split("~:~" /* /:(?=~1~\|~)/ */);

  const creators: Record<string, string> = {};
  creatorsList.forEach((creator) => {
    const [creatorID, creatorName, _] = creator.split(":");
    creators[creatorID] = creatorName;
  });

  const songs: Record<string, { title: string; artist: string }> = {};
  songsList.forEach((song) => {
    const levelObject = splitPairings(song, "~|~");
    songs[levelObject[1]] = {
      title: levelObject[2],
      artist: levelObject[4],
    };
  });

  for (let i = 0; i < levelsList.length; i++) {
    const level = levelsList[i];
    const levelObject = splitPairings(level, ":");
    let decodedDescription;
    try {
      decodedDescription = atob(levelObject[3]);
    } catch (error) {
      console.error(decodedDescription, error);
      decodedDescription = null;
    }
    const data: LevelData = {
      id: toInt(levelObject[1]),
      name: levelObject[2] || "",
      description: decodedDescription,
      version: toInt(levelObject[5]),
      publisherID: toInt(levelObject[6]),
      difficultyDenominator: toInt(levelObject[8]),
      difficultyNumerator: toInt(levelObject[9]),
      downloads: toInt(levelObject[10]),
      officialSong: toInt(levelObject[12]),
      gameVersion: toInt(levelObject[13]),
      likes: toInt(levelObject[14]),
      length: toInt(levelObject[15]),
      dislikes: toInt(levelObject[16]),
      demon: toBool(levelObject[17]),
      stars: toInt(levelObject[18]),
      featureScore: toInt(levelObject[19]),
      auto: toBool(levelObject[25]),
      twoPlayer: toBool(levelObject[31]),
      customSongID: toInt(levelObject[35]),
      coins: toInt(levelObject[37]),
      verifiedCoins: toBool(levelObject[38]),
      starsRequested: toInt(levelObject[39]),
      epic: toInt(levelObject[42]),
      demonDifficulty: toInt(levelObject[43]),
      isGauntlet: toBool(levelObject[44]),
      objects: toInt(levelObject[45]),
      editorTime: toInt(levelObject[46]),
      editorTimeCopies: toInt(levelObject[47]),
    };

    const difficulty = getDifficulty(
      data.difficultyDenominator,
      data.difficultyNumerator,
      data.demon,
      data.demonDifficulty,
      data.auto,
    );

    const rating = getRating(data.featureScore, data.epic);
    const publisher = creators[data.publisherID];
    let song = { artist: "", title: "" };
    let songId;
    if (data.customSongID === 0) {
      song = OfficialSongs[data.officialSong];
      const dbsong = await Database.instance.getSong(0 - data.officialSong);
      if (dbsong === null) {
        songId = await Database.instance.insertSong({
          geometry_dash_id: 0 - data.officialSong,
          title: song.title,
          artist: song.artist,
        });
      } else {
        songId = dbsong.id;
      }
    } else {
      song = songs[data.customSongID];
      const dbsong = await Database.instance.getSong(data.customSongID);
      if (dbsong === null) {
        songId = await Database.instance.insertSong({
          geometry_dash_id: data.customSongID,
          title: song.title,
          artist: song.artist,
        });
      } else {
        songId = dbsong.id;
      }
    }
    const type = data.length === 5 ? "Platformer" : "Classic";

    const l = await Database.instance.insertLevel({
      geometry_dash_id: data.id,
      name: data.name,
      description: data.description,
      type: type,
      publisher,
      publisher_id: null,
      release_date: null,
      difficulty,
      length: Number2Length[data.length],
      song_id: songId,
      video_url: null,
      coins: data.coins,
      two_player: data.twoPlayer,
      rating: rating,
    });
    if (!l) {
      console.log("Level already exists.");
    }
  }
}

export async function addLevelsToDatabase(pageCount: number) {
  for (let i = 0; i < pageCount; i++) {
    console.log("Page #", i);
    await getLevels({
      secret: "Wmfd2893gb7",
      diff: Difficulty.Demons,
      demonFilter: Demon.ExtremeDemon,
      type: Type.MostDownloaded,
      page: `${i}`,
    });
  }
}
