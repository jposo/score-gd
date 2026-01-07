interface RawLevel {
  $raw: Record<string, string>;
  id?: number;
  name?: string;
  description?: string;
  string?: string;
  version?: number;
  playerId?: number;
  difficultyDenominator?: number;
  difficultyNumerator?: number;
  downloads?: number;
  setCompletes?: number;
  officialSong?: number;
  gameVersion?: number;
  likes?: number;
  length?: number;
  dislikes?: number;
  demon?: boolean;
  stars?: number;
  featureScore?: number;
  auto?: boolean;
  recordString?: string;
  password?: string;
  uploadDate?: string;
  updateDate?: string;
  copiedId?: number;
  twoPlayer?: boolean;
  customSongId?: number;
  extraString?: string;
  coins?: number;
  verifiedCoins?: boolean;
  starsRequested?: number;
  lowDetailMode?: boolean;
  dailyNumber?: number;
  epic?: number;
  demonDifficulty?: number;
  isGauntlet?: boolean;
  objects?: number;
  editorTime?: number;
  editorTimeCopies?: number;
  settingsString?: string;
  songIDs?: string;
  sfxIDs?: string;
  unknown?: number;
  verificationTime?: number;
}

interface RawSong {
  $raw: Record<string, string>;
  id?: number;
  name?: string;
  artistId?: number;
  artistName?: string;
  size?: number;
  videoId?: string;
  youtubeUrl?: string;
  isVerified?: boolean;
  songPriority?: number;
  link?: string;
  nongEnum?: number;
  extraArtistIds?: number[];
  new?: boolean;
  newType?: number;
  extraArtistNames?: { id: number; name: string }[];
}

interface RawUser {
  username?: string;
  id?: number;
  stars?: number;
  demons?: number;
  ranking?: number;
  accountHighlight?: number;
  creatorPoints?: number;
  iconId?: number;
  color?: number;
  color2?: number;
  secretCoins?: number;
  iconType?: number;
  special?: number;
  accountId?: number;
  userCoins?: number;
  messageState?: number;
  friendsState?: number;
  youTube?: string;
  accIcon?: number;
  accShip?: number;
  accBall?: number;
  accBird?: number;
  accDart?: number;
  accRobot?: number;
  accStreak?: number;
  accGlow?: number;
  isRegistered?: number;
  globalRank?: number;
  friendState?: number;
  messages?: number;
  friendRequests?: number;
  newFriends?: number;
  newFriendRequest?: boolean;
  age?: string;
  accSpider?: number;
  twitter?: string;
  twitch?: string;
  diamonds?: number;
  accExplosion?: number;
  modLevel?: number;
  commentHistoryState?: number;
  color3?: number;
  moons?: number;
  accSwing?: number;
  accJetpack?: number;
  demonsBreakdown?: string;
  classicLevels?: string;
  classLevels?: string;
  platformerLevels?: string;
}

interface BaseSong {
  id: number;
  name: string;
  artist: {
    id?: number;
    name: string;
  };
}

export interface OfficialSong extends BaseSong {}

export interface CustomSong extends BaseSong {
  sizeMB: number;
  verified: boolean;
  url?: string;
}

export interface Creator {
  userId: number;
  username?: string;
  accountId?: number;
}

export interface Level {
  id: number;
  name: string;
  description?: string;
  versions: {
    level: number;
    game: number;
  };
  creator?: Creator;
  stats: {
    downloads: number;
    likes: number;
    dislikes: number;
    stars: number;
    starsRequests: number;
  };
  difficulty: string;
  length: string;
  rating: string;
  coins: {
    count: number;
    verified: boolean;
  };
  song?: BaseSong;
}

export interface PageInfo {
  total: number;
  offset: number;
  amount: number;
}

export interface LevelSearchResponse {
  levels: Level[];
  pageInfo: PageInfo;
  hash: string;
}

export interface User {
  username: string;
  id: number;
  registered: boolean;
  stats: {
    stars: number;
    diamonds: number;
    moons: number;
    demons: {
      total: number;
      breakdown?: {
        easy: {
          total: number;
          classic: number;
          platformer: number;
        };
        medium: {
          total: number;
          classic: number;
          platformer: number;
        };
        hard: {
          total: number;
          classic: number;
          platformer: number;
        };
        insane: {
          total: number;
          classic: number;
          platformer: number;
        };
        extreme: {
          total: number;
          classic: number;
          platformer: number;
        };
      };
    };
    secretCoins: number;
    userCoins: number;
    creatorPoints: number;
  };
  globalRank: number;
  rank: number;
  // accountHighlight: number;
  kit: {
    color1: number;
    color2: number;
    color3: number;
    // iconId: number;
    // iconType: number;
    icon: number;
    ship: number;
    ball: number;
    ufo: number;
    wave: number;
    robot: number;
    spider: number;
    swing: number;
    jetpack: number;
    // streak: number;
    glow: number;
    explosion: number;
  };
  special: number;
  social: {
    allowMessagesFrom: "all" | "only friends" | "none";
    allowFriendsFrom: "all" | "none";
    links: {
      youtube?: string;
      twitter?: string;
      twitch?: string;
    };
    friendRequestState: "none" | "friend" | "requested" | "received";
    commentHistoryState: "all" | "only friends" | "none";
    isNewFriendRequest: boolean;
    count: {
      messages: number;
      friendRequests: number;
      newFriends: number;
    };
  };
  age: string;
  modLevel: "none" | "normal mod" | "elder mod";
}

export class Parser {
  parseLevelSearch(response: string) {
    if (response === "-1") {
      return null;
    }

    const sections = response.split("#");

    if (sections.length !== 5) {
      throw new Error("unexpected response format");
    }

    const [levelsStr, creatorsStr, songsStr, pageInfoStr, hash] = sections;

    const rawLevels = this.parseLevels(levelsStr);
    const creators = this.parseCreators(creatorsStr);
    const songs = this.parseSongs(songsStr);

    // console.log(rawLevels, songs);

    const levels = rawLevels.map((level) => {
      const creator: Creator = creators.find(
        (c) => c.userId === level.playerId,
      ) ?? {
        userId: level.playerId!,
      };
      let song = level.customSongId
        ? this.parseCustomSong(level, songs)
        : this.parseOfficialSong(level);

      return {
        id: level.id!,
        name: level.name!,
        description: atob(level.description ?? ""),
        versions: {
          level: level.version!,
          game: this.parseGameVersion(level.gameVersion!),
        },
        creator,
        stats: {
          downloads: level.downloads!,
          likes: level.likes!,
          dislikes: level.dislikes!,
          stars: level.stars!,
          starsRequests: level.starsRequested!,
        },
        difficulty: this.parseDifficulty(level),
        length: this.parseLength(level),
        rating: this.parseRating(level),
        coins: {
          count: level.coins!,
          verified: level.verifiedCoins!,
        },
        song,
      } satisfies Level;
    });

    return {
      levels,
      pageInfo: this.parsePageInfo(pageInfoStr),
      hash: hash,
    };
  }

  parseLevels(levelsStr: string) {
    if (!levelsStr || levelsStr.trim() === "") {
      return [];
    }

    return levelsStr
      .split("|")
      .filter((levelStr) => levelStr.trim() !== "")
      .map((levelStr) => this.parseLevel(levelStr));
  }

  parseLevel(levelStr: string) {
    const parts = levelStr.split(":");
    const level: RawLevel = { $raw: {} };

    for (let i = 0; i < parts.length - 1; i += 2) {
      const key = parts[i];
      const value = parts[i + 1];

      if (level.$raw) {
        level.$raw[key] = value;
      }

      switch (key) {
        case "1":
          level.id = parseInt(value);
          break;
        case "2":
          level.name = value;
          break;
        case "3":
          level.description = value;
          break;
        case "4":
          level.string = value;
          break;
        case "5":
          level.version = parseInt(value);
          break;
        case "6":
          level.playerId = parseInt(value);
          break;
        case "8":
          level.difficultyDenominator = parseInt(value);
          break;
        case "9":
          level.difficultyNumerator = parseInt(value);
          break;
        case "10":
          level.downloads = parseInt(value);
          break;
        case "11":
          level.setCompletes = parseInt(value);
          break;
        case "12":
          level.officialSong = parseInt(value);
          break;
        case "13":
          level.gameVersion = parseInt(value);
          break;
        case "14":
          level.likes = parseInt(value);
          break;
        case "15":
          level.length = parseInt(value);
          break;
        case "16":
          level.dislikes = parseInt(value);
          break;
        case "17":
          level.demon = value === "1";
          break;
        case "18":
          level.stars = parseInt(value);
          break;
        case "19":
          level.featureScore = parseInt(value);
          break;
        case "25":
          level.auto = value === "1";
          break;
        case "26":
          level.recordString = value;
          break;
        case "27":
          level.password = value;
          break;
        case "28":
          level.uploadDate = value;
          break;
        case "29":
          level.updateDate = value;
          break;
        case "30":
          level.copiedId = parseInt(value);
          break;
        case "31":
          level.twoPlayer = value === "1";
          break;
        case "35":
          level.customSongId = parseInt(value);
          break;
        case "36":
          level.extraString = value;
          break;
        case "37":
          level.coins = parseInt(value);
          break;
        case "38":
          level.verifiedCoins = value === "1";
          break;
        case "39":
          level.starsRequested = parseInt(value);
          break;
        case "40":
          level.lowDetailMode = value === "1";
          break;
        case "41":
          level.dailyNumber = parseInt(value);
          break;
        case "42":
          level.epic = parseInt(value);
          break;
        case "43":
          level.demonDifficulty = parseInt(value);
          break;
        case "44":
          level.isGauntlet = value === "1";
          break;
        case "45":
          level.objects = parseInt(value);
          break;
        case "46":
          level.editorTime = parseInt(value);
          break;
        case "47":
          level.editorTimeCopies = parseInt(value);
          break;
        case "48":
          level.settingsString = value;
          break;
        case "52":
          level.songIDs = value;
          break;
        case "53":
          level.sfxIDs = value;
          break;
        case "54":
          level.unknown = parseInt(value);
          break;
        case "57":
          level.verificationTime = parseInt(value);
          break;
        default:
          break;
      }
    }
    return level;
  }

  parseCreators(creatorsStr: string) {
    if (!creatorsStr || creatorsStr.trim() === "") {
      return [];
    }

    return creatorsStr
      .split("|")
      .filter((creator) => creator.trim() !== "")
      .map((creator) => {
        const [userId, username, accountId] = creator.split(":");
        return {
          userId: parseInt(userId),
          username,
          accountId: parseInt(accountId),
        };
      });
  }

  parseSongs(songsStr: string) {
    if (!songsStr || songsStr.trim() === "") {
      return [];
    }

    return songsStr
      .split("~:~")
      .filter((songStr) => songStr.trim() !== "")
      .map((songStr) => this.parseSong(songStr));
  }

  parseSong(songStr: string) {
    const parts = songStr.split("~|~");
    const song: RawSong = { $raw: {} };

    for (let i = 0; i < parts.length - 1; i += 2) {
      const key = parts[i];
      const value = parts[i + 1];

      if (song.$raw) {
        song.$raw[key] = value;
      }

      switch (key) {
        case "1":
          song.id = parseInt(value);
          break;
        case "2":
          song.name = value;
          break;
        case "3":
          song.artistId = parseInt(value);
          break;
        case "4":
          song.artistName = value;
          break;
        case "5":
          song.size = parseFloat(value);
          break;
        case "6":
          song.videoId = value;
          break;
        case "7":
          song.youtubeUrl = value;
          break;
        case "8":
          song.isVerified = value === "1";
          break;
        case "9":
          song.songPriority = parseInt(value);
          break;
        case "10":
          song.link = value;
          break;
        case "11":
          song.nongEnum = parseInt(value);
          break;
        case "12":
          song.extraArtistIds = value
            .split(".")
            .map((idStr) => parseInt(idStr));
          break;
        case "13":
          song.new = value === "1";
          break;
        case "14":
          song.newType = parseInt(value);
          break;
        case "15":
          song.extraArtistNames = this.parseExtraArtistNames(value);
          break;
      }
    }
    return song;
  }

  private parseExtraArtistNames(value: string): { id: number; name: string }[] {
    const parts = value.split(",");
    const artists: { id: number; name: string }[] = [];

    for (let i = 0; i < parts.length - 1; i += 2) {
      const id = parseInt(parts[i]);
      const name = parts[i + 1];
      artists.push({ id, name });
    }
    return artists;
  }

  parsePageInfo(pageInfoStr: string) {
    const [totalStr, offsetStr, amountStr] = pageInfoStr.split(":");
    return {
      total: parseInt(totalStr),
      offset: parseInt(offsetStr),
      amount: parseInt(amountStr),
    };
  }

  private parseLength(rawLevel: RawLevel) {
    if (rawLevel.length === 0) return "tiny";
    if (rawLevel.length === 1) return "short";
    if (rawLevel.length === 2) return "medium";
    if (rawLevel.length === 3) return "long";
    if (rawLevel.length === 4) return "xl";
    if (rawLevel.length === 5) return "platformer";
    return "tiny";
  }

  private parseDifficulty(rawLevel: RawLevel) {
    if (rawLevel.auto) return "auto";
    if (rawLevel.demon) {
      if (rawLevel.demonDifficulty == 3) return "easy demon";
      if (rawLevel.demonDifficulty == 4) return "medium demon";
      if (rawLevel.demonDifficulty == 0) return "hard demon";
      if (rawLevel.demonDifficulty == 5) return "insane demon";
      if (rawLevel.demonDifficulty == 6) return "extreme demon";
    }
    if (rawLevel.difficultyNumerator === 10) return "easy";
    if (rawLevel.difficultyNumerator === 20) return "normal";
    if (rawLevel.difficultyNumerator === 30) return "hard";
    if (rawLevel.difficultyNumerator === 40) return "harder";
    if (rawLevel.difficultyNumerator === 50) return "insane";
    return "n/a";
  }

  private parseRating(rawLevel: RawLevel) {
    if (rawLevel.epic == 1) {
      return "epic";
    } else if (rawLevel.epic == 2) {
      return "legendary";
    } else if (rawLevel.epic == 3) {
      return "mythic";
    } else if (rawLevel.epic == 0) {
      if (rawLevel.featureScore !== 0) {
        return "featured";
      } else if (rawLevel.stars !== 0) {
        return "star";
      }
    }
    return "no star";
  }

  private parseCustomSong(
    level: RawLevel,
    songs: RawSong[],
  ): CustomSong | undefined {
    const customSong = songs.find((s) => s.id === level.customSongId);
    if (!customSong) return undefined;
    return {
      id: customSong.id!,
      name: customSong.name!,
      artist: {
        id: customSong.artistId!,
        name: customSong.artistName!,
      },
      sizeMB: customSong.size!,
      verified: customSong.isVerified!,
      url: decodeURIComponent(customSong.link!),
    };
  }

  private parseOfficialSong(level: RawLevel): OfficialSong | undefined {
    if (level.officialSong === undefined) return undefined;

    const songs: Record<number, { name: string; artistName: string }> = {
      0: { name: "Stereo Madness", artistName: "Foreverbound" },
      1: { name: "Back on Track", artistName: "DJVI" },
      2: { name: "Polargeist", artistName: "Step" },
      3: { name: "Dry Out", artistName: "DJVI" },
      4: { name: "Base after Base", artistName: "DJVI" },
      5: { name: "Cant Let Go", artistName: "DJVI" },
      6: { name: "Jumper", artistName: "Waterflame" },
      7: { name: "Time Machine", artistName: "Waterflame" },
      8: { name: "Cycles", artistName: "DJVI" },
      9: { name: "xStep", artistName: "DJVI" },
      10: { name: "Clutterfunk", artistName: "Waterflame" },
      11: { name: "Theory of Everything", artistName: "DJ-Nate" },
      12: { name: "Electroman Adventures", artistName: "Waterflame" },
      13: { name: "Clubstep", artistName: "DJ-Nate" },
      14: { name: "Electrodynamix", artistName: "DJ-Nate" },
      15: { name: "Hexagon Force", artistName: "Waterflame" },
      16: { name: "Blast Processing", artistName: "Waterflame" },
      17: { name: "Theory of Everything 2", artistName: "DJ-Nate" },
      18: { name: "Geometrical Dominator", artistName: "Waterflame" },
      19: { name: "Deadlocked", artistName: "F-777" },
      20: { name: "Fingerdash", artistName: "MDK" },
      21: { name: "Dash", artistName: "MDK" },
      22: { name: "Explorers", artistName: "Hinkik" },
      23: { name: "The Seven Seas", artistName: "F-777" },
      24: { name: "Viking Arena", artistName: "F-777" },
      25: { name: "Airborne Robots", artistName: "F-777" },
      26: { name: "Secret", artistName: "RobTop" },
      27: { name: "Payload", artistName: "Dex Arson" },
      28: { name: "Beast Mode", artistName: "Dex Arson" },
      29: { name: "Machina", artistName: "Dex Arson" },
      30: { name: "Years", artistName: "Dex Arson" },
      31: { name: "Frontlines", artistName: "Dex Arson" },
      32: { name: "Space Pirates", artistName: "Waterflame" },
      33: { name: "Striker", artistName: "Waterflame" },
      34: { name: "Embers", artistName: "Dex Arson" },
      35: { name: "Round 1", artistName: "Dex Arson" },
      36: { name: "Monster Dance Off", artistName: "F-777" },
      37: { name: "Press Start", artistName: "MDK" },
      38: { name: "Nock Em", artistName: "Bossfight" },
      39: { name: "Power Trip", artistName: "Boom Kitty" },
    };

    const song = songs[level.officialSong!];
    if (!song) return undefined;

    return {
      id: level.officialSong!,
      name: song.name,
      artist: {
        name: song.artistName,
      },
    };
  }

  private parseGameVersion(version: number) {
    if (version === 1) {
      return 1.0;
    } else if (version === 2) {
      return 1.1;
    } else if (version === 3) {
      return 1.2;
    } else if (version === 4) {
      return 1.3;
    } else if (version === 5) {
      return 1.4;
    } else if (version === 6) {
      return 1.5;
    } else if (version === 7) {
      return 1.6;
    } else if (version === 10) {
      return 1.7;
    }
    return version / 10;
  }

  parseUserSearch(response: string) {
    return this.parseUser(response);
  }

  parseUser(userStr: string) {
    const parts = userStr.split(":");
    const user: RawUser = {};

    for (let i = 0; i < parts.length - 1; i += 2) {
      const key = parts[i];
      const value = parts[i + 1];

      switch (key) {
        case "1":
          user.username = value;
          break;
        case "2":
          user.id = parseInt(value);
          break;
        case "3":
          user.stars = parseInt(value);
          break;
        case "4":
          user.demons = parseInt(value);
          break;
        case "6":
          user.ranking = parseInt(value);
          break;
        case "7":
          user.accountHighlight = parseInt(value);
          break;
        case "8":
          user.creatorPoints = parseInt(value);
          break;
        case "9":
          user.iconId = parseInt(value);
          break;
        case "10":
          user.color = parseInt(value);
          break;
        case "11":
          user.color2 = parseInt(value);
          break;
        case "13":
          user.secretCoins = parseInt(value);
          break;
        case "14":
          user.iconType = parseInt(value);
          break;
        case "15":
          user.special = parseInt(value);
          break;
        case "16":
          user.accountId = parseInt(value);
          break;
        case "17":
          user.userCoins = parseInt(value);
          break;
        case "18":
          user.messageState = parseInt(value);
          break;
        case "19":
          user.friendsState = parseInt(value);
          break;
        case "20":
          user.youTube = value;
          break;
        case "21":
          user.accIcon = parseInt(value);
          break;
        case "22":
          user.accShip = parseInt(value);
          break;
        case "23":
          user.accBall = parseInt(value);
          break;
        case "24":
          user.accBird = parseInt(value);
          break;
        case "25":
          user.accDart = parseInt(value);
          break;
        case "26":
          user.accRobot = parseInt(value);
          break;
        case "27":
          user.accStreak = parseInt(value);
          break;
        case "28":
          user.accGlow = parseInt(value);
          break;
        case "29":
          user.isRegistered = parseInt(value);
          break;
        case "30":
          user.globalRank = parseInt(value);
          break;
        case "31":
          user.friendState = parseInt(value);
          break;
        case "38":
          user.messages = parseInt(value);
          break;
        case "39":
          user.friendRequests = parseInt(value);
          break;
        case "40":
          user.newFriends = parseInt(value);
          break;
        case "41":
          user.newFriendRequest = value === "1";
          break;
        case "42":
          user.age = value;
          break;
        case "43":
          user.accSpider = parseInt(value);
          break;
        case "44":
          user.twitter = value;
          break;
        case "45":
          user.twitch = value;
          break;
        case "46":
          user.diamonds = parseInt(value);
          break;
        case "48":
          user.accExplosion = parseInt(value);
          break;
        case "49":
          user.modLevel = parseInt(value);
          break;
        case "50":
          user.commentHistoryState = parseInt(value);
          break;
        case "51":
          user.color3 = parseInt(value);
          break;
        case "52":
          user.moons = parseInt(value);
          break;
        case "53":
          user.accSwing = parseInt(value);
          break;
        case "54":
          user.accJetpack = parseInt(value);
          break;
        case "55":
          user.demonsBreakdown = value;
          break;
        case "56":
          user.classicLevels = value;
          break;
        case "57":
          user.platformerLevels = value;
          break;
      }
    }

    const demonBreakdown = this.parseDemonBreakdown(user);

    return {
      username: user.username!,
      id: user.id!,
      registered: user.isRegistered! === 1,
      stats: {
        stars: user.stars!,
        diamonds: user.diamonds!,
        moons: user.moons!,
        demons: {
          total: user.demons!,
          breakdown: {
            easy: {
              total: demonBreakdown.easy + demonBreakdown.easyPlatformer,
              classic: demonBreakdown.easy,
              platformer: demonBreakdown.easyPlatformer,
            },
            medium: {
              total: demonBreakdown.medium + demonBreakdown.mediumPlatformer,
              classic: demonBreakdown.medium,
              platformer: demonBreakdown.mediumPlatformer,
            },
            hard: {
              total: demonBreakdown.hard + demonBreakdown.hardPlatformer,
              classic: demonBreakdown.hard,
              platformer: demonBreakdown.hardPlatformer,
            },
            insane: {
              total: demonBreakdown.insane + demonBreakdown.insanePlatformer,
              classic: demonBreakdown.insane,
              platformer: demonBreakdown.insanePlatformer,
            },
            extreme: {
              total: demonBreakdown.extreme + demonBreakdown.extremePlatformer,
              classic: demonBreakdown.extreme,
              platformer: demonBreakdown.extremePlatformer,
            },
          },
        },
        secretCoins: user.secretCoins!,
        userCoins: user.userCoins!,
        creatorPoints: user.creatorPoints!,
      },
      globalRank: user.globalRank!,
      rank: user.ranking!,
      kit: {
        color1: user.color!,
        color2: user.color2!,
        color3: user.color3!,
        icon: user.accIcon!,
        ship: user.accShip!,
        ball: user.accBall!,
        ufo: user.accBird!,
        wave: user.accDart!,
        robot: user.accRobot!,
        spider: user.accSpider!,
        swing: user.accSwing!,
        jetpack: user.accJetpack!,
        glow: user.accGlow!,
        explosion: user.accExplosion!,
      },
      special: user.special!,
      social: {
        allowMessagesFrom: this.parseAllowMessagesFrom(user),
        allowFriendsFrom: this.parseAllowFriendsFrom(user),
        links: {
          youtube: user.youTube,
          twitter: user.twitter,
          twitch: user.twitch,
        },
        friendRequestState: this.parseFriendRequestState(user),
        commentHistoryState: this.parseCommentHistoryState(user),
        isNewFriendRequest: user.newFriendRequest!,
        count: {
          messages: user.messages!,
          friendRequests: user.friendRequests!,
          newFriends: user.newFriends!,
        },
      },
      age: user.age!,
      modLevel: "none",
    } satisfies User;
  }

  private parseAllowMessagesFrom(user: RawUser) {
    if (user.messageState === 0) {
      return "all";
    } else if (user.messageState === 1) {
      return "only friends";
    }
    return "none";
  }

  private parseAllowFriendsFrom(user: RawUser) {
    if (user.friendState === 0) {
      return "all";
    }
    return "none";
  }

  private parseFriendRequestState(user: RawUser) {
    if (user.friendState === 0) {
      return "none";
    } else if (user.friendState === 1) {
      return "friend";
    } else if (user.friendState === 2) {
      return "requested";
    } else if (user.friendState === 3) {
      return "received";
    }
    return "none";
  }

  private parseCommentHistoryState(user: RawUser) {
    if (user.commentHistoryState === 0) {
      return "all";
    } else if (user.commentHistoryState === 1) {
      return "only friends";
    }
    return "none";
  }

  private parseDemonBreakdown(user: RawUser) {
    const breakdown = user.demonsBreakdown?.split(",").map((s) => parseInt(s));
    return {
      easy: breakdown?.[0] ?? 0,
      medium: breakdown?.[1] ?? 0,
      hard: breakdown?.[2] ?? 0,
      insane: breakdown?.[3] ?? 0,
      extreme: breakdown?.[4] ?? 0,
      easyPlatformer: breakdown?.[5] ?? 0,
      mediumPlatformer: breakdown?.[6] ?? 0,
      hardPlatformer: breakdown?.[7] ?? 0,
      insanePlatformer: breakdown?.[8] ?? 0,
      extremePlatformer: breakdown?.[9] ?? 0,
      weekly: breakdown?.[10] ?? 0,
      gauntlet: breakdown?.[11] ?? 0,
    };
  }
}
