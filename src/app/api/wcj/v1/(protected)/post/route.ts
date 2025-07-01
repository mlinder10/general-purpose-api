import { db, wcjPosts } from "@/db";
import { getSession } from "@/utils/auth";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return new Response("Unauthorized", { status: 401 });

    const { word, definition, partOfSpeech } = await req.json();

    if (!word || !definition || !partOfSpeech)
      return new Response("Missing required fields", { status: 400 });

    await db.insert(wcjPosts).values({
      userId: session.id,
      createdAt: Date.now(),
      word,
      definition,
      partOfSpeech,
    });

    return new Response(null, { status: 201 });
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
