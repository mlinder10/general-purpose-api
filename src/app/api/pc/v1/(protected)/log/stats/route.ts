import { db, pcStats } from "@/db";
import { getSession } from "@/utils/auth";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return new Response("Unauthorized", { status: 401 });

    const { weight, height, age, gender, activityLevel, bodyFat } =
      await req.json();
    if (!weight || !height || !age || !gender || !activityLevel || !bodyFat)
      return new Response("Missing required fields", { status: 400 });

    const computedCalories = computeCals(
      weight,
      height,
      age,
      gender,
      activityLevel,
      bodyFat
    );

    await db.insert(pcStats).values({
      userId: session.id,
      createdAt: Date.now(),
      weight,
      height,
      age,
      gender,
      activityLevel,
      bodyFat,
      computedCalories,
    });

    return new Response(null, { status: 201 });
  } catch (err) {
    console.error(err);
    return new Response("Internal Server Error", { status: 500 });
  }
}

/* eslint-disable @typescript-eslint/no-unused-vars */
function computeCals(
  weight: number,
  height: number,
  age: number,
  gender: string,
  activityLevel: string,
  bodyFat: number
) {
  // TODO: implement
  return 0;
}
