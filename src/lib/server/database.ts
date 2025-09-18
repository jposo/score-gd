import postgres from "postgres";
import type { Level, Song, User, Progress } from "$lib/db-types";
import type { ListItem } from "../shared/types";

// interface LoggdDatabase {
//   getUsers();
// }

type LevelValues = Omit<Level, "id" | "created_at">;
type SongValues = Omit<Song, "id" | "created_at">;
type UserValues = Omit<
  User,
  "id" | "bio" | "profile_picture_url" | "created_at"
>;
export type ProgressValues = Omit<Progress, "id" | "created_at" | "updated_at">;

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

  async getUserInfo(username: string) {
    try {
      const [user] = await this.sql`
        SELECT
          u.id,
          u.username,
          u.bio,
          u.profile_picture_url,
          u.created_at,
          CAST(SUM(CASE WHEN p.status = 'Completed' THEN 1 END) AS INTEGER) AS levels_completed,
          CAST(AVG(p.enjoyment_rating) AS FLOAT) AS average_rating,
          CAST(SUM(CASE WHEN p.review IS NOT NULL THEN 1 END) AS INTEGER) AS reviews_written,
          json_agg(
            json_build_object(
              'id', p.id,
           	  'geometry_dash_id', l.geometry_dash_id,
           	  'level_name', l.name,
           	  'placement', p.placement,
              'enjoyment_rating', p.enjoyment_rating,
              'attempts', p.total_attempts
            )
           	ORDER BY p.placement ASC
          ) FILTER (WHERE p.status = 'Completed') AS list,
          json_agg(
           	json_build_object(
              'geometry_dash_id', l.geometry_dash_id,
          		'status', p.status,
          		'enjoyment_rating', p.enjoyment_rating,
          		'level_name', l.name,
          		'review', p.review,
          		'created_at', p.created_at
           	)
            ORDER BY p.created_at DESC
          ) AS recent_activity
        FROM users u
        LEFT JOIN progress p ON u.id = p.user_id
        LEFT JOIN levels l ON l.id = p.level_id
        WHERE u.username = ${username}
        GROUP BY u.id
      `;
      return user as User & {
        levels_completed: number;
        average_rating: number;
        reviews_written: number;
        list: {
          id: number;
          geometry_dash_id: number;
          level_name: string;
          attempts: number;
          placement: number;
          enjoyment_rating: number;
        }[];
        recent_activity: {
          geometry_dash_id: number;
          status: string;
          enjoyment_rating: number;
          level_name: string;
          review: string;
          created_at: string;
        }[];
      };
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

  async getUserList(userId: number) {
    try {
      const list = await this.sql`
        SELECT p.id, p.placement, l.id as level_id, l.name
        FROM progress p
        JOIN levels l ON p.level_id = l.id
        WHERE user_id = ${userId}
        ORDER BY placement ASC, updated_at DESC
      `;
      return list as ListItem[];
    } catch (error) {
      console.error("Error getting user progresses:", error);
      return null;
    }
  }

  async updateListPlacement(progressId: number, placement: number) {
    try {
      await this.sql`
        UPDATE progress
        SET placement = ${placement}
        WHERE id = ${progressId}
      `;
    } catch (error) {
      console.error("Error updating list placement:", error);
      return null;
    }
  }

  async getReviews(level_id: number) {
    try {
      const reviews = await this.sql`
        SELECT p.status, p.enjoyment_rating, p.review, p.created_at, p.user_id, u.username, u.profile_picture_url, p.total_attempts
        FROM progress p
        JOIN users u ON p.user_id = u.id
        WHERE level_id = ${level_id}
          AND p.review IS NOT NULL
          AND p.status NOT IN ('In Progress', 'To Try')
        ORDER BY p.created_at DESC
        LIMIT 15
      `;
      return reviews as (Progress & {
        username: string;
        profile_picture_url: string;
      })[];
    } catch (error) {
      console.error("Error getting reviews:", error);
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

  private async createUserProgress(
    userId: number,
    levelId: number,
    status: string,
  ) {
    try {
      const [progress] = await this.sql`
        INSERT INTO progress (user_id, level_id, status)
        VALUES (${userId}, ${levelId}, ${status})
        RETURNING *
      `;
      return progress as Progress | null;
    } catch (error) {
      console.error("Error creating user progress:", error);
      return null;
    }
  }

  async updateUserProgress(values: ProgressValues) {
    // check if progress exists
    const [progress] = await this.sql`
      SELECT * FROM progress WHERE level_id = ${values.level_id} AND user_id = ${values.user_id}
    `;
    if (!progress) {
      await this.createUserProgress(
        values.user_id,
        values.level_id,
        values.status,
      );
    }
    try {
      const [progress] = await this.sql`
        UPDATE progress SET ${this.sql(values)}
        WHERE level_id = ${values.level_id} AND user_id = ${values.user_id}
        RETURNING *
      `;
      return progress as Progress | null;
    } catch (error) {
      console.error("Error updating user progress:", error);
      return null;
    }
  }

  async getRecentActivity(userId: number) {
    const activity = await this.sql`
      SELECT
        l.geometry_dash_id,
        p.status,
        p.enjoyment_rating,
        p.created_at,
        l.name,
        p.review
      FROM progress p
      JOIN levels l ON p.level_id = l.id
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 5
    `;
    return activity;
  }
}
