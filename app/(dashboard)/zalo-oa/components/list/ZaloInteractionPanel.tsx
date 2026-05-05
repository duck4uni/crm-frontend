"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { FiCornerDownLeft, FiImage, FiPaperclip, FiSend, FiSidebar, FiX } from "react-icons/fi";
import type { ZaloChatMessage, ZaloConversation } from "@/types/zalo-oa";
import { ChatMessageRow } from "./ChatMessageRow";
import { EmptyState } from "./EmptyState";
import { UserDetailPanel } from "./UserDetailPanel";

interface ZaloInteractionPanelProps {
    selectedConversation: ZaloConversation | null;
    selectedOaName: string;
    selectedMessages: ZaloChatMessage[];
    chatComposerValue: string;
    onChatComposerValueChange: (value: string) => void;
    onSendText: () => void;
    onSendImage: (file: File, caption?: string) => void;
    onSendFile: (file: File, caption?: string) => void;
    onRetryMessage: (messageId: string) => void;
    replyingTo: ZaloChatMessage | null;
    onStartQuote: (message: ZaloChatMessage) => void;
    onCancelQuote: () => void;
    accessToken?: string;
    onConversationUpdated?: (patch: Partial<ZaloConversation>) => void;
}

export function ZaloInteractionPanel({
    selectedConversation,
    selectedOaName,
    selectedMessages,
    chatComposerValue,
    onChatComposerValueChange,
    onSendText,
    onSendImage,
    onSendFile,
    onRetryMessage,
    replyingTo,
    onStartQuote,
    onCancelQuote,
    accessToken,
    onConversationUpdated,
}: ZaloInteractionPanelProps) {
    const imageInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [pendingImage, setPendingImage] = useState<{ file: File; previewUrl: string } | null>(null);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);

    if (!selectedConversation) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <EmptyState />
            </div>
        );
    }

    const handlePickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;
        if (!file.type.startsWith("image/")) return;
        if (file.size > 5 * 1024 * 1024) {
            alert("Ảnh vượt quá 5MB");
            return;
        }
        setPendingImage({ file, previewUrl: URL.createObjectURL(file) });
        setPendingFile(null);
    };

    const handlePickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;
        if (file.size > 25 * 1024 * 1024) {
            alert("File vượt quá 25MB");
            return;
        }
        setPendingFile(file);
        setPendingImage(null);
    };

    const handleSubmit = () => {
        if (pendingImage) {
            onSendImage(pendingImage.file, chatComposerValue.trim() || undefined);
            URL.revokeObjectURL(pendingImage.previewUrl);
            setPendingImage(null);
            onChatComposerValueChange("");
            return;
        }
        if (pendingFile) {
            onSendFile(pendingFile, chatComposerValue.trim() || undefined);
            setPendingFile(null);
            onChatComposerValueChange("");
            return;
        }
        if (!chatComposerValue.trim()) return;
        onSendText();
    };

    const removePendingImage = () => {
        if (pendingImage) URL.revokeObjectURL(pendingImage.previewUrl);
        setPendingImage(null);
    };

    const canSubmit = !!pendingImage || !!pendingFile || !!chatComposerValue.trim();

    const phoneDisplay = (() => {
        const p = selectedConversation.customerPhone;
        if (!p || p === "0" || Number(p) === 0) return null;
        return String(p);
    })();

    return (
        <div className="flex h-full overflow-hidden">
            <div className="flex flex-1 flex-col min-w-0">
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
                            {phoneDisplay || "Chưa có số điện thoại"}
                            {selectedOaName ? ` • ${selectedOaName}` : ""}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setDetailOpen((v) => !v)}
                    className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${
                        detailOpen
                            ? "text-primary-600 bg-primary-50"
                            : "text-gray-400 hover:text-primary-600 hover:bg-gray-100"
                    }`}
                    title="Thông tin khách hàng"
                >
                    <FiSidebar className="w-4 h-4" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {selectedMessages.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center pt-8">Chưa có tin nhắn trong hội thoại này.</p>
                ) : (
                    selectedMessages.map((message) => (
                        <ChatMessageRow
                            key={message.id}
                            message={message}
                            onQuote={onStartQuote}
                            onRetry={onRetryMessage}
                        />
                    ))
                )}
            </div>

            <div className="border-t border-gray-200 bg-white p-3">
                {replyingTo && (
                    <div className="mb-2 flex items-start gap-2 rounded-lg bg-primary-50 border border-primary-100 px-3 py-2">
                        <FiCornerDownLeft className="mt-0.5 h-3.5 w-3.5 text-primary-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-semibold text-primary-700">
                                Đang trả lời{" "}
                                {replyingTo.sender === "agent" ? "tin của bạn" : "tin khách hàng"}
                            </p>
                            <p className="text-xs text-gray-600 truncate">
                                {replyingTo.content || "[Tệp đính kèm]"}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={onCancelQuote}
                            className="text-gray-400 hover:text-red-500"
                            title="Huỷ trả lời"
                        >
                            <FiX className="h-3.5 w-3.5" />
                        </button>
                    </div>
                )}

                {pendingImage && (
                    <div className="mb-2 flex items-center gap-2 rounded-lg bg-gray-50 border border-gray-200 p-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={pendingImage.previewUrl}
                            alt={pendingImage.file.name}
                            className="h-12 w-12 rounded object-cover"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-700 truncate">
                                {pendingImage.file.name}
                            </p>
                            <p className="text-[11px] text-gray-500">
                                {(pendingImage.file.size / 1024).toFixed(1)} KB
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={removePendingImage}
                            className="text-gray-400 hover:text-red-500"
                            title="Bỏ ảnh"
                        >
                            <FiX className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {pendingFile && (
                    <div className="mb-2 flex items-center gap-2 rounded-lg bg-gray-50 border border-gray-200 p-2">
                        <div className="h-10 w-10 rounded bg-primary-100 text-primary-700 flex items-center justify-center flex-shrink-0">
                            <FiPaperclip className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-700 truncate">{pendingFile.name}</p>
                            <p className="text-[11px] text-gray-500">
                                {(pendingFile.size / 1024).toFixed(1)} KB
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setPendingFile(null)}
                            className="text-gray-400 hover:text-red-500"
                            title="Bỏ file"
                        >
                            <FiX className="h-4 w-4" />
                        </button>
                    </div>
                )}

                <div className="flex items-end gap-2">
                    <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-primary-600"
                        title="Gửi ảnh"
                    >
                        <FiImage className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-primary-600"
                        title="Gửi file"
                    >
                        <FiPaperclip className="h-4 w-4" />
                    </button>
                    <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePickImage}
                        className="hidden"
                    />
                    <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handlePickFile}
                        className="hidden"
                    />

                    <textarea
                        value={chatComposerValue}
                        onChange={(event) => onChatComposerValueChange(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter" && !event.shiftKey) {
                                event.preventDefault();
                                handleSubmit();
                            }
                        }}
                        placeholder={
                            pendingImage || pendingFile
                                ? "Mô tả cho tệp đính kèm (tuỳ chọn)..."
                                : "Nhập nội dung tin nhắn..."
                        }
                        rows={2}
                        className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                    />
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Gửi tin nhắn"
                    >
                        <FiSend className="h-4 w-4" />
                    </button>
                </div>
                <p className="mt-2 text-[11px] text-gray-400">
                    Nhấn Enter để gửi, Shift + Enter để xuống dòng. Ảnh ≤ 5MB, file ≤ 25MB.
                </p>
            </div>
            </div>

            {detailOpen && accessToken && (
                <UserDetailPanel
                    conversation={selectedConversation}
                    oaName={selectedOaName}
                    accessToken={accessToken}
                    onUpdated={(patch) => onConversationUpdated?.(patch)}
                />
            )}
        </div>
    );
}
