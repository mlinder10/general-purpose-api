import { db, wcjUsers } from "@/db";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return new Response("Missing id", { status: 400 });

    const user = await db.select().from(wcjUsers).where(eq(wcjUsers.id, id));
    if (user.length !== 0)
      return new Response("User not found", { status: 404 });

    return new Response(JSON.stringify(user), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
