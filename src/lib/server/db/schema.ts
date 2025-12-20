import { pgTable, integer, serial, text, jsonb } from "drizzle-orm/pg-core";

export const levels = pgTable("gd_levels", {
  id: integer("id").primaryKey(),
  name: text("name"),
  rating: text("rating"),
  song: text("song"),
  difficulty: text("difficulty"),
  releaseYear: integer("release_year"),
  publisher: text("publisher"),
});

export const sources = pgTable("sources", {
  id: serial("id").primaryKey(),
  name: text("name"),
  url: text("url"),
});

export const days = pgTable("days", {
  id: serial("id").primaryKey(),
  day: integer("day").notNull(),
  images: jsonb("images").notNull(),
  levelId: integer("level_id")
    .notNull()
    .references(() => levels.id),
  sourceId: integer("source_id")
    .notNull()
    .references(() => sources.id),
});
