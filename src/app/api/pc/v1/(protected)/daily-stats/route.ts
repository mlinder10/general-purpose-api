import { and, eq, gte } from "drizzle-orm";
import { db, pcMeals, pcStats } from "@/db";
import { getSession } from "@/utils/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return new Response("Unauthorized", { status: 401 });

    // get most recent stats
    const stats = await db
      .select()
      .from(pcStats)
      .where(eq(pcStats.userId, session.id))
      .limit(1);

    // get meals from today
    const dayStart = new Date().setHours(0, 0, 0, 0);

    const meals = await db
      .select()
      .from(pcMeals)
      .where(
        and(eq(pcMeals.userId, session.id), gte(pcMeals.createdAt, dayStart))
      );

    return new Response(JSON.stringify({ stats, meals }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
