import { z } from "zod";
import { difficulties, ratings, lengths } from "$lib/shared/gd";

export default z.object({
    page: z.coerce.number().min(1).optional().default(1),
    query: z.string().max(20).optional(),
    difficulty: z.enum(difficulties).optional(),
    rating: z.enum(ratings).optional(),
    length: z.enum(lengths).optional(),
    service: z.string().optional(),
});
