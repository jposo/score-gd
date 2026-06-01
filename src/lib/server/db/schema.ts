import {
  pgTable,
  pgEnum,
  integer,
  smallint,
  serial,
  text,
  timestamp,
  date,
  boolean,
  interval,
  primaryKey,
  uniqueIndex,
  index,
  check,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { authUsers } from "drizzle-orm/supabase";

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

export const statusEnum = pgEnum("status", [
  "to try",
  "in progress",
  "completed",
  "dropped",
]);

export const rolesEnum = pgEnum("role", ["owner", "admin", "user"]);

export const sources = pgTable("sources", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  deletedAt: timestamp("deleted_at"),
}).enableRLS();

export const dailyLevel = pgTable(
  "days",
  {
    id: serial("id").primaryKey(),
    day: integer("day").notNull(),
    imagePaths: text("image_paths")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    levelId: integer("level_id").notNull(),
    sourceId: integer("source_id")
      .notNull()
      .references(() => sources.id),
    createdAt: timestamp("created_at").defaultNow(),
    createdBy: uuid("created_by").references(() => users.id),
    updatedAt: timestamp("updated_at").defaultNow(),
    updatedBy: uuid("updated_by").references(() => users.id),
    deletedAt: timestamp("deleted_at"),
    deletedBy: uuid("deleted_by").references(() => users.id),
  },
  (table) => [uniqueIndex("unique_day_index").on(table.day)],
).enableRLS();

export const levels = pgTable("levels", {
  id: integer("id").primaryKey(),
  releaseDate: date("release_date"),
  videoUrl: text("video_url"),
  hidden: boolean("hidden").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: uuid("updated_by").references(() => users.id),
}).enableRLS();

export const levelCreators = pgTable(
  "level_creators",
  {
    levelId: integer("level_id")
      .notNull()
      .references(() => levels.id),
    creatorId: integer("creator_id").notNull(),
  },
  (table) => [primaryKey({ columns: [table.levelId, table.creatorId] })],
).enableRLS();

export const progress = pgTable(
  "progress",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    levelId: integer("level_id").notNull(),
    status: statusEnum("status"),
    score: smallint("score"),
    completionPercentage: smallint("completion_percentage"),
    completionTime: interval("completion_time"),
    attempts: integer("attempts"),
    startedAt: date("started_at"),
    completedAt: date("completed_at"),
    videoUrl: text("video_url"),
    review: text("review"),
    hideReview: boolean("hide_review").notNull().default(false),
    helpfulVotes: integer("helpful_votes").notNull().default(0),
    unhelpfulVotes: integer("unhelpful_votes").notNull().default(0),
    listPlacement: integer("list_placement"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
    deletedAt: timestamp("deleted_at"),
    deletedBy: uuid("deleted_by").references(() => users.id),
  },
  (table) => [
    check("score_check", sql`${table.score} >= 1 AND ${table.score} <= 10`),
    check(
      "percentage_check",
      sql`${table.completionPercentage} >= 0 AND ${table.completionPercentage} <= 100`,
    ),
    uniqueIndex("user_level_index").on(table.userId, table.levelId),
    index("status_index").on(table.status),
    index("level_id_index").on(table.levelId),
    index("score_index").on(table.score),
    index("completed_at_index").on(table.completedAt),
  ],
).enableRLS();

export const reviewVotes = pgTable(
  "review_votes",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    progressId: integer("progress_id")
      .notNull()
      .references(() => progress.id),
    isHelpful: boolean("is_helpful"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.progressId] })],
).enableRLS();

export const users = pgTable("users", {
  id: uuid("id")
    .primaryKey()
    .references(() => authUsers.id, { onDelete: "cascade" }),
  accountId: integer("account_id"),
  username: text("username").unique(),
  email: text("email").notNull().unique(),
  bio: text("bio"),
  roles: rolesEnum("roles").array(),
  isActive: boolean("is_active").notNull().default(true),
  isShadowBanned: boolean("is_shadow_banned").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastLoginAt: timestamp("last_login_at").defaultNow(),
  deletedAt: timestamp("deleted_at"),
}).enableRLS();

export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;

export type InsertProgress = typeof progress.$inferInsert;
export type SelectProgress = typeof progress.$inferSelect;

export type InsertLevel = typeof levels.$inferInsert;
export type SelectLevel = typeof levels.$inferSelect;

export type InsertLevelCreator = typeof levelCreators.$inferInsert;
export type SelectLevelCreator = typeof levelCreators.$inferSelect;

export type InsertDay = typeof dailyLevel.$inferInsert;
export type SelectDay = typeof dailyLevel.$inferSelect;

export type InsertSource = typeof sources.$inferInsert;
export type SelectSource = typeof sources.$inferSelect;

export type InsertReviewVote = typeof reviewVotes.$inferInsert;
export type SelectReviewVote = typeof reviewVotes.$inferSelect;
