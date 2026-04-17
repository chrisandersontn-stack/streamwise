import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "sw_session";

function createSessionId() {
  return `sw_${crypto.randomUUID()}`;
}

export async function getOrCreateSessionId() {
  const cookieStore = await cookies();
  const existing = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (existing) {
    return existing;
  }

  const sessionId = createSessionId();
  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  return sessionId;
}
