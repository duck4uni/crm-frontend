import { NextRequest, NextResponse } from "next/server";

const ZALO_API = "https://openapi.zalo.me/v2.0/oa/conversation";

export async function GET(req: NextRequest) {
  const accessToken = req.headers.get("x-oa-access-token");
  if (!accessToken) {
    return NextResponse.json({ error: 1, message: "Missing access token" }, { status: 400 });
  }

  const data = req.nextUrl.searchParams.get("data") ?? "{}";

  const res = await fetch(`${ZALO_API}?data=${encodeURIComponent(data)}`, {
    headers: { access_token: accessToken },
    cache: "no-store",
  });

  const json = await res.json();
  return NextResponse.json(json);
}
