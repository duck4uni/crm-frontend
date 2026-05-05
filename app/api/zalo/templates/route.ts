import { NextRequest, NextResponse } from "next/server";

// Zalo ZNS / ZBS Template Message — danh sách template của OA
// https://developers.zalo.me/docs/zbs-template-message/quan-ly-template/template-api/api-lay-danh-sach-template
const ZALO_TEMPLATE_LIST = "https://business.openapi.zalo.me/template/all";

export async function GET(req: NextRequest) {
  const accessToken = req.headers.get("x-oa-access-token");
  if (!accessToken) {
    return NextResponse.json({ error: 1, message: "Missing access token" }, { status: 400 });
  }

  const offset = req.nextUrl.searchParams.get("offset") ?? "0";
  const limit = req.nextUrl.searchParams.get("limit") ?? "100";
  const status = req.nextUrl.searchParams.get("status") ?? "ENABLE";

  const url = `${ZALO_TEMPLATE_LIST}?offset=${offset}&limit=${limit}&status=${status}`;

  const res = await fetch(url, {
    headers: { access_token: accessToken },
    cache: "no-store",
  });

  const json = await res.json();
  console.log("[Zalo /templates] response:", json);
  return NextResponse.json(json);
}
