export type CampaignStatus = "draft" | "scheduled" | "running" | "completed";

export interface Campaign {
  id: string;
  name: string;
  channel: string;
  segment: string;
  scheduledAt: string;
  message: string;
  status: CampaignStatus;
  sent: number;
  failed: number;
  templateCode?: string;
  templateName?: string;
  recipientsCount?: number;
}

export interface CampaignFormState {
  name: string;
  channel: string;
  segment: string;
  scheduledAt: string;
  message: string;
  templateCode: string;
}

export const statusVariant: Record<CampaignStatus, "default" | "info" | "warning" | "success"> = {
  draft: "default",
  scheduled: "info",
  running: "warning",
  completed: "success",
};

export const statusLabel: Record<CampaignStatus, string> = {
  draft: "Nháp",
  scheduled: "Đã lịch",
  running: "Đang gửi",
  completed: "Hoàn tất",
};

export const segmentOptions = [
  { value: "vip", label: "Khách VIP" },
  { value: "new", label: "Khách mới" },
  { value: "inactive", label: "Khách lâu chưa tương tác" },
];

export const channelOptions = [
  { value: "zalo_oa_hn", label: "Zalo OA Hà Nội" },
  { value: "zalo_oa_hcm", label: "Zalo OA Hồ Chí Minh" },
];
