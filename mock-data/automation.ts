import { AutomationRule } from "@/types/automation";

export const initialRules: AutomationRule[] = [
  {
    id: "rule-1",
    name: "Chào mừng khách mới",
    trigger: "new_customer",
    action: "send_zalo",
    targetSegment: "new",
    delayMinutes: 5,
    isActive: true,
    lastRun: "08/04/2026 10:14",
  },
  {
    id: "rule-2",
    name: "Nhắc bảo trì sau hoàn thành job",
    trigger: "job_completed",
    action: "create_task",
    targetSegment: "all",
    delayMinutes: 1440,
    isActive: true,
    lastRun: "08/04/2026 08:30",
  },
];
