"use client";

import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { FiSearch } from "react-icons/fi";
import { assigneeLabelMap, Conversation } from "@/types/chat";

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string;
  search: string;
  onSearchChange: (value: string) => void;
  onSelectConversation: (conversationId: string) => void;
}

export function ConversationList({
  conversations,
  selectedId,
  search,
  onSearchChange,
  onSelectConversation,
}: ConversationListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Danh sách hội thoại</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="relative">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Tìm theo tên hoặc số điện thoại"
            className="pl-9"
          />
        </div>

        <div className="space-y-2">
          {conversations.map((conversation) => {
            const isActive = conversation.id === selectedId;
            return (
              <button
                key={conversation.id}
                type="button"
                onClick={() => onSelectConversation(conversation.id)}
                className={`w-full rounded-lg border p-3 text-left transition ${
                  isActive
                    ? "border-primary-300 bg-primary-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-start justify-between">
                  <p className="font-semibold text-gray-900">{conversation.customerName}</p>
                  {conversation.unread > 0 ? (
                    <Badge variant="danger">{conversation.unread}</Badge>
                  ) : null}
                </div>
                <p className="text-xs text-gray-500">{conversation.phone}</p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant={conversation.priority === "high" ? "warning" : "info"}>
                    {conversation.priority === "high" ? "Ưu tiên cao" : "Ưu tiên vừa"}
                  </Badge>
                  <Badge variant="default">{assigneeLabelMap[conversation.assignee]}</Badge>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
