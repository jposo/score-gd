import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { env } from "$env/dynamic/private";
import { sql, eq, desc, and, or, ilike } from "drizzle-orm";

export default class Database {
  static #instance: Database;
  private db: ReturnType<typeof drizzle>;

  private constructor() {
    this.db = drizzle(client, { schema });
  }

  public static get instance(): Database {
    if (!Database.#instance) {
      Database.#instance = new Database();
    }
    return Database.#instance;
  }

  async search(query: string) {
    const queryId = parseInt(query);

    const result = await this.db
      .select({
        id: schema.levels.id,
        name: schema.levels.name,
        publisher: schema.gdUsers.username,
      })
      .from(schema.levels)
      .innerJoin(
        schema.gdUsers,
        eq(schema.levels.publisherId, schema.gdUsers.id),
      )
      .where(
        or(
          ilike(schema.levels.name, `%${query}%`),
          ilike(schema.gdUsers.username, `%${query}%`),
          eq(schema.levels.id, queryId),
        ),
      )
      .limit(10);

    return result;
  }

  async trendingLevels() {
    const LIMIT = 20;

    const result = await this.db
      .select({
        id: schema.levels.id,
        name: schema.levels.name,
        publisher: schema.gdUsers.username,
        difficulty: schema.levels.difficulty,
        releaseDate: schema.levels.releaseDate,
        length: schema.levels.length,
        averageRating: sql<number>`CAST(AVG(${schema.progress.rating}) AS FLOAT)`,
      })
      .from(schema.levels)
      .innerJoin(
        schema.gdUsers,
        eq(schema.levels.publisherId, schema.gdUsers.id),
      )
      .innerJoin(schema.progress, eq(schema.levels.id, schema.progress.levelId))
      .groupBy(
        schema.levels.id,
        schema.levels.name,
        schema.gdUsers.username,
        schema.levels.difficulty,
        schema.levels.releaseDate,
        schema.levels.length,
      )
      .orderBy(desc(sql`AVG(${schema.progress.rating})`))
      .limit(LIMIT);

    return result;
  }

  async levels(page: number = 0) {
    const LIMIT = 18;

    const offset = page * LIMIT;

    const levels = await this.db
      .select({
        id: schema.levels.id,
        name: schema.levels.name,
        publisher: schema.gdUsers.username,
        difficulty: schema.levels.difficulty,
        releaseDate: schema.levels.releaseDate,
        length: schema.levels.length,
        averageRating: sql<number>`CAST(AVG(${schema.progress.rating}) AS FLOAT)`,
      })
      .from(schema.levels)
      .innerJoin(
        schema.gdUsers,
        eq(schema.levels.publisherId, schema.gdUsers.id),
      )
      .innerJoin(schema.progress, eq(schema.levels.id, schema.progress.levelId))
      .groupBy(
        schema.levels.id,
        schema.levels.name,
        schema.gdUsers.username,
        schema.levels.difficulty,
        schema.levels.releaseDate,
        schema.levels.length,
      )
      .orderBy(desc(sql`AVG(${schema.progress.rating})`))
      .limit(LIMIT)
      .offset(offset);

    const [totalCount] = await this.db
      .select({ count: sql<number>`COUNT(${schema.levels.id})` })
      .from(schema.levels);

    const pageCount = levels.length;
    const isLastPage = offset + pageCount >= totalCount.count;

    return {
      levels,
      page,
      last: isLastPage,
    };
  }

  async level(id: number) {
    const result = await this.db
      .select({
        id: schema.levels.id,
        name: schema.levels.name,
        publisher: schema.gdUsers.username,
        description: schema.levels.description,
        difficulty: schema.levels.difficulty,
        coins: schema.levels.coins,
        twoPlayer: schema.levels.twoPlayer,
        rating: schema.levels.rating,
        length: schema.levels.length,
        releaseDate: schema.levels.releaseDate,
        videoUrl: schema.levels.videoUrl,
        songId: schema.songs.id,
        songTitle: schema.songs.title,
        songArtist: schema.songs.artist,
        progressCount: sql<number>`CAST(COUNT(${schema.progress.review}) AS INTEGER)`,
        averageRating: sql<
          number | null
        >`CAST(AVG(${schema.progress.review}) AS FLOAT)`,
        completionCount: sql<number>`CAST(COUNT(CASE WHEN ${schema.progress.status} = 'completed' THEN 1 END) AS INTEGER)`,
        reviewCount: sql<number>`CAST(COUNT(CASE WHEN ${schema.progress.review} IS NOT NULL THEN 1 END) AS INTEGER)`,
        reviews: sql`json_agg(
              json_build_object(
                'username', ${schema.users.username},
                'status', ${schema.progress.status},
                'enjoymentRating', ${schema.progress.review},
                'review', ${schema.progress.review},
                'profilePicturePath', ${schema.users.profilePicturePath},
                'attempts', ${schema.progress.attempts},
                'updatedAt', ${schema.progress.updatedAt}
              )
              ORDER BY ${schema.progress.updatedAt} DESC
            ) FILTER (WHERE ${schema.progress.review} IS NOT NULL
              AND ${schema.progress.status} NOT IN ('in progress', 'to try'))`,
      })
      .from(schema.levels)
      .innerJoin(
        schema.gdUsers,
        eq(schema.gdUsers.id, schema.levels.publisherId),
      )
      .leftJoin(schema.songs, eq(schema.levels.songId, schema.songs.id))
      .leftJoin(schema.progress, eq(schema.levels.id, schema.progress.levelId))
      .leftJoin(schema.users, eq(schema.progress.userId, schema.users.id))
      .where(eq(schema.levels.id, id))
      .groupBy(
        schema.levels.id,
        schema.gdUsers.id,
        schema.songs.id,
        schema.songs.title,
        schema.songs.artist,
      )
      .limit(1);

    return result[0] || null;
  }

  async insertLevel(values: schema.InsertLevel) {
    console.log("Inserting level with values:", values);

    const result = await this.db
      .insert(schema.levels)
      .values(values)
      .onConflictDoNothing()
      .returning({ id: schema.levels.id });

    return result[0] || null;
  }

  async updateLevel(
    id: number,
    updates: Pick<
      schema.SelectLevel,
      "releaseDate" | "difficulty" | "videoUrl" | "description"
    >,
  ) {
    const result = await this.db
      .update(schema.levels)
      .set(updates)
      .where(eq(schema.levels.id, id))
      .returning({ id: schema.levels.id });

    return result[0] || null;
  }

  async song(id: number) {
    const result = await this.db
      .select()
      .from(schema.songs)
      .where(eq(schema.songs.id, id))
      .limit(1);

    return result[0] || null;
  }

  async insertSong(values: schema.InsertSong) {
    console.log("Inserting song with values:", values);

    const result = await this.db
      .insert(schema.songs)
      .values(values)
      .onConflictDoNothing()
      .returning({ id: schema.songs.id });

    return result[0] || null;
  }

  async userByEmail(email: string) {
    const user = await this.db
      .select({
        id: schema.users.id,
        username: schema.users.username,
        email: schema.users.email,
        passwordHash: schema.users.passwordHash,
        profilePicturePath: schema.users.profilePicturePath,
        createdAt: schema.users.createdAt,
      })
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);

    return user[0] || null;
  }

  async userByUsername(username: string) {
    const user = await this.db
      .select({
        id: schema.users.id,
        username: schema.users.username,
        email: schema.users.email,
        passwordHash: schema.users.passwordHash,
        profilePicturePath: schema.users.profilePicturePath,
        createdAt: schema.users.createdAt,
      })
      .from(schema.users)
      .where(eq(schema.users.username, username))
      .limit(1);

    return user[0] || null;
  }

  async userInfo(username: string) {
    const user = await this.db
      .select({
        id: schema.users.id,
        username: schema.users.username,
        bio: schema.users.bio,
        profile_picture_url: schema.users.profilePicturePath,
        roles: schema.users.extraRoles,
        created_at: schema.users.createdAt,
        levels_completed: sql<number>`CAST(COUNT(CASE WHEN ${schema.progress.status} = 'completed' THEN 1 END) AS INTEGER)`,
        average_rating: sql<
          number | null
        >`CAST(AVG(${schema.progress.review}) AS FLOAT)`,
        reviews_written: sql<number>`CAST(COUNT(CASE WHEN ${schema.progress.review} IS NOT NULL THEN 1 END) AS INTEGER)`,
        list: sql`json_agg(
                json_build_object(
                  'id', ${schema.progress.id},
                  'levelId', ${schema.levels.id},
                  'levelName', ${schema.levels.name},
                  'publisher', ${schema.gdUsers.username},
                  'placement', ${schema.progress.listPlacement},
                  'rating', ${schema.progress.rating},
                  'attempts', ${schema.progress.attempts}
                )
                ORDER BY ${schema.progress.listPlacement} ASC
              ) FILTER (WHERE ${schema.progress.status} = 'completed')`,
        recent_activity: sql`json_agg(
                json_build_object(
                  'level_id', ${schema.levels.id},
                  'status', ${schema.progress.status},
                  'rating', ${schema.progress.rating},
                  'levelName', ${schema.levels.name},
                  'review', ${schema.progress.review},
                  'createdAt', ${schema.progress.createdAt}
                )
                ORDER BY ${schema.progress.createdAt} DESC
              ) FILTER (WHERE ${schema.levels.id} IS NOT NULL)`,
      })
      .from(schema.users)
      .leftJoin(schema.progress, eq(schema.users.id, schema.progress.userId))
      .leftJoin(schema.levels, eq(schema.levels.id, schema.progress.levelId))
      .leftJoin(
        schema.gdUsers,
        eq(schema.gdUsers.id, schema.levels.publisherId),
      )
      .where(eq(schema.users.username, username))
      .groupBy(schema.users.id);

    return user[0] || null;
  }

  async insertUser(values: schema.InsertUser) {
    const user = await this.db.insert(schema.users).values(values).returning({
      id: schema.users.id,
      username: schema.users.username,
      email: schema.users.email,
      createdAt: schema.users.createdAt,
    });

    return user[0];
  }

  async updateUser(
    id: number,
    updates: Partial<Pick<schema.SelectUser, "bio" | "profilePicturePath">>,
  ) {
    const user = await this.db
      .update(schema.users)
      .set({
        ...updates,
      })
      .where(eq(schema.users.id, id))
      .returning({
        id: schema.users.id,
        username: schema.users.username,
        email: schema.users.email,
        bio: schema.users.bio,
        profilePicturePath: schema.users.profilePicturePath,
        createdAt: schema.users.createdAt,
      });

    return user[0] || null;
  }

  async userProgress(userId: number, levelId: number) {
    const progress = await this.db
      .select()
      .from(schema.progress)
      .where(
        and(
          eq(schema.progress.userId, userId),
          eq(schema.progress.levelId, levelId),
        ),
      )
      .limit(1);

    return progress[0] || null;
  }

  async insertUserProgress(userId: number, levelId: number) {
    const progress = await this.db
      .insert(schema.progress)
      .values({
        userId,
        levelId,
      })
      .returning();

    return progress || null;
  }

  async updateUserProgress(values: schema.InsertProgress) {
    const progress = await this.db
      .update(schema.progress)
      .set({
        ...values,
      })
      .where(
        and(
          eq(schema.progress.levelId, values.levelId),
          eq(schema.progress.userId, values.userId),
        ),
      );

    return progress || null;
  }

  async updateListPlacement(progressId: number, placement: number) {
    const result = await this.db
      .update(schema.progress)
      .set({ listPlacement: placement })
      .where(eq(schema.progress.id, progressId))
      .returning();

    return result[0] || null;
  }

  async insertGDUser(values: schema.InsertGDUser) {
    const user = await this.db
      .insert(schema.gdUsers)
      .values(values)
      .onConflictDoNothing()
      .returning({ id: schema.gdUsers.id });

    return user[0] || null;
  }
}

if (!env.DATABASE_URL) throw new Error("DATABASE_URL is not set");

const client = postgres(env.DATABASE_URL);

export const db = drizzle(client, { schema });

export async function searchLevels(searchQuery: string) {
  return await db
    .select({
      id: schema.levels.id,
      name: schema.levels.name,
      publisher: schema.gdUsers.username,
    })
    .from(schema.levels)
    .innerJoin(schema.gdUsers, eq(schema.levels.publisherId, schema.gdUsers.id))
    .where(sql`name ILIKE ${`%${searchQuery}%`}`);
}

export async function fetchAllLevels() {
  return await db
    .select({
      id: schema.levels.id,
      name: schema.levels.name,
      publisher: schema.users.username,
      day: schema.days.day,
    })
    .from(schema.levels)
    .innerJoin(schema.gdUsers, eq(schema.levels.publisherId, schema.gdUsers.id))
    .leftJoin(schema.days, eq(schema.levels.id, schema.days.levelId));
}

export async function fetchDayLevels() {
  return await db
    .select({
      id: schema.levels.id,
      name: schema.levels.name,
      publisher: schema.gdUsers.username,
      day: schema.days.day,
    })
    .from(schema.levels)
    .innerJoin(schema.gdUsers, eq(schema.levels.publisherId, schema.gdUsers.id))
    .innerJoin(schema.days, eq(schema.levels.id, schema.days.levelId));
}

export async function fetchLatestDay() {
  return (
    await db
      .select({
        day: schema.days.day,
      })
      .from(schema.days)
      .orderBy(sql`day DESC`)
      .limit(1)
  )[0].day;
}

export async function fetchDay(day: number) {
  return (
    await db
      .select({
        day: schema.days.day,
        images: schema.days.images,
      })
      .from(schema.days)
      .where(sql`day=${day}`)
      .limit(1)
  )[0] as { day: number; images: { url: string; index: number }[] };
}

export async function fetchVault(currentDay: number) {
  return await db
    .select({
      day: schema.days.day,
    })
    .from(schema.days)
    .where(sql`day <= ${currentDay}`)
    .orderBy(sql`day ASC`);
}

export async function validateGuess(day: number) {
  return (
    await db
      .select({
        id: schema.levels.id,
        day: schema.days.day,
        name: schema.levels.name,
        rating: schema.levels.rating,
        difficulty: schema.levels.difficulty,
        songTitle: schema.songs.title,
        songArtist: schema.songs.artist,
        releaseYear: schema.levels.releaseDate,
        publisher: schema.users.username,
      })
      .from(schema.days)
      .innerJoin(schema.levels, eq(schema.days.levelId, schema.levels.id))
      .innerJoin(schema.users, eq(schema.levels.publisherId, schema.users.id))
      .innerJoin(schema.songs, eq(schema.levels.songId, schema.songs.id))
      .where(sql`day = ${day}`)
      .limit(1)
  )[0];
}

export async function fetchLevel(id: number) {
  return (
    await db
      .select({
        id: schema.levels.id,
        name: schema.levels.name,
        rating: schema.levels.rating,
        difficulty: schema.levels.difficulty,
        songTitle: schema.songs.title,
        songArtist: schema.songs.artist,
        releaseYear: schema.levels.releaseDate,
        publisher: schema.users.username,
      })
      .from(schema.levels)
      .leftJoin(schema.users, eq(schema.levels.publisherId, schema.users.id))
      .leftJoin(schema.songs, eq(schema.levels.songId, schema.songs.id))
      .where(sql`id = ${id}`)
      .limit(1)
  )[0];
}

export async function fetchLevelByName(name: string) {
  return (
    await db
      .select({
        id: schema.levels.id,
        name: schema.levels.name,
        rating: schema.levels.rating,
        difficulty: schema.levels.difficulty,
        songTitle: schema.songs.title,
        songArtist: schema.songs.artist,
        releaseYear: schema.levels.releaseDate,
        publisher: schema.users.username,
      })
      .from(schema.levels)
      .leftJoin(schema.users, eq(schema.levels.publisherId, schema.users.id))
      .leftJoin(schema.songs, eq(schema.levels.songId, schema.songs.id))
      .where(sql`name = ${name}`)
      .limit(1)
  )[0];
}

export async function insertDay(
  day: number,
  levelId: number,
  images: { url: string; index: number }[],
  sourceId: number,
) {
  await db.insert(schema.days).values({
    day,
    levelId,
    images,
    sourceId,
  });
}

export async function fetchSources() {
  return await db
    .select({
      id: schema.sources.id,
      name: schema.sources.name,
      url: schema.sources.url,
    })
    .from(schema.sources);
}

// export async function updateId(
//   name: string,
//   rating: string,
//   difficulty: string,
//   newId: number,
// ) {
//   console.log("Updating ID:", name, rating, difficulty, newId);
//   return await db
//     .update(schema.levels)
//     .set({ id: newId })
//     .where(sql`name = ${name.trim()}`)
//     .returning({ id: schema.levels.id });
// }

// export async function updateIds(
//     values: {
//         name: string;
//         rating: string;
//         difficulty: string;
//         newId: number;
//     }[],
// ) {
//     console.log("Updating IDs:", name, rating, difficulty, newId, newIds);
//     return await db
//         .update(schema.levels)
//         .set({ id: newId })
//         .where(
//             sql`name = ${name} AND rating = ${rating} AND difficulty = ${difficulty}`,
//         )
//         .returning({ id: schema.levels.id });
// }

export async function insertLevel(values: schema.InsertLevel) {
  await db.insert(schema.levels).values(values);
}
