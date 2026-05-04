export type OaConnectionStatus = "connected" | "expired" | "revoked" | "disconnected";

export interface OaConnection {
  id: string;
  oaName: string;
  oaOfficialId: string;
  owner: string;
  followers: number;
  syncedCustomers: number;
  isActive: boolean;
  lastSyncAt: string;
  status?: OaConnectionStatus;
  tokenExpiredAt?: string;
  accessToken?: string;
}

export type OaConnectStep =
  | "idle"
  | "connecting"
  | "exchanging"
  | "success"
  | "templates"
  | "send"
  | "sent"
  | "error";

export type ZbsTemplateStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "rejected"
  | "inactive";

export interface ZbsTemplateParam {
  name: string;
  type: "string" | "number" | "datetime";
  required: boolean;
  sample: string;
}

export interface ZbsTemplate {
  id: string;
  oaId: string;
  templateId: string;
  templateCode: string;
  templateName: string;
  templateType: string;
  status: ZbsTemplateStatus;
  previewContent: string;
  params: ZbsTemplateParam[];
  lastSyncedAt: string;
}

export interface ZbsSendByPhoneRequest {
  oaId: string;
  templateCode: string;
  phone: string;
  templateData: Record<string, string>;
  trackingId: string;
}

export interface ZbsSendByPhoneResult {
  msgId: string;
  trackingId: string;
  status: "pending" | "success" | "failed";
  sentAt: string;
  quotaRemaining?: number;
  errorMessage?: string;
}

export interface ZaloConversation {
  id: string;
  oaId: string;
  name: string;
  avatar?: string;
  customerPhone?: string;
  tags?: string[];
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

export type ZaloChatSender = "customer" | "agent" | "system";

export type ZaloMessageType = "text" | "image" | "file" | "quote";

export type ZaloSendStatus = "pending" | "sent" | "failed";

export interface ZaloQuotePreview {
  sender: ZaloChatSender;
  content: string;
  messageType?: ZaloMessageType;
}

export interface ZaloChatMessage {
  id: string;
  conversationId: string;
  sender: ZaloChatSender;
  content: string;
  timestamp: string;
  messageType?: ZaloMessageType;
  sendStatus?: ZaloSendStatus;
  errorMessage?: string;
  zaloMessageId?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentSize?: number;
  quoteMessageId?: string;
  quotePreview?: ZaloQuotePreview;
}

export interface AutoConfig {
  id: string;
  oaName: string;
  createdBy: string;
  createdByRole: string;
  createdAt: string;
}

export interface AutoConfigFormState {
  oaId: string;
  showCrmUsername: boolean;
  autoCreateOpportunity: boolean;
}

export const leaderOptions = [
  { value: "leader-a", label: "Leader A" },
  { value: "leader-b", label: "Leader B" },
  { value: "owner", label: "Owner" },
];

export const ownerLabelMap: Record<string, string> = {
  "leader-a": "Leader A",
  "leader-b": "Leader B",
  owner: "Owner",
};
