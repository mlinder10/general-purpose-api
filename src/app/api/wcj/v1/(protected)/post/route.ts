import { GoogleEmbedding } from "@/ai";
import {
  db,
  vectorSimilarity,
  WCJ_POST_VECTOR_DIMENSIONALITY,
  wcjPostEmbedding,
  wcjPosts,
} from "@/db";
import { getSession } from "@/utils/auth";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const session = await getSession("wcj-jwt");
    if (!session) return new Response("Unauthorized", { status: 401 });

    const queryParams = new URL(req.url).searchParams;
    const word = queryParams.get("word");
    if (!word) return new Response("Missing required fields", { status: 400 });

    const [reference] = await db
      .select({ embedding: wcjPostEmbedding.embedding })
      .from(wcjPostEmbedding)
      .where(eq(wcjPosts.word, word))
      .leftJoin(wcjPosts, eq(wcjPosts.id, wcjPostEmbedding.postId));

    if (!reference) return new Response("Post not found", { status: 404 });

    const [posts] = await db
      .select({ posts: wcjPosts })
      .from(wcjPosts)
      .innerJoin(wcjPostEmbedding, eq(wcjPosts.id, wcjPostEmbedding.postId))
      .orderBy(vectorSimilarity(reference.embedding, "embedding"))
      .limit(5);

    return new Response(JSON.stringify(posts), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession("wcj-jwt");
    if (!session) return new Response("Unauthorized", { status: 401 });

    const { word, definition, partOfSpeech, example } = await req.json();

    if (!word || !definition || !partOfSpeech)
      return new Response("Missing required fields", { status: 400 });

    const postId = crypto.randomUUID();

    const embedding = await generateEmbedding(
      word,
      definition,
      partOfSpeech,
      example
    );

    await db.batch([
      db.insert(wcjPosts).values({
        id: postId,
        userId: session.id,
        createdAt: Date.now(),
        word,
        definition,
        partOfSpeech,
        example,
      }),
      db.insert(wcjPostEmbedding).values({
        postId,
        embedding,
      }),
    ]);

    return new Response(null, { status: 201 });
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

async function generateEmbedding(
  word: string,
  definition: string,
  partOfSpeech: string,
  example: string | undefined
) {
  const embeddingModel = new GoogleEmbedding({
    config: {
      outputDimensionality: WCJ_POST_VECTOR_DIMENSIONALITY,
      taskType: "CLUSTERING",
    },
  });

  const input = `WORD: ${word}\nDEFINITION: ${definition}\nPOS: ${partOfSpeech}\nEXAMPLE: ${example}`;
  const result = await embeddingModel.embed([input]);
  if (result.length !== 1) throw new Error("Failed to generate embedding");
  return result[0];
}
