export interface ChatMessage {
  id: string;
  senderName: string;
  content: string;
  sentAt: string;
  isMine: boolean;
}

export interface Conversation {
  id: string;
  customerName: string;
  phone: string;
  priority: "high" | "medium";
  assignee: string;
  unread: number;
  messages: ChatMessage[];
}

export const assigneeOptions = [
  { value: "leader-a", label: "Leader A" },
  { value: "leader-b", label: "Leader B" },
  { value: "staff-1", label: "Thợ 1" },
  { value: "staff-2", label: "Thợ 2" },
];

export const assigneeLabelMap: Record<string, string> = {
  "leader-a": "Leader A",
  "leader-b": "Leader B",
  "staff-1": "Thợ 1",
  "staff-2": "Thợ 2",
};
