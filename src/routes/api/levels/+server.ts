import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import Database from "$lib/server/database";
import { addLevelsToDatabase } from "$lib/server/geometryDash/levels";

export const GET: RequestHandler = async ({ url }) => {
  const db = Database.instance;
  const levels = await db.getLevels();
  return json(levels);
};

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  try {
    await addLevelsToDatabase(body?.pageCount ?? 0);
  } catch (error) {
    console.log(error);
  }
  return json({ message: "Levels created successfully" });
};
