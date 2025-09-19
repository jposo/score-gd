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

  public async getLevels(page?: number) {
    const LIMIT = 18;
    const levels = await this.sql`
      SELECT *
      FROM levels
      ORDER BY id ASC
      LIMIT ${LIMIT} OFFSET ${page ? (page - 1) * LIMIT : 0}
    `;
    return levels as Level[];
  }

  public async getLevel(geometry_dash_id: number) {
    const [level] = await this.sql`
      SELECT
        l.id,
       	l.geometry_dash_id,
        l.name,
        l.publisher,
        l.publisher_id,
        l.description,
        l.difficulty,
        l.coins,
        l.two_player,
        l.rating,
        l.length,
        l.release_date,
        l.video_url,
        s.geometry_dash_id AS song_geometry_dash_id,
        s.title AS song_title,
        s.artist AS song_artist,
        CAST(COUNT(p.enjoyment_rating) AS INTEGER) AS progress_count,
        CAST(AVG(p.enjoyment_rating) AS FLOAT) AS average_rating,
       	CAST(COUNT(CASE WHEN p.status = 'Completed' THEN 1 END) AS INTEGER) AS completion_count,
       	CAST(COUNT(CASE WHEN p.review IS NOT NULL THEN 1 END) AS INTEGER) AS review_count,
        json_agg(
          json_build_object(
            'username', u.username,
            'status', p.status,
            'enjoyment_rating', p.enjoyment_rating,
            'review', p.review,
            'profile_picture_url', u.profile_picture_url,
            'total_attempts', p.total_attempts,
            'updated_at', p.updated_at
          )
          ORDER BY p.updated_at DESC
        ) FILTER (WHERE p.review IS NOT NULL
          AND p.status NOT IN ('In Progress', 'To Try')) AS reviews
      FROM levels l
      JOIN songs s ON l.song_id = s.id
      LEFT JOIN progress p ON l.id = p.level_id
      LEFT JOIN users u ON p.user_id = u.id
      WHERE l.geometry_dash_id = ${geometry_dash_id}
      GROUP BY l.id, s.geometry_dash_id, s.title, s.artist
      LIMIT 10;
    `;
    return (
      (level as Level & {
        song_geometry_dash_id: number;
        song_title: string;
        song_artist: string;
        progress_count: number;
        average_rating: number | null;
        completion_count: number;
        review_count: number;
        reviews: {
          username: string;
          status: string;
          enjoyment_rating: number;
          review: string;
          profile_picture_url: string;
          total_attempts: number;
          updated_at: string;
        }[];
      }) || null
    );
  }

  public async insertLevel(values: LevelValues) {
    console.log("Inserting level with values:", values);
    const [result] = await this.sql`
      INSERT INTO levels ${this.sql(values)}
      ON CONFLICT (geometry_dash_id) DO NOTHING
      RETURNING geometry_dash_id;
    `;
    return result as Level | null;
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

  async insertUser(values: UserValues) {
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
          u.role,
          u.created_at,
          CAST(COUNT(CASE WHEN p.status = 'Completed' THEN 1 END) AS INTEGER) AS levels_completed,
          CAST(AVG(p.enjoyment_rating) AS FLOAT) AS average_rating,
          CAST(COUNT(CASE WHEN p.review IS NOT NULL THEN 1 END) AS INTEGER) AS reviews_written,
          json_agg(
            json_build_object(
              'id', p.id,
           	  'geometry_dash_id', l.geometry_dash_id,
           	  'level_name', l.name,
              'publisher', l.publisher,
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
          ) FILTER (WHERE l.geometry_dash_id IS NOT NULL) AS recent_activity
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
          publisher: string;
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
      const [user] = await this.sql`
        UPDATE users
        SET ${this.sql(updates)}, updated_at = NOW()
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
      console.error(
        `Error getting user progress, params: userId=${userId}, levelId=${levelId}`,
        error,
      );
      return null;
    }
  }

  async updateListPlacement(progressId: number, placement: number) {
    try {
      const [result] = await this.sql`
        UPDATE progress
        SET placement = ${placement}
        WHERE id = ${progressId}
      `;
      return result;
    } catch (error) {
      console.error("Error updating list placement:", error);
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
        UPDATE progress SET ${this.sql(values)}, updated_at = NOW()
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
