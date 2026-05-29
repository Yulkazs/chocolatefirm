import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "aveline-dev-secret-change-in-production"
);

export type AuthPayload = {
  sub: string;
  email: string;
  role: string;
};

/**
 * Returns the verified JWT payload or null if the token is missing/invalid.
 * Use in Server Components and Server Actions.
 */
export async function getAuth(): Promise<AuthPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("aveline_token")?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as AuthPayload;
  } catch {
    return null;
  }
}