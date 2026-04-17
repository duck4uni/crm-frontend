"use client";

import Image from "next/image";
import { FiSend } from "react-icons/fi";
import type { ZaloChatMessage, ZaloConversation } from "@/types/zalo-oa";
import { ChatMessageRow } from "./ChatMessageRow";
import { EmptyState } from "./EmptyState";

interface ZaloInteractionPanelProps {
    selectedConversation: ZaloConversation | null;
    selectedOaName: string;
    selectedMessages: ZaloChatMessage[];
    chatComposerValue: string;
    onChatComposerValueChange: (value: string) => void;
    onSendMessage: () => void;
}

export function ZaloInteractionPanel({
    selectedConversation,
    selectedOaName,
    selectedMessages,
    chatComposerValue,
    onChatComposerValueChange,
    onSendMessage,
}: ZaloInteractionPanelProps) {
    if (!selectedConversation) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <EmptyState />
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col">
            <div className="flex items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="relative h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {selectedConversation.avatar ? (
                            <Image
                                src={selectedConversation.avatar}
                                alt={selectedConversation.name}
                                fill
                                sizes="40px"
                                className="object-cover"
                                unoptimized
                            />
                        ) : (
                            <span className="text-white text-sm font-semibold select-none">Z</span>
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{selectedConversation.name}</p>
                        <p className="text-xs text-gray-500 truncate">
                            {selectedConversation.customerPhone || "Chưa có số điện thoại"}
                            {selectedOaName ? ` • ${selectedOaName}` : ""}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {selectedMessages.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center pt-8">Chưa có tin nhắn trong hội thoại này.</p>
                ) : (
                    selectedMessages.map((message) => (
                        <ChatMessageRow key={message.id} message={message} />
                    ))
                )}
            </div>

            <div className="border-t border-gray-200 bg-white p-3">
                <div className="flex items-end gap-2">
                    <textarea
                        value={chatComposerValue}
                        onChange={(event) => onChatComposerValueChange(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter" && !event.shiftKey) {
                                event.preventDefault();
                                onSendMessage();
                            }
                        }}
                        placeholder="Nhập nội dung tin nhắn..."
                        rows={2}
                        className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                    />
                    <button
                        type="button"
                        onClick={onSendMessage}
                        disabled={!chatComposerValue.trim()}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Gửi tin nhắn"
                    >
                        <FiSend className="h-4 w-4" />
                    </button>
                </div>
                <p className="mt-2 text-[11px] text-gray-400">Nhấn Enter để gửi, Shift + Enter để xuống dòng.</p>
            </div>
        </div>
    );
}
