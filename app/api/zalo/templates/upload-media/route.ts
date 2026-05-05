import { NextRequest, NextResponse } from "next/server";

// Zalo Business API — upload ảnh để lấy media_id cho HEADER template
// https://business.openapi.zalo.me/template/upload-image
const ZALO_UPLOAD_IMAGE =
  "https://business.openapi.zalo.me/template/upload-image";

export async function POST(req: NextRequest) {
  const accessToken = req.headers.get("x-oa-access-token");
  if (!accessToken) {
    return NextResponse.json(
      { error: 1, message: "Missing access token" },
      { status: 400 },
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { error: 1, message: "Invalid multipart form data" },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json(
      { error: 1, message: "Missing file in form data" },
      { status: 400 },
    );
  }

  const upstream = new FormData();
  upstream.append("file", file);

  const res = await fetch(ZALO_UPLOAD_IMAGE, {
    method: "POST",
    headers: { access_token: accessToken },
    body: upstream,
  });

  const json = await res.json();
  console.log("[Zalo /templates/upload-media] response:", json);
  return NextResponse.json(json);
}
