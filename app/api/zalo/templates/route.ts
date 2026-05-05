import { NextRequest, NextResponse } from "next/server";

// Zalo ZNS / ZBS Template Message — danh sách template của OA
// https://developers.zalo.me/docs/zbs-template-message/quan-ly-template/template-api/api-lay-danh-sach-template
const ZALO_TEMPLATE_LIST = "https://business.openapi.zalo.me/template/all";

export async function GET(req: NextRequest) {
  const accessToken = req.headers.get("x-oa-access-token");
  if (!accessToken) {
    return NextResponse.json({ error: 1, message: "Missing access token" }, { status: 400 });
  }

  // Theo spec Zalo: status là INT (1=Enable, 2=Pending review, 3=Reject, 4=Disable).
  // Nếu KHÔNG truyền status thì API trả về tất cả trạng thái.
  // filterPreset: 0=tất cả OA, 1=chỉ template do app này tạo.
  const offset = req.nextUrl.searchParams.get("offset") ?? "0";
  const limit = req.nextUrl.searchParams.get("limit") ?? "100";
  const status = req.nextUrl.searchParams.get("status"); // optional int as string
  const filterPreset = req.nextUrl.searchParams.get("filterPreset");

  const params = new URLSearchParams({ offset, limit });
  if (status) params.set("status", status);
  if (filterPreset) params.set("filterPreset", filterPreset);

  const url = `${ZALO_TEMPLATE_LIST}?${params.toString()}`;

  const res = await fetch(url, {
    headers: { access_token: accessToken },
    cache: "no-store",
  });

  const json = await res.json();
  console.log("[Zalo /templates] response:", json);
  return NextResponse.json(json);
}
