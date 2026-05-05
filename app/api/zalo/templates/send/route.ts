import { NextRequest, NextResponse } from "next/server";

// Zalo Template Message via phone — POST
// https://developers.zalo.me/docs/zbs-template-message/gui-tin-template-qua-sdt/api-gui-tin-qua-sdt/api-gui-tin
const ZALO_TEMPLATE_SEND = "https://business.openapi.zalo.me/message/template";

interface ErrorEnvelope {
    success: false;
    error: {
        code: string;
        message: string;
        zaloErrorCode?: number;
        zaloMessage?: string;
    };
}

const errResponse = (
    message: string,
    code = "INVALID_REQUEST",
    zaloErrorCode?: number,
    zaloMessage?: string,
    status = 400,
): NextResponse<ErrorEnvelope> =>
    NextResponse.json(
        { success: false, error: { code, message, zaloErrorCode, zaloMessage } },
        { status },
    );

interface SendTemplateBody {
    phone?: string;
    templateId?: string;
    templateData?: Record<string, string>;
    trackingId?: string;
    mode?: "development" | "production";
}

export async function POST(req: NextRequest) {
    const accessToken = req.headers.get("x-oa-access-token");
    if (!accessToken) return errResponse("Missing access token", "MISSING_TOKEN");

    let body: SendTemplateBody;
    try {
        body = await req.json();
    } catch {
        return errResponse("Invalid JSON body");
    }

    const phone = body.phone?.trim();
    const templateId = body.templateId?.trim();
    const trackingId = body.trackingId?.trim();
    const templateData = body.templateData || {};
    const mode = body.mode === "development" ? "development" : "production";

    if (!phone) return errResponse("phone is required", "PHONE_REQUIRED");
    if (!templateId) return errResponse("templateId is required", "TEMPLATE_ID_REQUIRED");
    if (!trackingId) return errResponse("trackingId is required", "TRACKING_ID_REQUIRED");

    // Payload theo §8.1 của tài liệu
    const payload: Record<string, unknown> = {
        phone,
        template_id: templateId,
        template_data: templateData,
        tracking_id: trackingId,
    };
    if (mode === "development") {
        payload.mode = "development";
    }

    console.log("[Zalo /templates/send] payload:", payload);

    const res = await fetch(ZALO_TEMPLATE_SEND, {
        method: "POST",
        headers: {
            access_token: accessToken,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        cache: "no-store",
    });

    const data = await res.json();
    console.log("[Zalo /templates/send] response:", data);

    if (!res.ok || (data.error !== undefined && data.error !== 0)) {
        return errResponse(
            data.message || "Gửi template thất bại",
            "ZALO_TEMPLATE_SEND_FAILED",
            data.error,
            data.message,
            res.ok ? 400 : res.status,
        );
    }

    return NextResponse.json({
        success: true,
        data: {
            msgId: data.data?.msg_id || "",
            sentTime: data.data?.sent_time || Date.now().toString(),
            quota: data.data?.quota || null,
            mode,
            trackingId,
            raw_response: data,
        },
    });
}
