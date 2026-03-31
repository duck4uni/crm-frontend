"use client";

import { Search, Plus } from "lucide-react";
import { NotificationCategory } from "@/types/notification";

interface NotificationSearchProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
    onAddNotification: () => void;
}

const CATEGORY_OPTIONS = [
    { value: "", label: "Tất cả danh mục" },
    { value: NotificationCategory.SYSTEM, label: "Hệ thống" },
    { value: NotificationCategory.TASK, label: "Task" },
    { value: NotificationCategory.DEAL, label: "Deal" },
    { value: NotificationCategory.CUSTOMER, label: "Khách hàng" },
    { value: NotificationCategory.REMINDER, label: "Nhắc nhở" },
];

export function NotificationSearch({
    searchQuery,
    onSearchChange,
    selectedCategory,
    onCategoryChange,
    onAddNotification,
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

            <select
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="h-10 px-3 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>

            <button
                onClick={onAddNotification}
                className="h-10 px-4 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow"
            >
                <Plus className="w-4 h-4" />
                Tạo thông báo
            </button>
        </div>
    );
}
