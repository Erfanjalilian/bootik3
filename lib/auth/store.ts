import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { AuthUser, OtpRecord, OtpRateLimitState } from "@/lib/auth/types";

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const OTP_FILE = path.join(DATA_DIR, "otp.json");
const RATE_LIMIT_FILE = path.join(DATA_DIR, "otp-rate-limit.json");

const ensureDataFiles = async () => {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await Promise.all([
    fs.readFile(USERS_FILE, "utf8").catch(() => fs.writeFile(USERS_FILE, "[]", "utf8")),
    fs.readFile(OTP_FILE, "utf8").catch(() => fs.writeFile(OTP_FILE, "{}", "utf8")),
    fs.readFile(RATE_LIMIT_FILE, "utf8").catch(() => fs.writeFile(RATE_LIMIT_FILE, "{}", "utf8")),
  ]);
};

const readJson = async <T>(filePath: string, fallback: T): Promise<T> => {
  const raw = await fs.readFile(filePath, "utf8").catch(() => null);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const writeJson = async (filePath: string, data: unknown) => {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
};

const hashOtp = (otp: string, salt: string) => {
  return crypto.createHmac("sha256", salt).update(otp).digest("hex");
};

export const normalizePhone = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (!digits.startsWith("98") && digits.startsWith("0")) {
    return `98${digits.slice(1)}`;
  }
  if (digits.startsWith("98")) {
    return digits;
  }
  if (digits.length === 11 && digits.startsWith("9")) {
    return `98${digits}`;
  }
  return digits;
};

export const isValidPhone = (value: string) => {
  const normalized = normalizePhone(value);
  return /^98[0-9]{10}$/.test(normalized);
};

export const createOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const createOtpRecord = (phone: string, otp: string): OtpRecord => {
  const salt = crypto.randomBytes(16).toString("hex");
  return {
    phone,
    otpHash: hashOtp(otp, salt),
    otpSalt: salt,
    expiresAt: Date.now() + 2 * 60 * 1000,
    used: false,
    attempts: 0,
    lastAttemptAt: Date.now(),
  };
};

export const verifyOtpRecord = (otpRecord: OtpRecord, otp: string) => {
  if (otpRecord.used) return false;
  if (Date.now() > otpRecord.expiresAt) return false;
  return hashOtp(otp, otpRecord.otpSalt) === otpRecord.otpHash;
};

export const getUsers = async (): Promise<AuthUser[]> => {
  await ensureDataFiles();
  return readJson<AuthUser[]>(USERS_FILE, []);
};

export const getUserByPhone = async (phone: string): Promise<AuthUser | null> => {
  const users = await getUsers();
  return users.find((user) => user.phone === phone) ?? null;
};

export const getUserById = async (id: string): Promise<AuthUser | null> => {
  const users = await getUsers();
  return users.find((user) => user.id === id) ?? null;
};

export const createUser = async (phone: string): Promise<AuthUser> => {
  const users = await getUsers();
  const existing = users.find((user) => user.phone === phone);
  if (existing) return existing;
  const user: AuthUser = {
    id: crypto.randomUUID(),
    phone,
    createdAt: Date.now(),
    lastSeenAt: Date.now(),
  };
  users.push(user);
  await writeJson(USERS_FILE, users);
  return user;
};

export const updateUserLastSeen = async (userId: string) => {
  const users = await getUsers();
  const user = users.find((entry) => entry.id === userId);
  if (!user) return;
  user.lastSeenAt = Date.now();
  await writeJson(USERS_FILE, users);
};

export const saveOtpRecord = async (otpRecord: OtpRecord) => {
  await ensureDataFiles();
  const store = await readJson<Record<string, OtpRecord>>(OTP_FILE, {});
  store[otpRecord.phone] = otpRecord;
  await writeJson(OTP_FILE, store);
};

export const getOtpRecord = async (phone: string): Promise<OtpRecord | null> => {
  await ensureDataFiles();
  const store = await readJson<Record<string, OtpRecord>>(OTP_FILE, {});
  return store[phone] ?? null;
};

export const consumeOtpRecord = async (phone: string) => {
  await ensureDataFiles();
  const store = await readJson<Record<string, OtpRecord>>(OTP_FILE, {});
  const record = store[phone];
  if (!record) return null;
  record.used = true;
  store[phone] = record;
  await writeJson(OTP_FILE, store);
  return record;
};

export const deleteOtpRecord = async (phone: string) => {
  await ensureDataFiles();
  const store = await readJson<Record<string, OtpRecord>>(OTP_FILE, {});
  delete store[phone];
  await writeJson(OTP_FILE, store);
};

export const incrementOtpAttempts = async (phone: string) => {
  await ensureDataFiles();
  const store = await readJson<Record<string, OtpRecord>>(OTP_FILE, {});
  const record = store[phone];
  if (!record) return null;
  record.attempts += 1;
  record.lastAttemptAt = Date.now();
  store[phone] = record;
  await writeJson(OTP_FILE, store);
  return record;
};

export const getRateLimitState = async (phone: string): Promise<OtpRateLimitState | null> => {
  await ensureDataFiles();
  const store = await readJson<Record<string, OtpRateLimitState>>(RATE_LIMIT_FILE, {});
  return store[phone] ?? null;
};

export const saveRateLimitState = async (phone: string, state: OtpRateLimitState) => {
  await ensureDataFiles();
  const store = await readJson<Record<string, OtpRateLimitState>>(RATE_LIMIT_FILE, {});
  store[phone] = state;
  await writeJson(RATE_LIMIT_FILE, store);
};
