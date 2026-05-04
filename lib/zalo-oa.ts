import type {
  OaConnection,
  ZbsSendByPhoneRequest,
  ZbsSendByPhoneResult,
  ZbsTemplate,
} from "@/types/zalo-oa";

export const ZALO_OAUTH_PERMISSION_URL = "https://oauth.zaloapp.com/v4/oa/permission";

export function getZaloAppId(): string {
  return process.env.NEXT_PUBLIC_ZALO_APP_ID || "";
}

export function buildZaloOAuthUrl(params: { appId: string; redirectUri: string; state: string }): string {
  const search = new URLSearchParams({
    app_id: params.appId,
    redirect_uri: params.redirectUri,
    state: params.state,
  });
  return `${ZALO_OAUTH_PERMISSION_URL}?${search.toString()}`;
}

export interface ExchangeOaTokenResult {
  oaId: string;
  oaName: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenExpiredAt: string;
  status: "connected";
}

// ─────────────────────────────────────────────────────────────────────
// DEV FIXTURE: payload thật captured từ Zalo OAuth (môi trường Vercel)
// Dùng để mock ở local cho ra OA giống prod, tiện test luồng template/gửi tin.
// LƯU Ý: authorization_code thật của Zalo chỉ sống ~5 phút và chỉ dùng được 1 lần.
// Mã dưới đây CHỈ để tham chiếu, KHÔNG còn đổi được token thật nữa.
// ─────────────────────────────────────────────────────────────────────
export const DEV_CAPTURED_OAUTH = {
  authorizationCode:
    "4_2A0n8Gyq9vyxb3A1NM3XVaidnA6E1pME33JdqIX5zDnUma52Ec87-oycrMUQuI38Rm6nf5gXCteC4ACNUiS6sHuN8qOB4tAvRySafeeNr4b8zBHtBzV7Ibb54vPlKiDyt314HKWNS5gyjXSWo_032fXpb_6_vA8kUoGMCM_HfAsgjyNIFrQrsidnuS6uDYVxQpL3rH_5DoivKtHG2m9J22bZSm8ELPUDBf9HfVtqvNpiiCMNBnPtU-gmyuC-5a7QwQ1r4EkBvYwE3SVTgSAHWvzrqozTeANGwG8Np0ZWHIKibTXRVksHqCikTytJPA6j1R37KV46CLXYaZ70P7RaEvE7a48cm6JADY0WHuIc0vadG0MIPU0f8jEYp16W",
  oaId: "1298383097840805544",
  oaName: "Công nghệ MeU Solutions Official",
  state: "oa_1777714810253",
  appId: "3349983058126902532",
  redirectUri: "https://crm-frontend-nine-mu.vercel.app/zalo-oa/callback",
  capturedAt: "2026-05-02",
} as const;

// Simulates calling backend `/api/zalo/oauth/callback` which exchanges
// authorization_code for OA access_token + refresh_token and returns OA info.
// Replace with a real fetch when backend is ready.
export async function exchangeAuthorizationCode(authCode: string): Promise<ExchangeOaTokenResult> {
  console.group("[Zalo OA] exchangeAuthorizationCode");
  console.log("authorization_code:", authCode);

  await new Promise((resolve) => setTimeout(resolve, 800));

  if (!authCode) {
    console.warn("authCode rỗng — throw error");
    console.groupEnd();
    throw new Error("Authorization code rỗng.");
  }

  // Nếu đang dùng captured code (test local) thì trả về OA thật đã capture
  const useCaptured = authCode === DEV_CAPTURED_OAUTH.authorizationCode;
  const oaId = useCaptured ? DEV_CAPTURED_OAUTH.oaId : Date.now().toString().slice(-12);
  const oaName = useCaptured ? DEV_CAPTURED_OAUTH.oaName : `OA mới ${oaId.slice(-4)}`;

  const expiresIn = 90000;
  const tokenExpiredAt = new Date(Date.now() + expiresIn * 1000).toISOString();

  const result: ExchangeOaTokenResult = {
    oaId,
    oaName,
    accessToken: `mock_access_${oaId}`,
    refreshToken: `mock_refresh_${oaId}`,
    expiresIn,
    tokenExpiredAt,
    status: "connected",
  };

  console.log("token result (mock):", result);
  console.log("👉 Khi backend sẵn, thay hàm này bằng fetch POST /api/zalo/oauth/callback với { code: authCode }");
  console.groupEnd();

  return result;
}

// Simulates GET /api/zalo/templates?oaId={oaId}
export async function fetchOaTemplates(oaId: string): Promise<ZbsTemplate[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const now = new Date().toLocaleString("vi-VN", { hour12: false });
  return [
    {
      id: `tpl-${oaId}-01`,
      oaId,
      templateId: "1023456",
      templateCode: "ORDER_CONFIRMED",
      templateName: "Xác nhận đơn hàng",
      templateType: "Giao dịch",
      status: "approved",
      previewContent:
        "Chào {{customer_name}}, đơn hàng {{order_code}} trị giá {{amount}}đ đã được xác nhận. Cảm ơn quý khách!",
      params: [
        { name: "customer_name", type: "string", required: true, sample: "Nguyễn Văn A" },
        { name: "order_code", type: "string", required: true, sample: "DH001" },
        { name: "amount", type: "string", required: true, sample: "250000" },
      ],
      lastSyncedAt: now,
    },
    {
      id: `tpl-${oaId}-02`,
      oaId,
      templateId: "1023457",
      templateCode: "APPOINTMENT_REMIND",
      templateName: "Nhắc lịch hẹn dịch vụ",
      templateType: "Chăm sóc",
      status: "approved",
      previewContent:
        "Chào {{customer_name}}, lịch hẹn của bạn vào {{appointment_time}} tại {{address}}. Vui lòng có mặt đúng giờ.",
      params: [
        { name: "customer_name", type: "string", required: true, sample: "Nguyễn Văn A" },
        { name: "appointment_time", type: "datetime", required: true, sample: "08:30 ngày 02/05/2026" },
        { name: "address", type: "string", required: true, sample: "12 Lê Lợi, Quận 1" },
      ],
      lastSyncedAt: now,
    },
    {
      id: `tpl-${oaId}-03`,
      oaId,
      templateId: "1023458",
      templateCode: "PAYMENT_RECEIVED",
      templateName: "Xác nhận thanh toán",
      templateType: "Giao dịch",
      status: "pending_review",
      previewContent:
        "Đã nhận thanh toán {{amount}}đ cho hóa đơn {{invoice_code}}. Cảm ơn {{customer_name}}.",
      params: [
        { name: "customer_name", type: "string", required: true, sample: "Nguyễn Văn A" },
        { name: "invoice_code", type: "string", required: true, sample: "HD2026-0001" },
        { name: "amount", type: "string", required: true, sample: "1500000" },
      ],
      lastSyncedAt: now,
    },
    {
      id: `tpl-${oaId}-04`,
      oaId,
      templateId: "1023459",
      templateCode: "PROMOTION_VOUCHER",
      templateName: "Tặng voucher khuyến mãi",
      templateType: "Hậu mãi",
      status: "rejected",
      previewContent:
        "{{customer_name}} ơi, tặng bạn voucher {{voucher_code}} giảm {{discount}} cho đơn hàng tiếp theo.",
      params: [
        { name: "customer_name", type: "string", required: true, sample: "Nguyễn Văn A" },
        { name: "voucher_code", type: "string", required: true, sample: "SALE10" },
        { name: "discount", type: "string", required: true, sample: "10%" },
      ],
      lastSyncedAt: now,
    },
  ];
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("84")) return digits;
  if (digits.startsWith("0")) return `84${digits.slice(1)}`;
  return digits;
}

// Simulates POST /api/zalo/messages/send-by-phone
export async function sendTemplateByPhone(
  payload: ZbsSendByPhoneRequest,
): Promise<ZbsSendByPhoneResult> {
  await new Promise((resolve) => setTimeout(resolve, 700));

  const normalized = normalizePhone(payload.phone);
  if (normalized.length < 11 || !normalized.startsWith("84")) {
    return {
      msgId: "",
      trackingId: payload.trackingId,
      status: "failed",
      sentAt: new Date().toISOString(),
      errorMessage: "Số điện thoại không hợp lệ.",
    };
  }

  return {
    msgId: `msg_${Date.now()}`,
    trackingId: payload.trackingId,
    status: "success",
    sentAt: new Date().toISOString(),
    quotaRemaining: 998,
  };
}

export function buildOaConnectionFromToken(result: ExchangeOaTokenResult): OaConnection {
  return {
    id: `oa-${result.oaId}`,
    oaName: result.oaName,
    oaOfficialId: result.oaId,
    owner: "owner",
    followers: 0,
    syncedCustomers: 0,
    isActive: true,
    lastSyncAt: new Date().toLocaleString("vi-VN", { hour12: false }),
    status: result.status,
    tokenExpiredAt: result.tokenExpiredAt,
  };
}
