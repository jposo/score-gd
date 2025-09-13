import { splitPairings } from "../utils";
import Database from "../database";

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

const Number2Length: Record<string, string> = {
  "0": "Tiny",
  "1": "Short",
  "2": "Medium",
  "3": "Long",
  "4": "XL",
  "5": "Platformer",
};

const OfficialSongs: Record<string, { title: string; artist: string }> = {
  "0": {
    title: "Stereo Madness",
    artist: "ForeverBound",
  },
  "1": {
    title: "Back on Track",
    artist: "DJVI",
  },
  "2": {
    title: "Polargeist",
    artist: "Step",
  },
  "3": {
    title: "Dry Out",
    artist: "DJVI",
  },
  "4": {
    title: "Base After Base",
    artist: "DJVI",
  },
  "5": {
    title: "Can't Let Go",
    artist: "DJVI",
  },
  "6": {
    title: "Jumper",
    artist: "Waterflame",
  },
  "7": {
    title: "Time Machine",
    artist: "Waterflame",
  },
  "8": {
    title: "Cycles",
    artist: "DJVI",
  },
  "9": {
    title: "xStep",
    artist: "DJVI",
  },
  "10": {
    title: "Clutterfunk",
    artist: "Waterflame",
  },
  "11": {
    title: "Theory of Everything",
    artist: "DJ-Nate",
  },
  "12": {
    title: "Electroman Adventures",
    artist: "DJ-Nate",
  },
  "13": {
    title: "Clubstep",
    artist: "DJ-Nate",
  },
  "14": {
    title: "Electrodynamix",
    artist: "DJ-Nate",
  },
  "15": {
    title: "Hexagon Force",
    artist: "DJ-Nate",
  },
  "16": {
    title: "Blast Processing",
    artist: "DJ-Nate",
  },
  "17": {
    title: "Theory of Everything 2",
    artist: "DJ-Nate",
  },
  "18": {
    title: "Geometrical Dominator",
    artist: "Waterflame",
  },
  "19": {
    title: "Deadlocked",
    artist: "F-777",
  },
  "20": {
    title: "Fingerdash",
    artist: "MDK",
  },
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
    const name = levelObject[2];
    const difficulty = "Extreme Demon";
    const publisherID = levelObject[6];
    const publisher = creators[publisherID];
    const officialSong = levelObject[12];
    const songID = levelObject[35];
    const length = levelObject[15];
    let song = { artist: "", title: "" };
    let songId;
    if (songID == "0") {
      const gdId = 0 - parseInt(officialSong); // negative ids for offical songs
      song = OfficialSongs[officialSong];
      const dbsong = await Database.instance.getSong(gdId);
      if (dbsong === null) {
        songId = await Database.instance.insertSong({
          geometry_dash_id: gdId,
          title: song.title,
          artist: song.artist,
        });
      } else {
        songId = dbsong.id;
      }
    } else {
      const gdId = parseInt(songID);
      song = songs[songID];
      const dbsong = await Database.instance.getSong(gdId);
      if (dbsong === null) {
        songId = await Database.instance.insertSong({
          geometry_dash_id: gdId,
          title: song.title,
          artist: song.artist,
        });
      } else {
        songId = dbsong.id;
      }
    }
    const levelType = levelObject[15] === "5" ? "Platformer" : "Classic";
    const levelID = levelObject[1];
    const levelId = parseInt(levelID);

    console.log(
      `${name} by ${publisher} with song ${song.title} by ${song.artist} (${levelID}-${levelType})`,
    );

    const dblevel = await Database.instance.getLevel(levelId);
    if (dblevel === null) {
      await Database.instance.insertLevel({
        geometry_dash_id: levelId,
        name,
        type: levelType,
        publisher,
        difficulty,
        length: Number2Length[length],
        song_id: songId,
      });
    } else {
      console.log("Level already exists. Skipping...");
    }
  }
}

export async function addLevelsToDatabase(pageCount: number) {
  for (let i = 0; i < pageCount; i++) {
    await getLevels({
      secret: "Wmfd2893gb7",
      diff: Difficulty.Demons,
      demonFilter: Demon.ExtremeDemon,
      type: Type.MostDownloaded,
      page: `${i}`,
    });
  }
}
