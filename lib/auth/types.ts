export interface AuthUser {
  id: string;
  phone: string;
  createdAt: number;
  lastSeenAt: number;
}

export interface OtpRecord {
  phone: string;
  otpHash: string;
  otpSalt: string;
  expiresAt: number;
  used: boolean;
  attempts: number;
  lastAttemptAt: number;
}

export interface OtpRateLimitState {
  phone: string;
  lastSentAt: number;
  attempts: number;
  blockedUntil?: number;
}

export interface SessionRecord {
  id: string;
  userId: string;
  expiresAt: number;
  createdAt: number;
}
