import { db, wcjUsers } from "@/db";
import { authenticate, verifyPassword } from "@/utils/auth";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password)
      return new Response("Missing email or password", { status: 400 });

    const users = await db
      .select()
      .from(wcjUsers)
      .where(eq(wcjUsers.email, email));

    if (users.length !== 1)
      return new Response("Invalid email or password", { status: 400 });
    const user = users[0];

    if (!(await verifyPassword(password, user.password)))
      return new Response("Invalid email or password", { status: 400 });

    return await authenticate(user, "wcj-jwt");
  } catch (err) {
    console.error(err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
