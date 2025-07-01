import { db, pcUsers } from "@/db";
import { eq } from "drizzle-orm";
import { authenticate, hashPassword } from "@/utils/auth";

export async function POST(req: Request) {
  try {
    const { email, username, password } = await req.json();

    if (!email || !username || !password)
      return new Response("Missing email, username, or password", {
        status: 400,
      });

    const existingUsers = await db
      .select()
      .from(pcUsers)
      .where(eq(pcUsers.email, email));
    if (existingUsers.length !== 0)
      return new Response("User already exists with email", { status: 400 });

    const hashedPassword = await hashPassword(password);
    const id = crypto.randomUUID();
    await db.insert(pcUsers).values({
      id,
      email,
      username,
      password: hashedPassword,
      createdAt: Date.now(),
    });

    return await authenticate({ id, email, username }, "pc-jwt");
  } catch (err) {
    console.error(err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
