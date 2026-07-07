import { createSession, clearSession, getSessionUser } from "@/lib/auth/session";
import {
  createOtp,
  createOtpRecord,
  createUser,
  consumeOtpRecord,
  deleteOtpRecord,
  getOtpRecord,
  getRateLimitState,
  incrementOtpAttempts,
  isValidPhone,
  normalizePhone,
  saveOtpRecord,
  saveRateLimitState,
  verifyOtpRecord,
} from "@/lib/auth/store";
import { sendOtpSms } from "@/lib/auth/sms";

const OTP_COOLDOWN_MS = 60 * 1000;
const OTP_ATTEMPT_WINDOW_MS = 10 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

export async function requestOtp(phoneInput: string) {
  const phone = normalizePhone(phoneInput);
  console.info("[auth] requestOtp start", { phoneInput, phone });

  if (!isValidPhone(phone)) {
    return { ok: false, message: "شماره موبایل وارد‌شده معتبر نیست." } as const;
  }

  const rateLimit = await getRateLimitState(phone);
  const now = Date.now();
  if (rateLimit?.blockedUntil && rateLimit.blockedUntil > now) {
    return {
      ok: false,
      message: "درخواست کد برای این شماره بیش از حد مجاز است. لطفاً بعداً تلاش کنید.",
    } as const;
  }

  if (rateLimit && rateLimit.lastSentAt + OTP_COOLDOWN_MS > now) {
    return {
      ok: false,
      message: "لطفاً ۶۰ ثانیه صبر کنید و سپس دوباره درخواست کد بدهید.",
    } as const;
  }

  const otp = createOtp();
  const record = createOtpRecord(phone, otp);
  await saveOtpRecord(record);
  await saveRateLimitState(phone, {
    phone,
    lastSentAt: now,
    attempts: 0,
    blockedUntil: undefined,
  });

  console.info("[auth] generated otp", { phone, otp });

  const smsResult = await sendOtpSms(phone, otp);
  if (!smsResult.ok) {
    await deleteOtpRecord(phone);
    console.error("[auth] otp request failed", { phone, error: smsResult.message });
    return { ok: false, message: smsResult.message } as const;
  }

  console.info("[auth] otp request success", { phone, messageId: smsResult.messageId });
  return { ok: true, message: "کد تأیید ارسال شد.", messageId: smsResult.messageId } as const;
}

export async function verifyOtp(phoneInput: string, otpInput: string) {
  const phone = normalizePhone(phoneInput);
  const otp = otpInput.trim();
  console.info("[auth] verifyOtp start", { phone, otpLength: otp.length });

  if (!isValidPhone(phone)) {
    return { ok: false, message: "شماره موبایل معتبر نیست." } as const;
  }

  if (!/^\d{6}$/.test(otp)) {
    return { ok: false, message: "کد تأیید باید ۶ رقمی باشد." } as const;
  }

  const now = Date.now();
  const rateLimit = await getRateLimitState(phone);
  if (rateLimit?.blockedUntil && rateLimit.blockedUntil > now) {
    return {
      ok: false,
      message: "تعداد تلاش‌های شما بیشتر از حد مجاز است. لطفاً بعداً دوباره تلاش کنید.",
    } as const;
  }

  const record = await getOtpRecord(phone);
  if (!record) {
    return { ok: false, message: "کد تأیید منقضی شده است. دوباره تلاش کنید." } as const;
  }

  if (record.attempts >= MAX_OTP_ATTEMPTS) {
    await saveRateLimitState(phone, {
      phone,
      lastSentAt: rateLimit?.lastSentAt ?? 0,
      attempts: MAX_OTP_ATTEMPTS,
      blockedUntil: now + OTP_ATTEMPT_WINDOW_MS,
    });
    return {
      ok: false,
      message: "تلاش‌های شما بیش از حد مجاز است. لطفاً بعداً دوباره امتحان کنید.",
    } as const;
  }

  if (!verifyOtpRecord(record, otp)) {
    console.warn("[auth] otp verification failed", { phone, attempts: record.attempts + 1 });
    const updated = await incrementOtpAttempts(phone);
    const attempts = (updated?.attempts ?? 0) + 1;
    if (attempts >= MAX_OTP_ATTEMPTS) {
      await saveRateLimitState(phone, {
        phone,
        lastSentAt: rateLimit?.lastSentAt ?? 0,
        attempts,
        blockedUntil: now + OTP_ATTEMPT_WINDOW_MS,
      });
    }
    return { ok: false, message: "کد تأیید اشتباه است." } as const;
  }

  await consumeOtpRecord(phone);
  const user = await createUser(phone);
  const token = await createSession(user);
  console.info("[auth] login success", { phone, userId: user.id });
  return { ok: true, user, token } as const;
}

export async function logoutSession() {
  await clearSession();
  return { ok: true } as const;
}

export async function getAuthenticatedUser() {
  return getSessionUser();
}
