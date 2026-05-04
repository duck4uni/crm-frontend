import { NextRequest, NextResponse } from "next/server";

const ZALO_TOKEN_URL = "https://oauth.zaloapp.com/v4/oa/access_token";
const ZALO_OA_INFO_URL = "https://openapi.zalo.me/v2.0/oa/getoa";

export async function POST(req: NextRequest) {
  const { code, oaId } = await req.json();

  if (!code) {
    return NextResponse.json({ error: "Missing authorization code" }, { status: 400 });
  }

  const appId = process.env.NEXT_PUBLIC_ZALO_APP_ID;
  const appSecret = process.env.ZALO_APP_SECRET;

  if (!appId || !appSecret) {
    return NextResponse.json({ error: "Zalo app credentials not configured" }, { status: 500 });
  }

  // Exchange authorization_code → access_token (server-side, needs app_secret)
  const tokenRes = await fetch(ZALO_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      secret_key: appSecret,
    },
    body: new URLSearchParams({
      app_id: appId,
      code,
      grant_type: "authorization_code",
    }),
  });

  const tokenData = await tokenRes.json();
  console.log("[Zalo OAuth] token exchange response:", tokenData);

  if (!tokenData.access_token) {
    return NextResponse.json(
      { error: "Token exchange failed", details: tokenData },
      { status: 400 },
    );
  }

  // Fetch OA profile to get name
  let oaName = oaId ? `OA ${oaId}` : "Zalo OA";
  try {
    const oaRes = await fetch(ZALO_OA_INFO_URL, {
      headers: { access_token: tokenData.access_token },
      cache: "no-store",
    });
    const oaData = await oaRes.json();
    if (oaData.error === 0 && oaData.data?.name) {
      oaName = oaData.data.name;
    }
  } catch {
    // non-fatal
  }

  const expiresIn: number = tokenData.expires_in ?? 86400;

  return NextResponse.json({
    oaId: oaId ?? "",
    oaName,
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token ?? "",
    expiresIn,
    tokenExpiredAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
    status: "connected",
  });
}
