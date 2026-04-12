"use client";

import { Search, Plus } from "lucide-react";

interface NotificationSearchProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    unreadCount: number;
    isMarkAllPending: boolean;
    onMarkAllAsRead: () => void;
    onCreateNotification?: () => void;
}

export function NotificationSearch({
    searchQuery,
    onSearchChange,
    unreadCount,
    isMarkAllPending,
    onMarkAllAsRead,
    onCreateNotification,
}: NotificationSearchProps) {
    return (
        <div className="flex items-center gap-3">
            <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                    type="text"
                    placeholder="Tìm tiêu đề, nội dung thông báo..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm transition-all"
                />
            </div>

            <button
                type="button"
                onClick={onMarkAllAsRead}
                disabled={isMarkAllPending || unreadCount === 0}
                className="h-10 px-4 flex items-center gap-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {isMarkAllPending ? "Đang xử lý..." : `Đánh dấu tất cả đã đọc (${unreadCount})`}
            </button>

            {onCreateNotification && (
                <button
                    type="button"
                    onClick={onCreateNotification}
                    className="h-10 px-4 flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow"
                >
                    <Plus className="w-4 h-4" />
                    Tạo thông báo
                </button>
            )}
        </div>
    );
}
