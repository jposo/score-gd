import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { env } from "$env/dynamic/private";
import {
    sql,
    eq,
    desc,
    and,
    or,
    asc,
    lte,
    avg,
    count,
    max,
    inArray,
    isNotNull,
} from "drizzle-orm";

type Review = {
    id: number;
    username: string;
    status: string;
    review: string | null;
    score: number;
    profilePicturePath: string;
    attempts: number;
    updatedAt: Date;
};

type Activity = {
    levelId: number;
    status: string;
    score: number;
    // levelName: string;
    completionPercentage: number;
    review: string | null;
    createdAt: Date;
};

type List = {
    id: number;
    levelId: number;
    // levelName: string;
    // publisher: string;
    placement: string | null;
    score: number;
    attempts: number;
    startedAt: Date | null;
    completedAt: Date | null;
    videoUrl: string | null;
}[];

class Database {
    static #instance: Database;
    private db: ReturnType<typeof drizzle>;

    private arraysEqual(a: number[], b: number[]) {
        if (a.length !== b.length) {
            return false;
        }

        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) {
                return false;
            }
        }

        return true;
    }

    private hasSameMembers(a: number[], b: number[]) {
        if (a.length !== b.length) {
            return false;
        }

        const setA = new Set(a);
        if (setA.size !== b.length) {
            return false;
        }

        for (const value of b) {
            if (!setA.has(value)) {
                return false;
            }
        }

        return true;
    }

    private detectSingleMovedId(previous: number[], next: number[]) {
        if (previous.length !== next.length) {
            return null;
        }

        if (this.arraysEqual(previous, next)) {
            return null;
        }

        for (const candidate of previous) {
            const previousWithout = previous.filter((id) => id !== candidate);
            const nextWithout = next.filter((id) => id !== candidate);
            if (this.arraysEqual(previousWithout, nextWithout)) {
                return candidate;
            }
        }

        return null;
    }

    private constructor() {
        const client = postgres(env.DATABASE_URL);
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
            })
            .from(schema.levels)
            .where(or(eq(schema.levels.id, queryId)))
            .limit(10);

        return result;
    }

    async findTopRatedLevels() {
        const LIMIT = 20;

        const result = await this.db
            .select({
                id: schema.progress.levelId,
                averageScore: avg(schema.progress.score).mapWith(Number),
            })
            .from(schema.progress)
            .where(isNotNull(schema.progress.score))
            .groupBy(schema.progress.levelId)
            .orderBy(desc(avg(schema.progress.score)))
            .limit(LIMIT);

        return result;
    }

    async findLevelByIdSimple(id: number) {
        const result = await this.db
            .select({
                id: schema.levels.id,
                releaseDate: schema.levels.releaseDate,
                videoUrl: schema.levels.videoUrl,
            })
            .from(schema.levels)
            .where(eq(schema.levels.id, id))
            .limit(1);

        return result[0] || null;
    }

    async findLevelById(id: number) {
        const result = await this.db
            .select({
                id: schema.levels.id,
                releaseDate: schema.levels.releaseDate,
                videoUrl: schema.levels.videoUrl,
                progressCount: count(schema.progress.score),
                averageScore: avg(schema.progress.score).mapWith(Number),
                completionCount: count(
                    sql`CASE WHEN ${schema.progress.status} = 'completed' THEN 1 END`,
                ),
                reviewCount: count(
                    sql`CASE WHEN ${schema.progress.review} IS NOT NULL THEN 1 END`,
                ),
                reviews: sql<Review[]>`json_agg(
              json_build_object(
                'username', ${schema.users.username},
                'status', ${schema.progress.status},
                'score', ${schema.progress.score},
                'review', ${schema.progress.review},
                'attempts', ${schema.progress.attempts},
                'updatedAt', ${schema.progress.updatedAt}
              )
              ORDER BY ${schema.progress.updatedAt} DESC
            ) FILTER (WHERE ${schema.progress.review} IS NOT NULL
              AND ${schema.progress.status} NOT IN ('in progress', 'to try'))`,
            })
            .from(schema.levels)
            .leftJoin(
                schema.progress,
                eq(schema.levels.id, schema.progress.levelId),
            )
            .leftJoin(schema.users, eq(schema.progress.userId, schema.users.id))
            .where(eq(schema.levels.id, id))
            .groupBy(schema.levels.id)
            .limit(1);

        if (result[0]) {
            return result[0];
        }
        return null;
        // return result[0] || null;
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

    async insertLevels(values: schema.InsertLevel[]) {
        console.log("Inserting levels with values:", values);

        const result = await this.db
            .insert(schema.levels)
            .values(values)
            .onConflictDoNothing()
            .returning({ id: schema.levels.id });

        return result;
    }

    async updateLevel(updates: schema.InsertLevel) {
        const result = await this.db
            .update(schema.levels)
            .set(updates)
            .where(eq(schema.levels.id, updates.id))
            .returning({ id: schema.levels.id });

        return result[0] || null;
    }

    async findUserByEmail(email: string) {
        const result = await this.db
            .select({
                id: schema.users.id,
                username: schema.users.username,
                email: schema.users.email,
                roles: schema.users.roles,
                createdAt: schema.users.createdAt,
            })
            .from(schema.users)
            .where(eq(schema.users.email, email))
            .limit(1);

        return result.length === 1 ? result[0] : null;
    }

    async findUserById(id: string) {
        const result = await this.db
            .select({
                id: schema.users.id,
                username: schema.users.username,
                email: schema.users.email,
                roles: schema.users.roles,
                createdAt: schema.users.createdAt,
            })
            .from(schema.users)
            .where(eq(schema.users.id, id))
            .limit(1);

        return result.length === 1 ? result[0] : null;
    }

    async findUserByUsername(username: string) {
        const result = await this.db
            .select({
                id: schema.users.id,
                username: schema.users.username,
                email: schema.users.email,
                roles: schema.users.roles,
                createdAt: schema.users.createdAt,
            })
            .from(schema.users)
            .where(eq(schema.users.username, username))
            .limit(1);

        return result.length === 1 ? result[0] : null;
    }

    async findUserInfoByUsername(username: string) {
        const user = await this.db
            .select({
                id: schema.users.id,
                username: schema.users.username,
                bio: schema.users.bio,
                roles: schema.users.roles,
                createdAt: schema.users.createdAt,
                levelsCompleted: count(
                    sql`CASE WHEN ${schema.progress.status} = 'completed' THEN 1 END`,
                ),
                averageScore: avg(schema.progress.score).mapWith(Number),
                reviewsWritten: count(
                    sql`CASE WHEN ${schema.progress.review} IS NOT NULL THEN 1 END`,
                ),
                list: sql<List>`coalesce(json_agg(
                json_build_object(
                  'id', ${schema.progress.levelId},
                  'placement', ${schema.progress.listPlacement},
                  'score', ${schema.progress.score},
                  'attempts', ${schema.progress.attempts},
                  'startedAt', ${schema.progress.startedAt},
                  'completedAt', ${schema.progress.completedAt},
                  'videoUrl', ${schema.progress.videoUrl}
                )
                ORDER BY ${schema.progress.listPlacement} ASC
                            ) FILTER (
                                WHERE ${schema.progress.status} = 'completed'
                                AND ${schema.progress.listPlacement} IS NOT NULL
                            ), '[]')`,
                inactiveList: sql<List>`coalesce(json_agg(
                                json_build_object(
                                    'id', ${schema.progress.levelId},
                                    'placement', ${schema.progress.listPlacement},
                                    'score', ${schema.progress.score},
                                    'attempts', ${schema.progress.attempts},
                                    'startedAt', ${schema.progress.startedAt},
                                    'completedAt', ${schema.progress.completedAt},
                                    'videoUrl', ${schema.progress.videoUrl}
                                )
                                ORDER BY ${schema.progress.updatedAt} DESC
                            ) FILTER (
                                WHERE ${schema.progress.status} = 'completed'
                                AND ${schema.progress.listPlacement} IS NULL
                            ), '[]')`,
                recentActivity: sql<Activity[]>`(
          SELECT coalesce(json_agg(act), '[]')
          FROM (
              SELECT json_build_object(
                  'levelId', ${schema.progress.levelId},
                  'status', ${schema.progress.status},
                  'completionPercentage', ${schema.progress.completionPercentage},
                  'score', ${schema.progress.score},
                  'review', ${schema.progress.review},
                  'createdAt', ${schema.progress.createdAt}
              ) AS act
              FROM ${schema.progress}
              WHERE ${schema.progress.userId} = ${schema.users.id}
                  AND ${schema.progress.levelId} IS NOT NULL
              ORDER BY ${schema.progress.updatedAt} DESC
              LIMIT 10
          ) sub
        )`,
            })
            .from(schema.users)
            .leftJoin(
                schema.progress,
                eq(schema.users.id, schema.progress.userId),
            )
            .where(eq(schema.users.username, username))
            .groupBy(schema.users.id);

        return user.length ? user[0] : null;
    }

    async insertUser(values: schema.InsertUser) {
        const user = await this.db
            .insert(schema.users)
            .values(values)
            .returning({
                id: schema.users.id,
                username: schema.users.username,
                email: schema.users.email,
                roles: schema.users.roles,
                createdAt: schema.users.createdAt,
            });

        return user.length ? user[0] : null;
    }

    async updateUser(id: string, updates: Partial<schema.InsertUser>) {
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
                createdAt: schema.users.createdAt,
            });

        return user[0] || null;
    }

    async findUserProgressByLevelId(userId: string, levelId: number) {
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

    async accrueProgressByLevelId(levelId: number) {
        const result = await this.db
            .select({
                progressCount: count(schema.progress.score),
                averageScore: avg(schema.progress.score).mapWith(Number),
                completionCount: count(
                    sql`CASE WHEN ${schema.progress.status} = 'completed' THEN 1 END`,
                ),
                reviewCount: count(
                    sql`CASE WHEN ${schema.progress.review} IS NOT NULL THEN 1 END`,
                ),
                reviews: sql<Review[]>`json_agg(
          json_build_object(
            'id', ${schema.progress.id},
            'username', ${schema.users.username},
            'status', ${schema.progress.status},
            'score', ${schema.progress.score},
            'review', ${schema.progress.review},
            'attempts', ${schema.progress.attempts},
            'updatedAt', ${schema.progress.updatedAt}
          )
            ORDER BY ${schema.progress.updatedAt} DESC
          ) FILTER (WHERE ${schema.progress.review} IS NOT NULL
            AND ${schema.progress.status} NOT IN ('in progress', 'to try'))`,
            })
            .from(schema.progress)
            .innerJoin(
                schema.users,
                eq(schema.progress.userId, schema.users.id),
            )
            .where(eq(schema.progress.levelId, levelId));

        return result || null;
    }

    async accrueProgressByLevelIds(levelIds: number[]) {
        if (levelIds.length === 0) return [];

        const result = await this.db
            .select({
                levelId: schema.progress.levelId,
                progressCount: count(schema.progress.score),
                averageScore: avg(schema.progress.score).mapWith(Number),
                completionCount: count(
                    sql`CASE WHEN ${schema.progress.status} = 'completed' THEN 1 END`,
                ),
                reviewCount: count(
                    sql`CASE WHEN ${schema.progress.review} IS NOT NULL THEN 1 END`,
                ),
                reviews: sql<Review[]>`json_agg(
          json_build_object(
            'username', ${schema.users.username},
            'status', ${schema.progress.status},
            'score', ${schema.progress.score},
            'review', ${schema.progress.review},
            'attempts', ${schema.progress.attempts},
            'updatedAt', ${schema.progress.updatedAt}
          )
            ORDER BY ${schema.progress.updatedAt} DESC
          ) FILTER (WHERE ${schema.progress.review} IS NOT NULL
            AND ${schema.progress.status} NOT IN ('in progress', 'to try'))`,
            })
            .from(schema.progress)
            .innerJoin(
                schema.users,
                eq(schema.progress.userId, schema.users.id),
            )
            .where(inArray(schema.progress.levelId, levelIds))
            .groupBy(schema.progress.levelId);

        return result;
    }

    async insertUserProgress(userId: string, levelId: number) {
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
            )
            .returning();

        return progress || null;
    }

    async upsertUserProgress(values: schema.InsertProgress) {
        const progress = await this.db
            .insert(schema.progress)
            .values(values)
            .onConflictDoUpdate({
                target: [schema.progress.userId, schema.progress.levelId],
                set: {
                    ...values,
                },
            })
            .returning();

        return progress[0] || null;
    }

    async countActiveCompleted(userId: string) {
        const result = await this.db
            .select({
                count: count(),
            })
            .from(schema.progress)
            .where(
                sql`${schema.progress.userId} = ${userId}
                    AND ${schema.progress.status} = 'completed'
                    AND ${schema.progress.listPlacement} IS NOT NULL`,
            );

        return result[0]?.count ?? 0;
    }

    async findNextActiveListPlacement(userId: string) {
        const result = await this.db
            .select({
                maxPlacement: sql<number>`coalesce(max(${schema.progress.listPlacement}::numeric), 0)::float8`,
            })
            .from(schema.progress)
            .where(
                sql`${schema.progress.userId} = ${userId}
                    AND ${schema.progress.status} = 'completed'
                    AND ${schema.progress.listPlacement} IS NOT NULL`,
            );

        return (result[0]?.maxPlacement ?? 0) + 1000;
    }

    async moveActiveListItemFractional(
        userId: string,
        movedLevelId: number,
        previousLevelId: number | null,
        nextLevelId: number | null,
    ) {
        return this.db.transaction(async (tx) => {
            const moved = await tx
                .select({
                    levelId: schema.progress.levelId,
                    status: schema.progress.status,
                    listPlacement: sql<number>`${schema.progress.listPlacement}::float8`,
                })
                .from(schema.progress)
                .where(
                    and(
                        eq(schema.progress.userId, userId),
                        eq(schema.progress.levelId, movedLevelId),
                    ),
                )
                .limit(1);

            if (!moved.length || moved[0].status !== "completed") {
                return null;
            }

            let leftPlacement: number | null = null;
            let rightPlacement: number | null = null;

            if (previousLevelId !== null) {
                const previous = await tx
                    .select({
                        listPlacement:
                            sql<number>`${schema.progress.listPlacement}::float8`,
                    })
                    .from(schema.progress)
                    .where(
                        sql`${schema.progress.userId} = ${userId}
                            AND ${schema.progress.levelId} = ${previousLevelId}
                            AND ${schema.progress.status} = 'completed'
                            AND ${schema.progress.listPlacement} IS NOT NULL`,
                    )
                    .limit(1);

                if (!previous.length) {
                    return null;
                }

                leftPlacement = previous[0].listPlacement;
            }

            if (nextLevelId !== null) {
                const next = await tx
                    .select({
                        listPlacement:
                            sql<number>`${schema.progress.listPlacement}::float8`,
                    })
                    .from(schema.progress)
                    .where(
                        sql`${schema.progress.userId} = ${userId}
                            AND ${schema.progress.levelId} = ${nextLevelId}
                            AND ${schema.progress.status} = 'completed'
                            AND ${schema.progress.listPlacement} IS NOT NULL`,
                    )
                    .limit(1);

                if (!next.length) {
                    return null;
                }

                rightPlacement = next[0].listPlacement;
            }

            let nextPlacement = moved[0].listPlacement ?? 1000;

            if (leftPlacement === null && rightPlacement === null) {
                nextPlacement = 1000;
            } else if (leftPlacement === null && rightPlacement !== null) {
                nextPlacement = rightPlacement - 1000;
            } else if (leftPlacement !== null && rightPlacement === null) {
                nextPlacement = leftPlacement + 1000;
            } else if (leftPlacement !== null && rightPlacement !== null) {
                if (leftPlacement >= rightPlacement) {
                    return null;
                }
                nextPlacement = (leftPlacement + rightPlacement) / 2;
            }

            const result = await tx
                .update(schema.progress)
                .set({
                    listPlacement: nextPlacement.toString(),
                })
                .where(
                    and(
                        eq(schema.progress.levelId, movedLevelId),
                        eq(schema.progress.userId, userId),
                    ),
                )
                .returning();

            return result[0] || null;
        });
    }

    async syncCompletedListMembership(
        userId: string,
        activeLevelIds: number[],
        inactiveLevelIds: number[],
    ) {
        if (activeLevelIds.length > 25) {
            return null;
        }

        const allIds = [...new Set([...activeLevelIds, ...inactiveLevelIds])];

        return this.db.transaction(async (tx) => {
            const completedRows = await tx
                .select({
                    levelId: schema.progress.levelId,
                    status: schema.progress.status,
                    listPlacement: sql<number | null>`${schema.progress.listPlacement}::float8`,
                })
                .from(schema.progress)
                .where(
                    and(
                        eq(schema.progress.userId, userId),
                        eq(schema.progress.status, "completed"),
                    ),
                );

            const completedIds = completedRows.map((row) => row.levelId);

            if (!this.hasSameMembers(completedIds, allIds)) {
                return null;
            }

            const byId = new Map(completedRows.map((row) => [row.levelId, row]));

            const currentActive = completedRows
                .filter((row) => row.listPlacement !== null)
                .sort((a, b) => (a.listPlacement ?? 0) - (b.listPlacement ?? 0))
                .map((row) => row.levelId);

            const currentInactive = completedRows
                .filter((row) => row.listPlacement === null)
                .map((row) => row.levelId);

            if (
                this.arraysEqual(currentActive, activeLevelIds) &&
                this.hasSameMembers(currentInactive, inactiveLevelIds)
            ) {
                return {
                    activeCount: activeLevelIds.length,
                    inactiveCount: inactiveLevelIds.length,
                    updatedRows: 0,
                };
            }

            const sameActiveMembers = this.hasSameMembers(
                currentActive,
                activeLevelIds,
            );
            const sameInactiveMembers = this.hasSameMembers(
                currentInactive,
                inactiveLevelIds,
            );

            if (sameActiveMembers && sameInactiveMembers) {
                const movedLevelId = this.detectSingleMovedId(
                    currentActive,
                    activeLevelIds,
                );

                if (movedLevelId !== null) {
                    const movedIndex = activeLevelIds.findIndex(
                        (id) => id === movedLevelId,
                    );
                    const previousLevelId =
                        movedIndex > 0 ? activeLevelIds[movedIndex - 1] : null;
                    const nextLevelId =
                        movedIndex < activeLevelIds.length - 1
                            ? activeLevelIds[movedIndex + 1]
                            : null;

                    let leftPlacement: number | null = null;
                    let rightPlacement: number | null = null;

                    if (previousLevelId !== null) {
                        leftPlacement = byId.get(previousLevelId)?.listPlacement ?? null;
                    }

                    if (nextLevelId !== null) {
                        rightPlacement = byId.get(nextLevelId)?.listPlacement ?? null;
                    }

                    let targetPlacement = byId.get(movedLevelId)?.listPlacement ?? 1000;

                    if (leftPlacement === null && rightPlacement === null) {
                        targetPlacement = 1000;
                    } else if (leftPlacement === null && rightPlacement !== null) {
                        targetPlacement = rightPlacement - 1000;
                    } else if (leftPlacement !== null && rightPlacement === null) {
                        targetPlacement = leftPlacement + 1000;
                    } else if (leftPlacement !== null && rightPlacement !== null) {
                        if (leftPlacement >= rightPlacement) {
                            return null;
                        }
                        targetPlacement = (leftPlacement + rightPlacement) / 2;
                    }

                    const currentPlacement = byId.get(movedLevelId)?.listPlacement ?? null;
                    if (currentPlacement !== targetPlacement) {
                        await tx
                            .update(schema.progress)
                            .set({
                                listPlacement: targetPlacement.toString(),
                            })
                            .where(
                                and(
                                    eq(schema.progress.userId, userId),
                                    eq(schema.progress.levelId, movedLevelId),
                                ),
                            );

                        return {
                            activeCount: activeLevelIds.length,
                            inactiveCount: inactiveLevelIds.length,
                            updatedRows: 1,
                        };
                    }

                    return {
                        activeCount: activeLevelIds.length,
                        inactiveCount: inactiveLevelIds.length,
                        updatedRows: 0,
                    };
                }
            }

            let updatedRows = 0;

            for (let index = 0; index < activeLevelIds.length; index++) {
                const levelId = activeLevelIds[index];
                const placement = ((index + 1) * 1000).toString();
                const currentPlacement = byId.get(levelId)?.listPlacement;

                if (currentPlacement === Number(placement)) {
                    continue;
                }

                await tx
                    .update(schema.progress)
                    .set({
                        listPlacement: placement,
                    })
                    .where(
                        and(
                            eq(schema.progress.userId, userId),
                            eq(schema.progress.levelId, levelId),
                        ),
                    );

                updatedRows++;
            }

            for (const levelId of inactiveLevelIds) {
                const currentPlacement = byId.get(levelId)?.listPlacement;

                if (currentPlacement === null) {
                    continue;
                }

                await tx
                    .update(schema.progress)
                    .set({
                        listPlacement: null,
                    })
                    .where(
                        and(
                            eq(schema.progress.userId, userId),
                            eq(schema.progress.levelId, levelId),
                        ),
                    );

                updatedRows++;
            }

            return {
                activeCount: activeLevelIds.length,
                inactiveCount: inactiveLevelIds.length,
                updatedRows,
            };
        });
    }

    async updateListPlacement(
        levelId: number,
        userId: string,
        placement: number,
    ) {
        const result = await this.db
            .update(schema.progress)
            .set({ listPlacement: placement.toString() })
            .where(
                and(
                    eq(schema.progress.levelId, levelId),
                    eq(schema.progress.userId, userId),
                ),
            )
            .returning();

        return result[0] || null;
    }

    async findAllDays() {
        const result = await this.db
            .select({
                id: schema.dailyLevel.levelId,
                day: schema.dailyLevel.day,
            })
            .from(schema.dailyLevel);

        return result;
    }

    async findLatestDay() {
        const result = await this.db
            .select({
                maxDay: max(schema.dailyLevel.day),
            })
            .from(schema.dailyLevel);
        return result[0]?.maxDay;
    }

    async findDaily(day: number) {
        const result = await this.db
            .select({
                id: schema.dailyLevel.levelId,
                day: schema.dailyLevel.day,
                imagePaths: schema.dailyLevel.imagePaths,
            })
            .from(schema.dailyLevel)
            .where(eq(schema.dailyLevel.day, day))
            .limit(1);

        return result[0] || null;
    }

    async insertDaily(values: schema.InsertDay) {
        const result = await this.db
            .insert(schema.dailyLevel)
            .values(values)
            .returning();

        return result[0] || null;
    }

    async findVault(currentDay: number) {
        const result = await this.db
            .select({
                day: schema.dailyLevel.day,
            })
            .from(schema.dailyLevel)
            .where(lte(schema.dailyLevel.day, currentDay))
            .orderBy(asc(schema.dailyLevel.day));

        return result || null;
    }

    async findSources() {
        const result = await this.db
            .select({
                id: schema.sources.id,
                name: schema.sources.name,
                url: schema.sources.url,
            })
            .from(schema.sources);

        return result;
    }

    async hideReview(reviewId: number) {
        const result = await this.db
            .update(schema.progress)
            .set({ hideReview: true })
            .where(eq(schema.progress.id, reviewId))
            .returning();

        return result.length ? result[0] : null;
    }
}
const db = Database.instance;
export default db;
