export interface RawLevel {
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

export interface RawSong {
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

export interface RawUser {
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
  twoPlayer: boolean;
  song?: BaseSong;
}

export interface PageInfo {
  total: number;
  offset: number;
  amount: number;
}

export interface LevelSearchResponse {
  result: Level[];
  pageInfo?: PageInfo;
  hash?: string;
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
