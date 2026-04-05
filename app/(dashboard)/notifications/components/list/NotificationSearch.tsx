"use client";

import { Search } from "lucide-react";

interface NotificationSearchProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    unreadCount: number;
    isMarkAllPending: boolean;
    onMarkAllAsRead: () => void;
}

export function NotificationSearch({
    searchQuery,
    onSearchChange,
    unreadCount,
    isMarkAllPending,
    onMarkAllAsRead,
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
                    className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all"
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
        </div>
    );
}
