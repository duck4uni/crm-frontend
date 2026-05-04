import { NextRequest, NextResponse } from "next/server";

const ZALO_UPLOAD_IMAGE = "https://openapi.zalo.me/v2.0/oa/upload/image";
const ZALO_CS_API = "https://openapi.zalo.me/v3.0/oa/message/cs";

const errResponse = (
  message: string,
  code = "INVALID_REQUEST",
  zaloErrorCode?: number,
  zaloMessage?: string,
  status = 400,
) =>
  NextResponse.json(
    { success: false, error: { code, message, zaloErrorCode, zaloMessage } },
    { status },
  );

export async function POST(req: NextRequest) {
  const accessToken = req.headers.get("x-oa-access-token");
  if (!accessToken) return errResponse("Missing access token", "MISSING_TOKEN");

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return errResponse("Invalid multipart body");
  }

  const file = formData.get("file");
  const userId = (formData.get("userId") as string | null)?.trim();
  const text = (formData.get("text") as string | null)?.trim() || undefined;

  if (!(file instanceof File)) return errResponse("file is required");
  if (!userId) return errResponse("userId is required");
  if (!file.type.startsWith("image/")) return errResponse("file must be an image");
  if (file.size > 5 * 1024 * 1024) {
    return errResponse("Ảnh vượt quá 5MB", "FILE_TOO_LARGE");
  }

  // Step 1: Upload ảnh lên Zalo
  const uploadFd = new FormData();
  uploadFd.append("file", file);

  console.log("[Zalo /messages/image] uploading...", { name: file.name, size: file.size });

  const uploadRes = await fetch(ZALO_UPLOAD_IMAGE, {
    method: "POST",
    headers: { access_token: accessToken },
    body: uploadFd,
    cache: "no-store",
  });

  const uploadData = await uploadRes.json();
  console.log("[Zalo /messages/image] upload response:", uploadData);

  if (!uploadRes.ok || (uploadData.error !== undefined && uploadData.error !== 0)) {
    return errResponse(
      uploadData.message || "Upload ảnh thất bại",
      "UPLOAD_FAILED",
      uploadData.error,
      uploadData.message,
      uploadRes.ok ? 400 : uploadRes.status,
    );
  }

  const attachmentId = uploadData.data?.attachment_id;
  const attachmentUrl = uploadData.data?.url;
  if (!attachmentId) {
    return errResponse("Zalo không trả về attachment_id", "UPLOAD_NO_ATTACHMENT_ID");
  }

  // Step 2: Gửi tin tư vấn kèm ảnh
  // Theo doc Zalo: payload dùng template type "media" với element type "image" + attachment_id
  const payload = {
    recipient: { user_id: userId },
    message: {
      text: text || "",
      attachment: {
        type: "template",
        payload: {
          template_type: "media",
          elements: [
            {
              media_type: "image",
              attachment_id: attachmentId,
            },
          ],
        },
      },
    },
  };

  console.log("[Zalo /messages/image] send payload:", payload);

  const sendRes = await fetch(ZALO_CS_API, {
    method: "POST",
    headers: {
      access_token: accessToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const sendData = await sendRes.json();
  console.log("[Zalo /messages/image] send response:", sendData);

  if (!sendRes.ok || (sendData.error !== undefined && sendData.error !== 0)) {
    return errResponse(
      sendData.message || "Gửi ảnh thất bại sau khi upload",
      "SEND_FAILED",
      sendData.error,
      sendData.message,
      sendRes.ok ? 400 : sendRes.status,
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      message_id: sendData.data?.message_id || "",
      sentAt: new Date().toISOString(),
      attachmentUrl,
      attachmentName: file.name,
    },
  });
}
