/* eslint-disable @typescript-eslint/no-unused-vars */
import { eq, sql } from "drizzle-orm";
import { db } from "./_weights/db";
import { vectorSimilarity, vncExercises } from "./_weights/vnc-schema";
import { createEmbeddingsFile, writeEmbeddingsToDB } from "./_weights/encoder";

export async function GET() {
  try {
    await createEmbeddingsFile();
    await writeEmbeddingsToDB();
    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) return new Response("Missing required fields", { status: 400 });

    const exerciseVec = (
      await db.select().from(vncExercises).where(eq(vncExercises.id, id))
    )[0].vector;

    const similar = await db
      .select({ name: vncExercises.name })
      .from(vncExercises)
      .orderBy(vectorSimilarity(exerciseVec))
      .limit(5);
    // const similar = await findSimilar(id);

    return new Response(JSON.stringify(similar), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

async function findSimilar(id: string, limit = 5) {
  return await db.run(sql`
    SELECT name
    FROM vnc_exercises
    ORDER BY vector_distance_cos(
      vector,
      vector32((SELECT vector FROM vnc_exercises WHERE id = ${id}))
    )
    LIMIT ${limit}
  `);
}
