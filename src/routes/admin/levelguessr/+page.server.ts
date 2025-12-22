import type { Actions, PageServerLoad, RequestEvent } from "./$types";
import {
  updateId,
  fetchAllLevels,
  fetchLatestDay,
  fetchDayLevels,
  insertDay,
  fetchSources,
  insertLevels,
} from "$lib/server/db/index";
import { getCurrentDay, getProjectedDate } from "$lib/server/index";
import { fail } from "@sveltejs/kit";
import { uploadImages } from "$lib/server/db/supabase";
import { requireAuthWithRoles } from "$lib/server/auth/middleware";
import { Levels } from "$lib/server/tools/gd";
import { randomUUID } from "crypto";
import { Jimp } from "jimp";
import * as z from "zod";
import { Buffer } from "node:buffer";

const MAX_FILE_SIZE = 1024 * 100; //100 kb

const QueueForm = z.object({
  levelId: z.coerce.number().min(1),
  sourceId: z.coerce.number().min(1),
  frames: z
    .array(
      z.object({
        data: z.string(),
        index: z.coerce.number().min(1).max(6),
      }),
    )
    .max(6)
    .min(6),
});

export const load: PageServerLoad = async (event) => {
  const user = await requireAuthWithRoles(event, ["Admin", "Owner"]);

  const levels = await fetchDayLevels();
  const latestDay = await fetchLatestDay();
  const sources = await fetchSources();

  return {
    user,
    levels,
    sources,
    latestDay,
    projectedDate: getProjectedDate(latestDay),
  };
};

export const actions: Actions = {
  enqueue: async (event) => {
    await requireAuthWithRoles(event, ["Admin", "Owner"]);

    const { request } = event;

    const form = await request.formData();

    const result = QueueForm.safeParse({
      levelId: form.get("levelId"),
      sourceId: form.get("sourceId"),
      frames: form.get("frames"),
    });

    if (!result.success) {
      return fail(400, {
        message: `Invalid form data: ${result.error.message}`,
      });
    }

    const data = result.data;

    const day = (await fetchLatestDay()) + 1;

    data.frames.sort((a, b) => a.index - b.index);

    const files: { file: Buffer; filepath: string }[] = [];
    for (const frame of data.frames) {
      const filename = randomUUID();
      const filepath = `${day}/${filename}`;

      const buffer = Buffer.from(frame.data.split(",")[1], "base64");

      // compress image
      const image = await Jimp.read(buffer);
      image.resize({ w: 854, h: 480 });

      const compressedBuffer = await image.getBuffer("image/jpeg", {
        quality: 50,
      });

      if (compressedBuffer.byteLength > MAX_FILE_SIZE) {
        return fail(400, {
          message: "Image size exceeds limit even after compression",
        });
      } else {
        files.push({ file: compressedBuffer, filepath });
      }
    }

    try {
      // upload images to supabase storage
      const uploadedFiles = await uploadImages(files);
      console.log(`${uploadImages.length} file(s) uploaded successfully`);

      const images = uploadedFiles.map((file, index) => ({
        url: file.path,
        index: index + 1,
      }));

      // insert into database
      await insertDay(day, data.levelId, images, data.sourceId);

      return {
        success: true,
        message: `Frames saved successfully`,
      };
    } catch (error) {
      console.error(error);
      return fail(500, { message: "Failed to upload files" });
    }
  },
  update: async () => {
    let success = 0;
    let fails = 0;

    for (let page = 60; page < 70; page++) {
      const result = await Levels.search(
        {
          type: "Most Downloaded",
          rating: "Star",
          page,
        },
        // true,
      );

      for (const level of result) {
        // attempt to update level if it exists
        try {
          const result = await updateId(
            level.name,
            level.rating,
            level.difficulty,
            level.id,
          );
          if (result.length === 1) {
            success++;
          } else if (result.length > 1) {
            console.error(
              "Multiple levels with same name, rating, and difficulty",
            );
            fails++;
          }
        } catch (error) {
          console.error(error);
          fails++;
        }
      }
    }

    // await insertLevels(rowsToInsert);

    return {
      success: true,
      message: `Updates successful (${success} successful, ${fails} failed)`,
    };
  },
};
