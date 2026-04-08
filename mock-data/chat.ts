import { Conversation } from "@/types/chat";

export const initialConversations: Conversation[] = [
  {
    id: "conv-1",
    customerName: "Nguyen Van Khanh",
    phone: "0901231234",
    priority: "high",
    assignee: "leader-a",
    unread: 2,
    messages: [
      {
        id: "m-1",
        senderName: "Nguyen Van Khanh",
        content: "Máy lạnh nhà mình không mát, cần kiểm tra giúp.",
        sentAt: "09:10",
        isMine: false,
      },
      {
        id: "m-2",
        senderName: "Leader A",
        content: "Dạ em đã tiếp nhận, sẽ cử kỹ thuật qua trong hôm nay.",
        sentAt: "09:14",
        isMine: true,
      },
    ],
  },
  {
    id: "conv-2",
    customerName: "Tran Thi Ha",
    phone: "0915671234",
    priority: "medium",
    assignee: "staff-1",
    unread: 0,
    messages: [
      {
        id: "m-3",
        senderName: "Tran Thi Ha",
        content: "Cho mình hỏi lịch bảo trì định kỳ tháng này.",
        sentAt: "08:20",
        isMine: false,
      },
    ],
  },
];
