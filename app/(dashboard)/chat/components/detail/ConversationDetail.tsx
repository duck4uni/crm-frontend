"use client";

import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FiSend } from "react-icons/fi";
import { assigneeOptions, Conversation } from "@/types/chat";

interface ConversationDetailProps {
  conversation: Conversation | null;
  messageInput: string;
  onChangeMessageInput: (value: string) => void;
  onSendMessage: () => void;
  onAssignConversation: (conversationId: string, assignee: string) => void;
}

export function ConversationDetail({
  conversation,
  messageInput,
  onChangeMessageInput,
  onSendMessage,
  onAssignConversation,
}: ConversationDetailProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Chi tiết hội thoại</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {conversation ? (
          <>
            <div className="flex flex-col gap-3 rounded-xl border border-gray-200 p-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <Avatar name={conversation.customerName} />
                <div>
                  <p className="font-semibold text-gray-900">{conversation.customerName}</p>
                  <p className="text-sm text-gray-500">{conversation.phone}</p>
                </div>
              </div>
              <div className="w-full md:w-56">
                <Select
                  label="Phân công"
                  value={conversation.assignee}
                  options={assigneeOptions}
                  onChange={(event) => onAssignConversation(conversation.id, event.target.value)}
                />
              </div>
            </div>

            <div className="max-h-[360px] space-y-3 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-4">
              {conversation.messages.map((message) => (
                <div
                  key={message.id}
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                    message.isMine
                      ? "ml-auto bg-blue-600 text-white"
                      : "mr-auto bg-white text-gray-800"
                  }`}
                >
                  <p>{message.content}</p>
                  <p className={`mt-1 text-xs ${message.isMine ? "text-blue-100" : "text-gray-500"}`}>
                    {message.senderName} - {message.sentAt}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                value={messageInput}
                onChange={(event) => onChangeMessageInput(event.target.value)}
                placeholder="Nhập nội dung phản hồi..."
              />
              <Button onClick={onSendMessage}>
                <FiSend className="mr-2 h-4 w-4" />
                Gửi
              </Button>
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-500">Chọn một hội thoại để xem chi tiết.</p>
        )}
      </CardContent>
    </Card>
  );
}
