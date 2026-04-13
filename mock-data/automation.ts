import { AutomationRule } from "@/types/automation";
import { initialConnections, mockConversations } from "@/mock-data/zalo-oa";

const defaultOaId = initialConnections[0]?.id ?? "oa-01";
const secondaryOaId = initialConnections[1]?.id ?? defaultOaId;

const unreadByOa = mockConversations.reduce<Record<string, number>>((acc, conversation) => {
  acc[conversation.oaId] = (acc[conversation.oaId] || 0) + conversation.unreadCount;
  return acc;
}, {});

export const initialRules: AutomationRule[] = [
  {
    id: "rule-1",
    oaId: defaultOaId,
    name: "Chào mừng khách mới từ inbox OA",
    trigger: "new_customer",
    action: "send_zalo",
    targetSegment: "new",
    delayMinutes: 5,
    isActive: true,
    lastRun: "08/04/2026 10:14",
  },
  {
    id: "rule-2",
    oaId: secondaryOaId,
    name: `Nhắc bảo trì cho ${unreadByOa[secondaryOaId] || 0} hội thoại chưa đọc`,
    trigger: "job_completed",
    action: "create_task",
    targetSegment: "all",
    delayMinutes: 1440,
    isActive: true,
    lastRun: "08/04/2026 08:30",
  },
];
