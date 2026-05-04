import type {
  OaConnection,
  ZaloChatMessage,
  ZaloConversation,
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

export async function exchangeAuthorizationCode(
  authCode: string,
  oaId?: string,
): Promise<ExchangeOaTokenResult> {
  console.group("[Zalo OA] exchangeAuthorizationCode");
  console.log("authorization_code:", authCode);

  if (!authCode) {
    console.warn("authCode rỗng");
    console.groupEnd();
    throw new Error("Authorization code rỗng.");
  }

  // Dev mock path: dùng captured code để test local không cần popup Zalo
  if (authCode === DEV_CAPTURED_OAUTH.authorizationCode) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const devToken = process.env.NEXT_PUBLIC_ZALO_DEV_ACCESS_TOKEN || "";
    const expiresIn = 90000;
    const result: ExchangeOaTokenResult = {
      oaId: DEV_CAPTURED_OAUTH.oaId,
      oaName: DEV_CAPTURED_OAUTH.oaName,
      accessToken: devToken || `mock_access_${DEV_CAPTURED_OAUTH.oaId}`,
      refreshToken: `mock_refresh_${DEV_CAPTURED_OAUTH.oaId}`,
      expiresIn,
      tokenExpiredAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
      status: "connected",
    };
    console.log("token result (dev mock):", result);
    console.groupEnd();
    return result;
  }

  // Real OAuth path: exchange code → access_token via server-side route
  console.log("real OAuth — calling /api/zalo/oauth/callback ...");
  const res = await fetch("/api/zalo/oauth/callback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code: authCode, oaId }),
  });

  const data = await res.json();
  console.log("token exchange result:", data);
  console.groupEnd();

  if (!res.ok) {
    throw new Error(data.error || "Token exchange thất bại.");
  }

  return data as ExchangeOaTokenResult;
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
    accessToken: result.accessToken,
  };
}

function formatZaloTimestamp(ms?: number): string {
  if (!ms) return "";
  const d = new Date(ms);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const time = d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  if (isToday) return time;
  const day = d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
  return `${day} ${time}`;
}

interface ZaloUserDetail {
  display_name?: string;
  avatar?: string;
  shared_info?: { phone?: string; name?: string };
  tags_and_notes_info?: { tag_names?: string[] };
}

async function fetchUserDetail(accessToken: string, userId: string): Promise<ZaloUserDetail> {
  try {
    const res = await fetch(`/api/zalo/user/detail?user_id=${encodeURIComponent(userId)}`, {
      headers: { "x-oa-access-token": accessToken },
    });
    if (!res.ok) return {};
    const json = await res.json();
    if (json.error !== 0) return {};
    return json.data as ZaloUserDetail;
  } catch {
    return {};
  }
}

export async function fetchConversations(
  accessToken: string,
  oaInternalId: string,
  offset = 0,
  count = 15,
  period = "L30D",
): Promise<ZaloConversation[]> {
  const data = JSON.stringify({
    offset,
    count,
    last_interaction_period: period,
    is_follower: "true",
  });
  const res = await fetch(`/api/zalo/conversations?data=${encodeURIComponent(data)}`, {
    headers: { "x-oa-access-token": accessToken },
  });
  if (!res.ok) throw new Error(`Conversations fetch failed: ${res.status}`);
  const json = await res.json();
  console.log("[Zalo] user/getlist response:", json);
  if (json.error !== 0) throw new Error(json.message ?? "Zalo API error");

  const users: any[] = json.data?.users ?? [];
  if (users.length === 0) return [];

  // Fetch detail for each user in parallel; failures fall back to empty detail
  const details = await Promise.allSettled(
    users.map((u) => fetchUserDetail(accessToken, String(u.user_id ?? ""))),
  );

  return users.map((item, i) => {
    const detail = details[i].status === "fulfilled" ? details[i].value : {};
    const userId = String(item.user_id ?? "");
    return {
      id: userId,
      oaId: oaInternalId,
      name: detail.display_name || `Zalo-${userId}`,
      avatar: detail.avatar || undefined,
      customerPhone: detail.shared_info?.phone,
      tags: detail.tags_and_notes_info?.tag_names ?? [],
      lastMessage: "",
      timestamp: "",
      unreadCount: 0,
    };
  });
}

export async function fetchMessages(
  accessToken: string,
  // In v2.0 this is the follower's uid (user_id), stored as conversation id
  userId: string,
  offset = 0,
  count = 20,
): Promise<ZaloChatMessage[]> {
  // v2.0 takes `user_id`, not `conversation_id`
  const data = JSON.stringify({ user_id: userId, offset, count });
  const res = await fetch(`/api/zalo/messages?data=${encodeURIComponent(data)}`, {
    headers: { "x-oa-access-token": accessToken },
  });
  if (!res.ok) throw new Error(`Messages fetch failed: ${res.status}`);
  const json = await res.json();
  console.log("[Zalo] conversation response:", json);
  if (json.error !== 0) throw new Error(json.message ?? "Zalo API error");

  const messages: any[] = json.data?.messages ?? json.data?.items ?? [];
  return messages.map((item) => ({
    id: String(item.msg_id ?? item.message_id ?? ""),
    conversationId: userId,
    sender: item.src === 1 ? "agent" : "customer",
    content: item.message ?? item.content ?? "",
    // v2.0 uses `time`, v3.0 uses `send_time`
    timestamp: formatZaloTimestamp(item.time ?? item.send_time ?? item.timestamp),
  }));
}
