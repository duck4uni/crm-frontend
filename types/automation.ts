export interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  targetSegment: string;
  delayMinutes: number;
  isActive: boolean;
  lastRun: string;
}

export interface AutomationFormState {
  name: string;
  trigger: string;
  action: string;
  targetSegment: string;
  delayMinutes: string;
}

export const triggerOptions = [
  { value: "new_customer", label: "Khách hàng mới" },
  { value: "job_completed", label: "Hoàn thành công việc" },
  { value: "inactive_7d", label: "Không tương tác 7 ngày" },
];

export const actionOptions = [
  { value: "send_zalo", label: "Gửi tin Zalo" },
  { value: "create_task", label: "Tạo công việc chăm sóc" },
  { value: "assign_leader", label: "Gán cho Leader" },
];

export const segmentOptions = [
  { value: "all", label: "Toàn bộ" },
  { value: "vip", label: "Khách VIP" },
  { value: "new", label: "Khách mới" },
  { value: "inactive", label: "Khách không tương tác" },
];
