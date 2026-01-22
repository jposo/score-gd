import type { Actions, PageServerLoad } from "./$types";
import db from "$lib/server/db/instance";
import { getProjectedDate } from "$lib/server/utils";
import { error, fail } from "@sveltejs/kit";
import { uploadImages } from "$lib/server/db/supabase";
import { requireAuthWithRoles } from "$lib/server/auth/middleware";
import { randomUUID } from "crypto";
import { Jimp } from "jimp";
import { z } from "zod";
import { Buffer } from "node:buffer";

const MAX_FILE_SIZE = 1024 * 100; //100 kb

const QueueForm = z.object({
  levelId: z.coerce.number().min(1),
  sourceId: z.coerce.number().min(1),
  frames: z.preprocess((value) => {
    if (typeof value !== "string") return value;
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }, z.array(z.string()).length(6)),
});

export const load: PageServerLoad = async ({ cookies, url }) => {
  const user = await requireAuthWithRoles(cookies, url, ["owner"]);

  const storedDays = await db.findAllDays();
  const latestDay = await db.findLatestDay();
  if (latestDay === null) {
    error(404, "no latest day found");
  }
  const sources = await db.findSources();

  return {
    user,
    storedDays: storedDays,
    sources,
    latestDay,
    projectedDate: getProjectedDate(latestDay),
  };
};

export const actions: Actions = {
  enqueue: async ({ cookies, url, request }) => {
    await requireAuthWithRoles(cookies, url, ["owner"]);

    const form = await request.formData();
    const entries = Object.fromEntries(form);

    const result = QueueForm.safeParse(entries);

    if (!result.success) {
      return fail(400, {
        message: "invalid request",
        error: result.error.message,
      });
    }

    const data = result.data;
    const latestDay = await db.findLatestDay();
    if (latestDay === null) {
      return fail(404, { message: "no latest day found" });
    }

    const nextDay = latestDay + 1;

    const files: { file: Buffer; filepath: string }[] = [];
    for (const frame of data.frames) {
      const filename = randomUUID();
      const filepath = `${nextDay}/${filename}`;

      const buffer = Buffer.from(frame.split(",")[1], "base64");

      // compress image
      const image = await Jimp.read(buffer);
      image.resize({ w: 854, h: 480 });

      const compressedBuffer = await image.getBuffer("image/jpeg", {
        quality: 50,
      });

      if (compressedBuffer.byteLength > MAX_FILE_SIZE) {
        return fail(400, {
          message: "image size exceeds limit even after compression",
        });
      } else {
        files.push({ file: compressedBuffer, filepath });
      }
    }

    try {
      // upload images to supabase storage
      const uploadedFiles = await uploadImages(files);
      console.log(`${uploadedFiles.length} file(s) uploaded successfully`);

      const images = uploadedFiles.map((file) => file.path);

      // insert into database
      await db.insertDaily({
        day: nextDay,
        levelId: data.levelId,
        imagePaths: images,
        sourceId: data.sourceId,
      });

      return {
        success: true,
        message: "frames saved successfully",
      };
    } catch (error) {
      console.error(error);
      return fail(500, { message: "failed to upload files" });
    }
  },
};
