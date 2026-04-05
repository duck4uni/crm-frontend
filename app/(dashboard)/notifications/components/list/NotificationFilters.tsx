"use client";

import { NotificationStatus } from "@/types/notification";

interface NotificationFiltersProps {
    activeFilter: NotificationStatus;
    onFilterChange: (filter: NotificationStatus) => void;
    counts: Record<string, number>;
}

const NOTIFICATION_FILTERS = [
    { id: NotificationStatus.ALL, label: "Tất cả", bgColor: "bg-gray-100", textColor: "text-gray-700", activeBgColor: "bg-gray-700", activeTextColor: "text-white" },
    { id: NotificationStatus.UNREAD, label: "Chưa đọc", bgColor: "bg-red-100", textColor: "text-red-700", activeBgColor: "bg-red-600", activeTextColor: "text-white" },
    { id: NotificationStatus.READ, label: "Đã đọc", bgColor: "bg-green-100", textColor: "text-green-700", activeBgColor: "bg-green-600", activeTextColor: "text-white" },
];

export function NotificationFilters({ activeFilter, onFilterChange, counts }: NotificationFiltersProps) {
    return (
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            {NOTIFICATION_FILTERS.map((filter) => {
                const count = counts[filter.id] || 0;
                const isActive = activeFilter === filter.id;

                return (
                    <button
                        key={filter.id}
                        onClick={() => onFilterChange(filter.id)}
                        className={`flex items-center space-x-2 px-3 py-1.5 rounded transition-all whitespace-nowrap ${isActive
                            ? `${filter.activeBgColor} ${filter.activeTextColor} shadow-md`
                            : `${filter.bgColor} ${filter.textColor} opacity-90 hover:opacity-100 hover:shadow`
                            }`}
                    >
                        <span className="text-sm font-medium">{filter.label}</span>
                        <span className="text-xs font-bold bg-white bg-opacity-30 px-2 py-0.5 rounded-full">
                            {count}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
