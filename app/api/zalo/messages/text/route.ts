import { NextRequest, NextResponse } from "next/server";

const ZALO_CS_API = "https://openapi.zalo.me/v3.0/oa/message/cs";

interface ZaloErrorEnvelope {
  success: false;
  error: {
    code: string;
    message: string;
    zaloErrorCode?: number;
    zaloMessage?: string;
  };
}

const errResponse = (
  message: string,
  code = "INVALID_REQUEST",
  zaloErrorCode?: number,
  zaloMessage?: string,
  status = 400,
): NextResponse<ZaloErrorEnvelope> => {
  return NextResponse.json(
    { success: false, error: { code, message, zaloErrorCode, zaloMessage } },
    { status },
  );
};

export async function POST(req: NextRequest) {
  const accessToken = req.headers.get("x-oa-access-token");
  if (!accessToken) {
    return errResponse("Missing access token", "MISSING_TOKEN");
  }

  let body: { userId?: string; text?: string };
  try {
    body = await req.json();
  } catch {
    return errResponse("Invalid JSON body");
  }

  const userId = body.userId?.trim();
  const text = body.text?.trim();

  if (!userId) return errResponse("userId is required");
  if (!text) return errResponse("text is required");

  const payload = {
    recipient: { user_id: userId },
    message: { text },
  };

  console.log("[Zalo /messages/text] request payload:", payload);

  const res = await fetch(ZALO_CS_API, {
    method: "POST",
    headers: {
      access_token: accessToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const data = await res.json();
  console.log("[Zalo /messages/text] response:", data);

  if (!res.ok || (data.error !== undefined && data.error !== 0)) {
    return errResponse(
      data.message || "Gửi tin thất bại",
      "ZALO_API_ERROR",
      data.error,
      data.message,
      res.ok ? 400 : res.status,
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      message_id: data.data?.message_id || "",
      sentAt: new Date().toISOString(),
    },
  });
}
