import z from "zod";
import {
    statusEnum,
    type InsertLevel,
    type InsertProgress,
} from "$lib/server/db/schema";
import { process } from "./shared";

export default z.object({
    userId: z.uuid(),
    levelId: z.number().min(1),
    status: z.enum(statusEnum.enumValues).optional(),
    score: z.coerce.number().min(1).max(10).nullable().optional(),
    completionPercentage: z.preprocess(
        process,
        z.coerce.number().min(0).max(100).nullable().optional(),
    ),
    attempts: z.preprocess(
        process,
        z.coerce.number().min(0).nullable().optional(),
    ),
    startedAt: z.preprocess(
        process,
        z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/)
            .nullable()
            .optional(),
    ),
    completedAt: z.preprocess(
        process,
        z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/)
            .nullable()
            .optional(),
    ),
    videoUrl: z.preprocess(process, z.url().nullable().optional()),
    review: z.preprocess(
        process,
        z.string().min(0).max(1024).nullable().optional(),
    ),
});
