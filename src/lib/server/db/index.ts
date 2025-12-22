import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { env } from "$env/dynamic/private";
import { sql, eq } from "drizzle-orm";

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
