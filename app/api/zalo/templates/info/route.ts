import { NextRequest, NextResponse } from "next/server";

// Zalo ZNS / ZBS — chi tiết template (bao gồm danh sách biến `listParams`)
// Doc: https://developers.zalo.me/docs/zns/quan-ly-template/lay-thong-tin-template
//
// Endpoint chính (v2):
//   GET https://business.openapi.zalo.me/template/info/v2?template_id=xxx
// Endpoint cũ /template/info đã trả -106 Method unsupported, KHÔNG dùng.
//
// Fallback nếu v2 không trả listParams: lấy sample-data để suy ra tên biến.
//   GET https://business.openapi.zalo.me/template/sample-data?template_id=xxx
const ZALO_TEMPLATE_INFO_V2 =
  "https://business.openapi.zalo.me/template/info/v2";
const ZALO_TEMPLATE_SAMPLE_DATA =
  "https://business.openapi.zalo.me/template/sample-data";

interface ZaloEnvelope<T = unknown> {
  error: number;
  message?: string;
  data?: T;
}

async function callZalo<T = unknown>(
  url: string,
  accessToken: string,
): Promise<ZaloEnvelope<T>> {
  const res = await fetch(url, {
    headers: { access_token: accessToken },
    cache: "no-store",
  });
  try {
    return (await res.json()) as ZaloEnvelope<T>;
  } catch {
    return {
      error: res.status || 1,
      message: `Invalid JSON (HTTP ${res.status})`,
    };
  }
}

export async function GET(req: NextRequest) {
  const accessToken = req.headers.get("x-oa-access-token");
  if (!accessToken) {
    return NextResponse.json(
      { error: 1, message: "Missing access token" },
      { status: 400 },
    );
  }

  const templateId = req.nextUrl.searchParams.get("template_id");
  if (!templateId) {
    return NextResponse.json(
      { error: 1, message: "template_id is required" },
      { status: 400 },
    );
  }

  // 1) /template/info/v2
  const infoUrl = `${ZALO_TEMPLATE_INFO_V2}?template_id=${encodeURIComponent(templateId)}`;
  const info = await callZalo<{ listParams?: unknown[] }>(infoUrl, accessToken);
  console.log("[Zalo /templates/info v2] response:", info);

  if (info.error === 0 && info.data) {
    return NextResponse.json(info);
  }

  // 2) Fallback: /template/sample-data → suy ra tên biến từ keys của sample_data
  const sampleUrl = `${ZALO_TEMPLATE_SAMPLE_DATA}?template_id=${encodeURIComponent(templateId)}`;
  const sample = await callZalo<{
    sample_data?: Record<string, unknown>;
    sampleData?: Record<string, unknown>;
  }>(sampleUrl, accessToken);
  console.log("[Zalo /templates/sample-data] response:", sample);

  if (sample.error === 0 && sample.data) {
    const sd = sample.data.sample_data || sample.data.sampleData || {};
    const listParams = Object.entries(sd).map(([name, value]) => ({
      name,
      require: true,
      type: typeof value === "number" ? "NUMBER" : "STRING",
      sample: value == null ? "" : String(value),
    }));
    return NextResponse.json({
      error: 0,
      message: "Success (from sample-data fallback)",
      data: { templateId, listParams, source: "sample-data" },
    });
  }

  // 3) Cả hai đều fail — trả error gốc của v2 để frontend hiển thị
  return NextResponse.json(info, { status: 200 });
}
