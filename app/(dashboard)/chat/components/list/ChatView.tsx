"use client";

import { useMemo, useState } from "react";
import { initialConversations } from "@/mock-data/chat";
import { ChatMessage, Conversation } from "@/types/chat";
import { ConversationDetail } from "../detail/ConversationDetail";
import { ConversationList } from "./ConversationList";

export function ChatView() {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [selectedId, setSelectedId] = useState(initialConversations[0]?.id || "");
  const [search, setSearch] = useState("");
  const [messageInput, setMessageInput] = useState("");

  const filteredConversations = useMemo(
    () =>
      conversations.filter(
        (item) =>
          item.customerName.toLowerCase().includes(search.toLowerCase()) ||
          item.phone.includes(search),
      ),
    [conversations, search],
  );

  const selectedConversation = useMemo(
    () => conversations.find((item) => item.id === selectedId) || null,
    [conversations, selectedId],
  );

  const handleSendMessage = () => {
    const trimmed = messageInput.trim();
    if (!trimmed || !selectedConversation) {
      return;
    }

    const outgoing: ChatMessage = {
      id: `m-${Date.now()}`,
      senderName: "Bạn",
      content: trimmed,
      sentAt: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      isMine: true,
    };

    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === selectedConversation.id
          ? {
              ...conversation,
              messages: [...conversation.messages, outgoing],
              unread: 0,
            }
          : conversation,
      ),
    );
    setMessageInput("");
  };

  const handleAssignConversation = (conversationId: string, assignee: string) => {
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              assignee,
            }
          : conversation,
      ),
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Chat</h1>
        <p className="mt-1 text-gray-500">
          Quản lý hội thoại khách hàng, phân công xử lý và phản hồi trực tiếp.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[340px_1fr]">
        <ConversationList
          conversations={filteredConversations}
          selectedId={selectedId}
          search={search}
          onSearchChange={setSearch}
          onSelectConversation={setSelectedId}
        />

        <ConversationDetail
          conversation={selectedConversation}
          messageInput={messageInput}
          onChangeMessageInput={setMessageInput}
          onSendMessage={handleSendMessage}
          onAssignConversation={handleAssignConversation}
        />
      </div>
    </div>
  );
}
