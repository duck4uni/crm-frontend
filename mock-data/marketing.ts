import { Campaign } from "@/types/marketing";
import { initialConnections, mockConversations } from "@/mock-data/zalo-oa";

const primaryOaId = initialConnections[0]?.id ?? "oa-01";
const secondaryOaId = initialConnections[1]?.id ?? primaryOaId;

const conversationCountByOa = mockConversations.reduce<Record<string, number>>((acc, conversation) => {
  acc[conversation.oaId] = (acc[conversation.oaId] || 0) + 1;
  return acc;
}, {});

export const initialCampaigns: Campaign[] = [
  {
    id: "camp-1",
    name: "Khuyến mãi bảo trì đầu tháng - OA Hà Nội",
    channel: primaryOaId,
    segment: "vip",
    scheduledAt: "2026-04-09T09:00",
    message: "Ưu đãi 20% dịch vụ vệ sinh điều hòa trong tuần này.",
    status: "scheduled",
    sent: 0,
    failed: 0,
  },
  {
    id: "camp-2",
    name: "Nhắc lịch kiểm tra máy lạnh - OA miền Nam",
    channel: secondaryOaId,
    segment: "inactive",
    scheduledAt: "2026-04-08T14:00",
    message: "Đã đến lịch kiểm tra định kỳ để máy hoạt động ổn định.",
    status: "completed",
    sent: (conversationCountByOa[secondaryOaId] || 1) * 180,
    failed: Math.floor(((conversationCountByOa[secondaryOaId] || 1) * 180) * 0.04),
  },
];
