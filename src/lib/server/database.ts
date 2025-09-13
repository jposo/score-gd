import postgres from "postgres";
import type { Level, Song, User, Progress } from "$lib/db-types";

// interface LoggdDatabase {
//   getUsers();
// }

type LevelValues = Omit<Level, "id" | "created_at">;
type SongValues = Omit<Song, "id" | "created_at">;
type UserValues = Omit<
  User,
  "id" | "bio" | "profile_picture_url" | "created_at"
>;
type ProgressValues = Omit<Progress, "id" | "created_at" | "updated_at">;

export default class Database {
  static #instance: Database;
  private sql: postgres.Sql;

  private constructor() {
    this.sql = postgres({
      user: import.meta.env.VITE_PGUSER,
      password: import.meta.env.VITE_PGPASSWORD,
      database: import.meta.env.VITE_PGDATABASE,
      hostname: import.meta.env.VITE_PGHOST,
      port: parseInt(import.meta.env.VITE_PGPORT),
    });
  }

  public static get instance(): Database {
    if (!Database.#instance) {
      Database.#instance = new Database();
    }
    return Database.#instance;
  }

  // public async connect() {
  //   if (!this.client.connected) await this.client.connect();
  // }

  public async disconnect() {
    await this.sql?.end();
  }

  public async getLevels() {
    const levels = await this.sql`
      SELECT * FROM levels
    `;
    return levels;
  }

  public async getLevel(id: number) {
    const level = await this.sql`
      SELECT
       	l.*,
        CAST(AVG(p.enjoyment_rating) AS DECIMAL(10, 2)) AS average_rating,
       	CAST(COUNT(CASE WHEN p.status = 'Completed' THEN 1 END) AS INTEGER) AS completion_count,
       	CAST(COUNT(CASE WHEN p.review IS NOT NULL THEN 1 END) AS INTEGER) AS review_count
      FROM levels l
      LEFT JOIN progress p ON l.id = p.level_id
      WHERE l.geometry_dash_id = ${id}
      GROUP BY l.id;
    `;
    return (
      (level[0] as Level & {
        average_rating: number;
        completion_count: number;
        review_count: number;
      }) || null
    );
  }

  public async insertLevel(values: LevelValues) {
    console.log("Inserting level with values:", values);
    const result = await this.sql`
      INSERT INTO levels ${this.sql(values)}
      RETURNING id;
    `;
    return result[0].id;
  }

  public async getSong(id: number): Promise<Song | null> {
    const song = await this.sql`
      SELECT * FROM songs WHERE geometry_dash_id = ${id}
    `;
    return (song[0] as Song) || null;
  }

  public async insertSong(values: SongValues) {
    console.log("Inserting song with values:", values);
    const result = await this.sql`
      INSERT INTO songs (
        geometry_dash_id,
        title,
        artist
      ) VALUES (
        ${values.geometry_dash_id},
        ${values.title},
        ${values.artist}
      ) RETURNING id;
    `;
    return result[0].id;
  }

  async createUser(values: UserValues) {
    try {
      const [user] = await this.sql`
        INSERT INTO users (username, email, password_hash)
        VALUES (${values.username}, ${values.email}, ${values.password_hash})
        RETURNING id, username, email, bio, profile_picture_url, created_at
      `;
      return user as User;
    } catch (error) {
      console.error("Error creating user:", error);
      return null;
    }
  }

  async getUserByEmail(email: string) {
    try {
      const [user] = await this.sql`
        SELECT id, username, email, password_hash, bio, profile_picture_url, created_at
        FROM users
        WHERE email = ${email}
      `;
      return user as (User & { password_hash: string }) | null;
    } catch (error) {
      console.error("Error getting user by email:", error);
      return null;
    }
  }

  async getUserByUsername(username: string) {
    try {
      const [user] = await this.sql`
        SELECT id, username, email, password_hash, bio, profile_picture_url, created_at
        FROM users
        WHERE username = ${username}
      `;
      return user as (User & { password_hash: string }) | null;
    } catch (error) {
      console.error("Error getting user by username:", error);
      return null;
    }
  }

  async getUserById(id: number) {
    try {
      const [user] = await this.sql`
        SELECT id, username, email, bio, profile_picture_url, created_at
        FROM users
        WHERE id = ${id}
      `;
      return user as User | null;
    } catch (error) {
      console.error("Error getting user by id:", error);
      return null;
    }
  }

  async updateUser(
    id: number,
    updates: Partial<Pick<User, "bio" | "profile_picture_url">>,
  ) {
    try {
      const setClause = Object.entries(updates)
        .filter(([_, value]) => value !== undefined)
        .map(([key, _]) => `${key} = $${key}`)
        .join(", ");

      if (!setClause) return null;

      const [user] = await this.sql`
        UPDATE users
        SET ${this.sql(updates)}
        WHERE id = ${id}
        RETURNING id, username, email, bio, profile_picture_url, created_at
      `;
      return user as User | null;
    } catch (error) {
      console.error("Error updating user:", error);
      return null;
    }
  }

  async getUserProgress(userId: number, levelId: number) {
    try {
      const [progress] = await this.sql`
        SELECT *
        FROM progress
        WHERE user_id = ${userId} AND level_id = ${levelId}
      `;
      return progress as Progress;
    } catch (error) {
      console.error("Error getting user progress:", error);
      return null;
    }
  }

  // async updateUserProgress(
  //   userId: number,
  //   levelId: number,
  //   progress: ProgressValues,
  // ) {
  //   try {
  //     const [progress] = await this.sql`
  //       UPDATE INTO progress (user_id, level_id, status, rating)
  //       VALUES (${userId}, ${levelId}, ${status}, ${rating})
  //       ON CONFLICT (user_id, level_id)
  //       DO UPDATE SET status = ${status}, rating = ${rating}
  //       RETURNING *
  //     `;
  //     return progress as Progress | null;
  //   } catch (error) {
  //     console.error("Error updating user progress:", error);
  //     return null;
  //   }
  // }

  async updateUserProgress(values: ProgressValues) {
    console.log(values);
    try {
      const [progress] = await this.sql`
        INSERT INTO progress ${this.sql(values)}
        ON CONFLICT (user_id, level_id)
        DO UPDATE SET status = ${values.status}, enjoyment_rating = ${values.enjoyment_rating}
        RETURNING *
      `;
      return progress as Progress | null;
    } catch (error) {
      console.error("Error updating user progress:", error);
      return null;
    }
  }
}
