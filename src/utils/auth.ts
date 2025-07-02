"use server";

import { jwtVerify, SignJWT } from "jose";
import { headers } from "next/headers";

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET!);

export type Session = {
  id: string;
  email: string;
  username: string;
};

// Session -----------------------------

export async function authenticate(session: Session, key: string) {
  const token = await signToken(session);
  return new Response(token, {
    status: 200,
    headers: {
      "Set-Cookie": `${key}=${token}; Path=/; HttpOnly; SameSite=Strict; Secure`,
    },
  });
  // (await cookies()).set(key, token, {
  //   path: "/",
  //   httpOnly: true,
  //   secure: true,
  // });
}

export async function logoutAndRedirect(key: string) {
  return new Response(null, {
    status: 200,
    headers: {
      "Set-Cookie": `${key}=; Path=/; HttpOnly; SameSite=Strict; Secure`,
      Location: "/",
    },
  });

  // (await cookies()).set(key, "", {
  //   path: "/",
  //   expires: new Date(0),
  //   httpOnly: true,
  //   secure: true,
  // });

  // return { redirectTo: "/" };
}

export async function getSession(key: string): Promise<Session | null> {
  const head = await headers();
  const jwt = head
    .get("cookie")
    ?.split("; ")
    .filter((v) => v.startsWith(key));
  if (jwt === undefined || jwt.length === 0) {
    return null;
  }
  const token = jwt[0].split("=")[1];
  if (!token) return null;
  const decoded = await verifyToken(token);
  if (!decoded) return null;
  return decoded;
}

// Helpers -----------------------------

async function signToken(payload: Session) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(process.env.NODE_ENV === "development" ? "1y" : "1d")
    .sign(SECRET_KEY);
}

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY, {
      algorithms: ["HS256"],
    });
    return payload as Session;
  } catch {
    return null;
  }
}

// Password -----------------------------

export async function hashPassword(password: string) {
  const arrayBuffer = await crypto.subtle.digest(
    "SHA-512",
    new TextEncoder().encode(password)
  );
  return Buffer.from(arrayBuffer).toString("hex");
}

export async function verifyPassword(password: string, hash: string) {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}
