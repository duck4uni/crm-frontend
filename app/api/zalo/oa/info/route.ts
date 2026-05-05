import { NextRequest, NextResponse } from "next/server";

const ZALO_OA_INFO = "https://openapi.zalo.me/v2.0/oa/getoa";

export async function GET(req: NextRequest) {
  const accessToken = req.headers.get("x-oa-access-token");
  if (!accessToken) {
    return NextResponse.json({ error: 1, message: "Missing access token" }, { status: 400 });
  }

  const res = await fetch(ZALO_OA_INFO, {
    headers: { access_token: accessToken },
    cache: "no-store",
  });

  const json = await res.json();
  console.log("[Zalo /oa/info] response:", json);
  return NextResponse.json(json);
}
