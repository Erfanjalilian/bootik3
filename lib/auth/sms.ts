const SMS_IR_API_URL = "https://api.sms.ir/v1/send/verify";

interface SmsIrResponse {
  status: number;
  message: string;
  data?: {
    messageId?: number;
    cost?: number;
  };
}

export async function sendOtpSms(phone: string, otp: string) {
  const apiKey = process.env.SMS_IR_API_KEY;
  const templateId = process.env.SMS_IR_TEMPLATE_ID;

  console.info("[auth] sending otp sms", { phone, otpLength: otp.length, templateId: Boolean(templateId) });

  if (!apiKey || !templateId) {
    console.error("[auth] sms config missing", { hasApiKey: Boolean(apiKey), hasTemplateId: Boolean(templateId) });
    return {
      ok: false,
      message: "پیکربندی ارسال پیامک انجام نشده است.",
    } as const;
  }

  const payload = {
    mobile: phone,
    templateId: Number(templateId),
    parameters: [{ name: "Code", value: otp }],
  };

  console.info("[auth] sms payload", { phone, templateId: payload.templateId, otp });

  try {
    const response = await fetch(SMS_IR_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/plain",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const text = await response.text();
    console.info("[auth] sms response", { status: response.status, body: text });

    let data: SmsIrResponse | null = null;
    try {
      data = JSON.parse(text) as SmsIrResponse;
    } catch {
      data = null;
    }

    if (!response.ok || !data || data.status !== 1) {
      console.error("[auth] sms send failed", {
        status: response.status,
        responseBody: text,
        message: data?.message || "unknown",
      });
      return {
        ok: false,
        message: data?.message || "ارسال پیامک با خطا مواجه شد.",
      } as const;
    }

    console.info("[auth] sms sent successfully", { messageId: data.data?.messageId });
    return {
      ok: true,
      message: "پیامک ارسال شد.",
      messageId: data.data?.messageId,
    } as const;
  } catch (error) {
    console.error("[auth] sms exception", error);
    return {
      ok: false,
      message: "ارسال پیامک با خطا مواجه شد.",
    } as const;
  }
}
