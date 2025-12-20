import {
    Difficulty,
    DemonDifficulty,
    Length,
    Rating,
    type Song,
    type LevelSearchResult,
} from "./types.ts";

export class Parser {
    private static resolveDifficulty(
        denominator: string,
        numerator: string,
        demon: string,
        demonDifficulty: string,
    ) {
        if (demon === "1") {
            if (denominator === "0") {
                return Difficulty.NA;
            }
            if (demonDifficulty === "3") {
                return DemonDifficulty.EasyDemon;
            }
            if (demonDifficulty === "4") {
                return DemonDifficulty.MediumDemon;
            }
            if (demonDifficulty === "0") {
                return DemonDifficulty.HardDemon;
            }
            if (demonDifficulty === "5") {
                return DemonDifficulty.InsaneDemon;
            }
            if (demonDifficulty === "6") {
                return DemonDifficulty.ExtremeDemon;
            }
        }
        if (numerator === "10") {
            return Difficulty.Easy;
        }
        if (numerator === "20") {
            return Difficulty.Normal;
        }
        if (numerator === "30") {
            return Difficulty.Hard;
        }
        if (numerator === "40") {
            return Difficulty.Harder;
        }
        if (numerator === "50") {
            return Difficulty.Insane;
        }
        return Difficulty.NA;
    }

    private static resolveRating(featureScore: string, epic: string) {
        if (epic === "1") {
            return Rating.Epic;
        } else if (epic === "2") {
            return Rating.Legendary;
        } else if (epic === "3") {
            return Rating.Mythic;
        } else if (featureScore !== "0") {
            return Rating.Featured;
        }
        return Rating.Star;
    }

    private static resolveOfficalSong(id: number): Song | null {
        const songData: Record<number, { name: string; artist: string }> = {
            [-1]: { name: "Stereo Madness", artist: "Foreverbound" },
            [-2]: { name: "Back on Track", artist: "DJVI" },
            [-3]: { name: "Polargeist", artist: "Step" },
            [-4]: { name: "Dry Out", artist: "DJVI" },
            [-5]: { name: "Base after Base", artist: "DJVI" },
            [-6]: { name: "Cant Let Go", artist: "DJVI" },
            [-7]: { name: "Jumper", artist: "Waterflame" },
            [-8]: { name: "Time Machine", artist: "Waterflame" },
            [-9]: { name: "Cycles", artist: "DJVI" },
            [-10]: { name: "xStep", artist: "DJVI" },
            [-11]: { name: "Clutterfunk", artist: "Waterflame" },
            [-12]: { name: "Theory of Everything", artist: "DJ-Nate" },
            [-13]: { name: "Electroman Adventures", artist: "Waterflame" },
            [-14]: { name: "Clubstep", artist: "DJ-Nate" },
            [-15]: { name: "Electrodynamix", artist: "DJ-Nate" },
            [-16]: { name: "Hexagon Force", artist: "Waterflame" },
            [-17]: { name: "Blast Processing", artist: "Waterflame" },
            [-18]: { name: "Theory of Everything 2", artist: "DJ-Nate" },
            [-19]: { name: "Geometrical Dominator", artist: "Waterflame" },
            [-20]: { name: "Deadlocked", artist: "F-777" },
            [-21]: { name: "Fingerdash", artist: "MDK" },
            [-22]: { name: "Dash", artist: "MDK" },
            [-23]: { name: "Explorers", artist: "Hinkik" },
            // Meltdown Levels
            [-1001]: { name: "The Seven Seas", artist: "F-777" },
            [-1002]: { name: "Viking Arena", artist: "F-777" },
            [-1003]: { name: "Airborne Robots", artist: "F-777" },
            // World Levels / Secret
            [-3001]: { name: "Secret", artist: "RobTop" },
            [-2001]: { name: "Payload", artist: "Dex Arson" },
            [-2002]: { name: "Beast Mode", artist: "Dex Arson" },
            [-2003]: { name: "Machina", artist: "Dex Arson" },
            [-2004]: { name: "Years", artist: "Dex Arson" },
            [-2005]: { name: "Frontlines", artist: "Dex Arson" },
            [-2006]: { name: "Space Pirates", artist: "Waterflame" },
            [-2007]: { name: "Striker", artist: "Waterflame" },
            [-2008]: { name: "Embers", artist: "Dex Arson" },
            [-2009]: { name: "Round 1", artist: "Dex Arson" },
            [-2010]: { name: "Monster Dance Off", artist: "F-777" },
            // SubZero Levels
            [-4001]: { name: "Press Start", artist: "MDK" },
            [-4002]: { name: "Nock Em", artist: "Bossfight" },
            [-4003]: { name: "Power Trip", artist: "Boom Kitty" },
        };

        const song = songData[id];

        if (!song) return null;

        return {
            id,
            name: song.name,
            artist: {
                id,
                name: song.artist,
            },
        };
    }

    // Key-values seperated by :
    static parseLevelObject(raw: string) {
        const items = raw.split(":");

        const result = items.reduce(
            (acc, current, index, array) => {
                if (index % 2 === 0) {
                    acc[current] = array[index + 1];
                }
                return acc;
            },
            {} as Record<string, string>,
        );

        const difficulty = Parser.resolveDifficulty(
            result["8"],
            result["9"],
            result["17"],
            result["43"],
        );

        const rating = Parser.resolveRating(result["19"], result["42"]);

        return {
            id: parseInt(result["1"]),
            name: result["2"],
            description: Buffer.from(result["3"], "base64").toString("utf8"),
            version: parseInt(result["5"]),
            playerId: parseInt(result["6"]),
            difficulty,
            rating,
            songId:
                result["12"] == "0"
                    ? parseInt(result["35"])
                    : -parseInt(result["12"]),
        };
    }

    static parseLevelObjects(raw: string) {
        const levelObjects = raw.split("|");
        return levelObjects.map(Parser.parseLevelObject);
    }

    static parseCreator(raw: string) {
        const [id, username, accountId] = raw.split(":");
        return {
            id: parseInt(id),
            username,
            accountId: parseInt(accountId),
        };
    }

    static parseCreators(raw: string) {
        const creators = raw.split("|");
        return creators.map(Parser.parseCreator);
    }

    static parseSongObject(raw: string): Song {
        const items = raw.split("~|~");

        const result = items.reduce(
            (acc, current, index, array) => {
                if (index % 2 === 0) {
                    acc[current] = array[index + 1];
                }
                return acc;
            },
            {} as Record<string, string>,
        );

        return {
            id: parseInt(result["1"]),
            name: result["2"],
            artist: {
                id: parseInt(result["3"]),
                name: result["4"],
            },
        };
    }

    static parseSongObjects(raw: string): Song[] {
        const songObjects = raw.split("~:~");

        return songObjects.map(Parser.parseSongObject);
    }

    static parsePageInfo(raw: string) {
        const [total, offset, amount] = raw.split(":");
        return {
            total: parseInt(total),
            offset: parseInt(offset),
            amount: parseInt(amount),
        };
    }

    static parseLevelSearchRaw(raw: string) {
        const [levelObjects, creators, songObjects, pageInfo, hash] =
            raw.split("#");
        return {
            levels: Parser.parseLevelObjects(levelObjects),
            creators: Parser.parseCreators(creators),
            songs: Parser.parseSongObjects(songObjects),
            pageInfo: Parser.parsePageInfo(pageInfo),
            hash,
        };
    }

    static parseLevelSearch(raw: string): LevelSearchResult[] {
        const levelSearch = Parser.parseLevelSearchRaw(raw);

        return levelSearch.levels.map((level) => {
            const creator = levelSearch.creators.find(
                (creator) => creator.id === level.playerId,
            )!;
            let song =
                levelSearch.songs.find((song) => song.id === level.songId) ??
                null;
            if (!song && level.songId < 0) {
                song = Parser.resolveOfficalSong(level.songId);
            }
            return {
                id: level.id,
                name: level.name,
                description: level.description,
                version: level.version,
                creator,
                difficulty: level.difficulty,
                rating: level.rating,
                song,
            };
        });
    }
}
