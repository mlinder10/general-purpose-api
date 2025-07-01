import { db, pcMeals } from "@/db";
import { getSession } from "@/utils/auth";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return new Response("Unauthorized", { status: 401 });

    const { name, calories, protein, carbs, fats } = await req.json();
    if (!name || !calories || !protein || !carbs || !fats)
      return new Response("Missing required fields", { status: 400 });

    await db.insert(pcMeals).values({
      userId: session.id,
      createdAt: Date.now(),
      name,
      calories,
      protein,
      carbs,
      fats,
    });

    return new Response(null, { status: 201 });
  } catch (err) {
    console.error(err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
