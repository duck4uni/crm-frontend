"use client";

import type { ZaloChatMessage } from "@/types/zalo-oa";

interface ChatMessageRowProps {
    message: ZaloChatMessage;
}

export function ChatMessageRow({ message }: ChatMessageRowProps) {
    if (message.sender === "system") {
        return (
            <div className="flex justify-center">
                <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] text-gray-500">
                    {message.content}
                </span>
            </div>
        );
    }

    const isAgent = message.sender === "agent";

    return (
        <div className={`flex ${isAgent ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] ${isAgent ? "items-end" : "items-start"} flex flex-col gap-1`}>
                <div
                    className={`rounded-2xl px-3 py-2 text-sm leading-relaxed ${isAgent ? "bg-primary-600 text-white rounded-br-md" : "bg-white text-gray-800 rounded-bl-md border border-gray-200"
                        }`}
                >
                    {message.content}
                </div>
                <span className="text-[11px] text-gray-400">{message.timestamp}</span>
            </div>
        </div>
    );
}
