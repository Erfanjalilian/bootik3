import crypto from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { cookies } from "next/headers";
import { AuthUser, SessionRecord } from "@/lib/auth/types";
import { getUserById, updateUserLastSeen } from "@/lib/auth/store";

const SESSION_COOKIE = "auth_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const DATA_DIR = path.join(process.cwd(), "data");
const SESSIONS_FILE = path.join(DATA_DIR, "sessions.json");

const ensureSessionsFile = async () => {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.readFile(SESSIONS_FILE, "utf8").catch(() => fs.writeFile(SESSIONS_FILE, "{}", "utf8"));
};

const readSessions = async (): Promise<Record<string, SessionRecord>> => {
  await ensureSessionsFile();
  const raw = await fs.readFile(SESSIONS_FILE, "utf8").catch(() => "{}");
  try {
    return JSON.parse(raw) as Record<string, SessionRecord>;
  } catch {
    return {};
  }
};

const writeSessions = async (sessions: Record<string, SessionRecord>) => {
  await ensureSessionsFile();
  await fs.writeFile(SESSIONS_FILE, JSON.stringify(sessions, null, 2), "utf8");
};

const createSessionToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

export const createSession = async (user: AuthUser) => {
  const token = createSessionToken();
  const sessions = await readSessions();
  const sessionRecord: SessionRecord = {
    id: token,
    userId: user.id,
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_TTL_MS,
  };
  sessions[token] = sessionRecord;
  await writeSessions(sessions);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  await updateUserLastSeen(user.id);
  return token;
};

export const clearSession = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    const sessions = await readSessions();
    delete sessions[token];
    await writeSessions(sessions);
  }
  cookieStore.delete(SESSION_COOKIE);
};

export const getSessionUser = async (): Promise<AuthUser | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const sessions = await readSessions();
  const sessionRecord = sessions[token];
  if (!sessionRecord || sessionRecord.expiresAt <= Date.now()) {
    await clearSession();
    return null;
  }

  const user = await getUserById(sessionRecord.userId);
  if (!user) {
    await clearSession();
    return null;
  }
  return user;
};
