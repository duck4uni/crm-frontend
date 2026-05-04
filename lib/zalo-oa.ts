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
  period = "L30D",
): Promise<ZaloConversation[]> {
  const PAGE_SIZE = 50;
  const allUsers: { user_id: string }[] = [];
  let offset = 0;
  let total = Infinity;

  while (offset < total) {
    const data = JSON.stringify({
      offset,
      count: PAGE_SIZE,
      last_interaction_period: period,
      is_follower: "true",
    });
    const res = await fetch(`/api/zalo/conversations?data=${encodeURIComponent(data)}`, {
      headers: { "x-oa-access-token": accessToken },
    });
    if (!res.ok) throw new Error(`Conversations fetch failed: ${res.status}`);
    const json = await res.json();
    if (json.error !== 0) throw new Error(json.message ?? "Zalo API error");

    const page: { user_id: string }[] = json.data?.users ?? [];
    total = json.data?.total ?? 0;
    allUsers.push(...page);
    offset += page.length;

    if (page.length === 0) break;
  }

  if (allUsers.length === 0) return [];

  // Fetch detail in batches of 10 to avoid overwhelming the API
  const BATCH = 10;
  const details: ZaloUserDetail[] = [];
  for (let i = 0; i < allUsers.length; i += BATCH) {
    const results = await Promise.allSettled(
      allUsers.slice(i, i + BATCH).map((u) => fetchUserDetail(accessToken, String(u.user_id))),
    );
    details.push(...results.map((r) => (r.status === "fulfilled" ? r.value : {})));
  }

  return allUsers.map((item, i) => {
    const detail = details[i] ?? {};
    const userId = String(item.user_id);
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

  const messages: { msg_id?: string | number; message_id?: string | number; src?: number; message?: string; content?: string; time?: number; send_time?: number; timestamp?: number; type?: string; url?: string; thumb?: string; file_name?: string }[] = json.data?.messages ?? json.data?.items ?? [];
  return messages.map((item) => {
    const id = String(item.msg_id ?? item.message_id ?? "");
    const messageType: ZaloChatMessage["messageType"] =
      item.type === "image" || item.type === "photo" ? "image"
      : item.type === "file" ? "file"
      : "text";
    return {
      id,
      conversationId: userId,
      sender: (item.src === 1 ? "agent" : "customer") as ZaloChatMessage["sender"],
      content: item.message ?? item.content ?? "",
      timestamp: formatZaloTimestamp(item.time ?? item.send_time ?? item.timestamp),
      messageType,
      sendStatus: "sent" as const,
      zaloMessageId: id,
      attachmentUrl: messageType !== "text" ? item.url || item.thumb : undefined,
      attachmentName: messageType === "file" ? item.file_name : undefined,
    };
  });
}

// ─────────────────────────────────────────────────────────────────────
// Send Message helpers (theo Tai_lieu_gui_tin_nhan_Zalo_OA_API.docx)
// ─────────────────────────────────────────────────────────────────────

export class ZaloApiError extends Error {
  code: string;
  zaloErrorCode?: number;
  zaloMessage?: string;

  constructor(message: string, code: string, zaloErrorCode?: number, zaloMessage?: string) {
    super(message);
    this.name = "ZaloApiError";
    this.code = code;
    this.zaloErrorCode = zaloErrorCode;
    this.zaloMessage = zaloMessage;
  }
}

/** Map Zalo error code → mã lỗi nội bộ + message tiếng Việt theo §8.2 */
function mapZaloError(zaloErrorCode: number | undefined, zaloMessage?: string): ZaloApiError {
  switch (zaloErrorCode) {
    case -212:
      return new ZaloApiError(
        "App chưa đăng ký quyền API. Vui lòng liên hệ admin để cấp quyền.",
        "ZALO_APP_NOT_REGISTERED_API",
        zaloErrorCode,
        zaloMessage,
      );
    case -224:
      return new ZaloApiError(
        "OA chưa đủ gói để gửi loại tin này.",
        "OA_PACKAGE_NOT_ELIGIBLE",
        zaloErrorCode,
        zaloMessage,
      );
    case -213:
    case -216:
      return new ZaloApiError(
        "Khách hàng không đủ điều kiện nhận tin tư vấn (đã quá 48h chưa tương tác).",
        "USER_NOT_ELIGIBLE",
        zaloErrorCode,
        zaloMessage,
      );
    case -32: // token expired
      return new ZaloApiError(
        "Access token đã hết hạn, vui lòng kết nối lại OA.",
        "TOKEN_EXPIRED",
        zaloErrorCode,
        zaloMessage,
      );
    default:
      return new ZaloApiError(
        zaloMessage || "Gửi tin thất bại.",
        "ZALO_API_ERROR",
        zaloErrorCode,
        zaloMessage,
      );
  }
}

interface SendMessageResult {
  msgId: string;
  sentAt: string;
  attachmentUrl?: string;
  attachmentName?: string;
}

async function postZaloApi(url: string, accessToken: string, body: object): Promise<SendMessageResult> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-oa-access-token": accessToken,
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  console.log(`[Zalo Send] ${url} response:`, json);

  if (!res.ok || !json.success) {
    const err = json.error || {};
    throw mapZaloError(err.zaloErrorCode, err.message || err.zaloMessage);
  }

  return {
    msgId: json.data?.message_id || json.data?.msg_id || "",
    sentAt: json.data?.sentAt || new Date().toISOString(),
    attachmentUrl: json.data?.attachmentUrl,
    attachmentName: json.data?.attachmentName,
  };
}

async function postMultipartZaloApi(
  url: string,
  accessToken: string,
  formData: FormData,
): Promise<SendMessageResult> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "x-oa-access-token": accessToken,
    },
    body: formData,
  });
  const json = await res.json();
  console.log(`[Zalo Send Multipart] ${url} response:`, json);

  if (!res.ok || !json.success) {
    const err = json.error || {};
    throw mapZaloError(err.zaloErrorCode, err.message || err.zaloMessage);
  }

  return {
    msgId: json.data?.message_id || json.data?.msg_id || "",
    sentAt: json.data?.sentAt || new Date().toISOString(),
    attachmentUrl: json.data?.attachmentUrl,
    attachmentName: json.data?.attachmentName,
  };
}

export interface SendTextParams {
  accessToken: string;
  userId: string;
  text: string;
}

export async function sendTextMessage(params: SendTextParams): Promise<SendMessageResult> {
  return postZaloApi("/api/zalo/messages/text", params.accessToken, {
    userId: params.userId,
    text: params.text,
  });
}

export interface SendImageParams {
  accessToken: string;
  userId: string;
  file: File;
  text?: string;
}

export async function sendImageMessage(params: SendImageParams): Promise<SendMessageResult> {
  const fd = new FormData();
  fd.append("file", params.file);
  fd.append("userId", params.userId);
  if (params.text) fd.append("text", params.text);
  return postMultipartZaloApi("/api/zalo/messages/image", params.accessToken, fd);
}

export interface SendFileParams {
  accessToken: string;
  userId: string;
  file: File;
  text?: string;
}

export async function sendFileMessage(params: SendFileParams): Promise<SendMessageResult> {
  const fd = new FormData();
  fd.append("file", params.file);
  fd.append("userId", params.userId);
  if (params.text) fd.append("text", params.text);
  return postMultipartZaloApi("/api/zalo/messages/file", params.accessToken, fd);
}

export interface SendQuoteParams {
  accessToken: string;
  userId: string;
  text: string;
  quoteMessageId: string;
}

export async function sendQuoteMessage(params: SendQuoteParams): Promise<SendMessageResult> {
  return postZaloApi("/api/zalo/messages/quote", params.accessToken, {
    userId: params.userId,
    text: params.text,
    quoteMessageId: params.quoteMessageId,
  });
}
