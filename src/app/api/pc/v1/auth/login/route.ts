import { db, pcUsers } from "@/db";
import { eq } from "drizzle-orm";
import { authenticate, verifyPassword } from "@/utils/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password)
      return new Response("Missing email or password", { status: 400 });

    const users = await db
      .select()
      .from(pcUsers)
      .where(eq(pcUsers.email, email));
    if (users.length !== 1)
      return new Response("Invalid email or password", { status: 400 });

    const user = users[0];
    if (!(await verifyPassword(password, user.password)))
      return new Response("Invalid email or password", { status: 400 });

    return await authenticate(user, "pc-jwt");
  } catch (err) {
    console.error(err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
