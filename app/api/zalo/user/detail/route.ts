import { NextRequest, NextResponse } from "next/server";

const ZALO_API = "https://openapi.zalo.me/v3.0/oa/user/detail";

export async function GET(req: NextRequest) {
  const accessToken = req.headers.get("x-oa-access-token");
  if (!accessToken) {
    return NextResponse.json({ error: 1, message: "Missing access token" }, { status: 400 });
  }

  const userId = req.nextUrl.searchParams.get("user_id");
  if (!userId) {
    return NextResponse.json({ error: 1, message: "Missing user_id" }, { status: 400 });
  }

  const data = JSON.stringify({ user_id: userId });
  const res = await fetch(`${ZALO_API}?data=${encodeURIComponent(data)}`, {
    headers: { access_token: accessToken },
    cache: "no-store",
  });

  const json = await res.json();
  return NextResponse.json(json);
}
