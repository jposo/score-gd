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
  await addLevelsToDatabase(body?.pageCount ?? 0);
  // const { levelId, levelType } = await request.json();
  // const db = Database.instance;
  // await db.insertLevel({
  //   geometry_dash_id: levelId,
  //   type: levelType,
  //   name: "New Level",
  //   publisher: "Unknown",
  //   difficulty: "Easy",
  //   length: Number2Length[Length.Easy],
  //   stars: 0,
  //   downloads: 0,
  //   plays: 0,
  //   likes: 0,
  //   dislikes: 0,
  //   comments: 0,
  //   views: 0,
  //   created_at: new Date(),
  //   updated_at: new Date(),
  // });
  return json({ message: "Levels created successfully" });
};
