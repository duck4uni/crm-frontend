import { NextRequest, NextResponse } from "next/server";

const ZALO_API = "https://openapi.zalo.me/v3.0/oa/user/getlist";

export async function GET(req: NextRequest) {
  const accessToken = req.headers.get("x-oa-access-token");
  if (!accessToken) {
    return NextResponse.json({ error: 1, message: "Missing access token" }, { status: 400 });
  }

  const today = new Date();
  const fiveYearsAgo = new Date(today);
  fiveYearsAgo.setFullYear(today.getFullYear() - 5);
  const fmt = (d: Date) =>
    `${d.getFullYear()}_${String(d.getMonth() + 1).padStart(2, "0")}_${String(d.getDate()).padStart(2, "0")}`;
  const defaultPeriod = `${fmt(fiveYearsAgo)}:${fmt(today)}`;
  const data = req.nextUrl.searchParams.get("data") ?? JSON.stringify({ offset: 0, count: 15, last_interaction_period: defaultPeriod, is_follower: "true" });

  const res = await fetch(`${ZALO_API}?data=${encodeURIComponent(data)}`, {
    headers: { access_token: accessToken },
    cache: "no-store",
  });

  const json = await res.json();
  return NextResponse.json(json);
}
