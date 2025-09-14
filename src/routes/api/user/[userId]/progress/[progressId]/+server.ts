import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";

export const PUT: RequestHandler = async ({ request, params }) => {
  const body = await request.json();
  console.log(body, params);

  return json({ success: true });
};
