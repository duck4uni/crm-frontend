import { NextRequest, NextResponse } from "next/server";

const ZALO_TEMPLATE_CREATE = "https://business.openapi.zalo.me/template/create";

export async function POST(req: NextRequest) {
  const accessToken = req.headers.get("x-oa-access-token");
  if (!accessToken) {
    return NextResponse.json({ error: 1, message: "Missing access token" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 1, message: "Invalid JSON body" }, { status: 400 });
  }

  const res = await fetch(ZALO_TEMPLATE_CREATE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      access_token: accessToken,
    },
    body: JSON.stringify(body),
  });

  const json = await res.json();
  console.log("[Zalo /templates/create] response:", json);
  return NextResponse.json(json);
}
