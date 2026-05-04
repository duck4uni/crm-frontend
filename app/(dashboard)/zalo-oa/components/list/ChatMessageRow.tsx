"use client";

import { useState } from "react";
import {
    FiAlertCircle,
    FiCheck,
    FiCornerUpLeft,
    FiDownload,
    FiFile,
    FiRefreshCw,
} from "react-icons/fi";
import type { ZaloChatMessage } from "@/types/zalo-oa";

interface ChatMessageRowProps {
    message: ZaloChatMessage;
    onQuote?: (message: ZaloChatMessage) => void;
    onRetry?: (messageId: string) => void;
}

const formatBytes = (bytes?: number): string => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export function ChatMessageRow({ message, onQuote, onRetry }: ChatMessageRowProps) {
    const [showImagePreview, setShowImagePreview] = useState(false);

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
    const messageType = message.messageType || "text";
    const sendStatus = message.sendStatus;
    const hasError = sendStatus === "failed";
    const isPending = sendStatus === "pending";

    const bubbleBase = isAgent
        ? "bg-primary-600 text-white rounded-br-md"
        : "bg-white text-gray-800 rounded-bl-md border border-gray-200";

    const renderQuotePreview = () => {
        if (!message.quotePreview) return null;
        return (
            <div
                className={`mb-1 rounded-lg border-l-4 px-2 py-1.5 text-xs ${
                    isAgent
                        ? "border-white/40 bg-white/15"
                        : "border-primary-300 bg-primary-50/50"
                }`}
            >
                <p className={`text-[10px] font-semibold ${isAgent ? "text-white/80" : "text-primary-700"}`}>
                    {message.quotePreview.sender === "agent" ? "Bạn" : "Khách hàng"}
                </p>
                <p className={`truncate ${isAgent ? "text-white/90" : "text-gray-600"}`}>
                    {message.quotePreview.content || "[Tệp đính kèm]"}
                </p>
            </div>
        );
    };

    const renderContent = () => {
        if (messageType === "image" && message.attachmentUrl) {
            return (
                <div className="space-y-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={message.attachmentUrl}
                        alt={message.attachmentName || "image"}
                        onClick={() => setShowImagePreview(true)}
                        className="max-h-64 max-w-full rounded-lg cursor-zoom-in object-cover"
                    />
                    {message.content && <p className="text-sm whitespace-pre-line">{message.content}</p>}
                </div>
            );
        }

        if (messageType === "file") {
            return (
                <div className="space-y-1">
                    <div
                        className={`flex items-center gap-2 rounded-lg border px-2 py-2 ${
                            isAgent
                                ? "border-white/30 bg-white/10"
                                : "border-gray-200 bg-gray-50"
                        }`}
                    >
                        <div
                            className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded ${
                                isAgent ? "bg-white/20" : "bg-primary-100 text-primary-700"
                            }`}
                        >
                            <FiFile className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className={`text-xs font-medium truncate ${isAgent ? "text-white" : "text-gray-800"}`}>
                                {message.attachmentName || "File"}
                            </p>
                            {message.attachmentSize ? (
                                <p className={`text-[10px] ${isAgent ? "text-white/70" : "text-gray-500"}`}>
                                    {formatBytes(message.attachmentSize)}
                                </p>
                            ) : null}
                        </div>
                        {message.attachmentUrl && (
                            <a
                                href={message.attachmentUrl}
                                target="_blank"
                                rel="noreferrer"
                                className={isAgent ? "text-white/80 hover:text-white" : "text-primary-600 hover:text-primary-700"}
                                title="Tải xuống"
                            >
                                <FiDownload className="h-3.5 w-3.5" />
                            </a>
                        )}
                    </div>
                    {message.content && <p className="text-sm whitespace-pre-line">{message.content}</p>}
                </div>
            );
        }

        // text & quote
        return <span className="whitespace-pre-line">{message.content}</span>;
    };

    return (
        <div className={`group flex ${isAgent ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] ${isAgent ? "items-end" : "items-start"} flex flex-col gap-1`}>
                <div className={`relative rounded-2xl px-3 py-2 text-sm leading-relaxed ${bubbleBase}`}>
                    {renderQuotePreview()}
                    {renderContent()}

                    {onQuote && (
                        <button
                            type="button"
                            onClick={() => onQuote(message)}
                            className={`absolute top-1/2 -translate-y-1/2 ${
                                isAgent ? "-left-7" : "-right-7"
                            } opacity-0 group-hover:opacity-100 rounded-full bg-white border border-gray-200 p-1 text-gray-400 hover:text-primary-600 transition-opacity`}
                            title="Trả lời"
                        >
                            <FiCornerUpLeft className="h-3 w-3" />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-400">{message.timestamp}</span>

                    {isAgent && isPending && (
                        <span className="flex items-center gap-1 text-[10px] text-gray-400">
                            <span className="h-2.5 w-2.5 animate-spin rounded-full border-[1.5px] border-gray-300 border-t-primary-500" />
                            Đang gửi...
                        </span>
                    )}

                    {isAgent && sendStatus === "sent" && (
                        <span className="flex items-center gap-0.5 text-[10px] text-gray-400" title="Đã gửi">
                            <FiCheck className="h-3 w-3" />
                        </span>
                    )}

                    {isAgent && hasError && (
                        <div className="flex items-center gap-1 text-[10px] text-red-600">
                            <FiAlertCircle className="h-3 w-3" />
                            <span title={message.errorMessage}>Gửi lỗi</span>
                            {onRetry && (
                                <button
                                    type="button"
                                    onClick={() => onRetry(message.id)}
                                    className="ml-1 inline-flex items-center gap-0.5 rounded border border-red-200 px-1.5 py-0.5 text-[10px] text-red-600 hover:bg-red-50"
                                >
                                    <FiRefreshCw className="h-2.5 w-2.5" />
                                    Gửi lại
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {hasError && message.errorMessage && (
                    <p className="text-[10px] text-red-500 max-w-[400px]">{message.errorMessage}</p>
                )}
            </div>

            {showImagePreview && message.attachmentUrl && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                    onClick={() => setShowImagePreview(false)}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={message.attachmentUrl}
                        alt={message.attachmentName || "preview"}
                        className="max-h-[90vh] max-w-[90vw] object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
}
