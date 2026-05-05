import { NextRequest, NextResponse } from "next/server";

const ZALO_API = "https://openapi.zalo.me/v3.0/oa/user/update";

export async function POST(req: NextRequest) {
  const accessToken = req.headers.get("x-oa-access-token");
  if (!accessToken) {
    return NextResponse.json({ error: 1, message: "Missing access token" }, { status: 400 });
  }

  const body = await req.json();

  const res = await fetch(ZALO_API, {
    method: "POST",
    headers: {
      access_token: accessToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const json = await res.json();
  return NextResponse.json(json);
}
