import {
  pgTable,
  pgEnum,
  integer,
  smallint,
  serial,
  text,
  jsonb,
  timestamp,
  date,
  boolean,
  interval,
  primaryKey,
} from "drizzle-orm/pg-core";

// export const gdLevels = pgTable("gd_levels", {
//   id: integer("id").primaryKey(),
//   name: text("name"),
//   rating: text("rating"),
//   song: text("song"),
//   difficulty: text("difficulty"),
//   releaseYear: integer("release_year"),
//   publisher: text("publisher"),
// });

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

export const gdUsers = pgTable("gd_users", {
  id: integer("id").primaryKey(),
  accountId: integer("account_id"),
  username: text("username").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const difficultyEnum = pgEnum("difficulty", [
  "n/a",
  "auto",
  "easy",
  "normal",
  "hard",
  "harder",
  "insane",
  "demon",
  "easy demon",
  "medium demon",
  "hard demon",
  "insane demon",
  "extreme demon",
]);

export const lengthEnum = pgEnum("length", [
  "tiny",
  "short",
  "medium",
  "long",
  "xl",
  "platformer",
]);

export const ratingEnum = pgEnum("rating", [
  "no star",
  "star",
  "featured",
  "epic",
  "legendary",
  "mythic",
]);

export const songs = pgTable("songs", {
  id: integer("id").primaryKey(),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const levels = pgTable("levels", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  publisherId: integer("publisher_id")
    .notNull()
    .references(() => gdUsers.id),
  description: text("description"),
  difficulty: difficultyEnum("difficulty").notNull(),
  length: lengthEnum("length").notNull(),
  songId: integer("song_id")
    .notNull()
    .references(() => songs.id),
  releaseDate: date("release_date"),
  gameVersion: integer("game_version").notNull(),
  videoUrl: text("video_url"),
  coins: smallint("coins").notNull(),
  twoPlayer: boolean("is_two_player").notNull(),
  rating: ratingEnum("rating").notNull(),
  hidden: boolean("hidden").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastSyncedAt: timestamp("last_synced_at").defaultNow(),
});

export const levelCreators = pgTable(
  "level_creators",
  {
    levelId: integer("level_id")
      .notNull()
      .references(() => levels.id),
    creatorId: integer("creator_id")
      .notNull()
      .references(() => gdUsers.id),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.levelId, table.creatorId] }),
  }),
);

export const statusEnum = pgEnum("status", [
  "to try",
  "in progress",
  "completed",
  "dropped",
]);

export const progress = pgTable("progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  levelId: integer("level_id")
    .notNull()
    .references(() => levels.id),
  status: statusEnum("status"),
  rating: smallint("rating"),
  completionPercentage: smallint("completion_percentage"),
  completionTime: interval("completion_time"),
  attempts: integer("attempts"),
  startedAt: date("started_at"),
  completedAt: date("completed_at"),
  videoUrl: text("video_url"),
  review: text("review"),
  listPlacement: integer("list_placement"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const rolesEnum = pgEnum("role", ["owner", "admin", "user"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").references(() => gdUsers.id),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  bio: text("bio"),
  profilePicturePath: text("profile_picture_key"),
  extraRoles: rolesEnum("roles").array(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastLoginAt: timestamp("last_login_at").defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;

export type InsertProgress = typeof progress.$inferInsert;
export type SelectProgress = typeof progress.$inferSelect;

export type InsertLevel = typeof levels.$inferInsert;
export type SelectLevel = typeof levels.$inferSelect;

export type InsertLevelCreator = typeof levelCreators.$inferInsert;
export type SelectLevelCreator = typeof levelCreators.$inferSelect;

export type InsertSong = typeof songs.$inferInsert;
export type SelectSong = typeof songs.$inferSelect;

export type InsertGDUser = typeof gdUsers.$inferInsert;
export type SelectGDUser = typeof gdUsers.$inferSelect;

export type InsertDay = typeof days.$inferInsert;
export type SelectDay = typeof days.$inferSelect;

export type InsertSource = typeof sources.$inferInsert;
export type SelectSource = typeof sources.$inferSelect;
