"use client";

import { UserProfile } from "@/types/user";
import { Badge } from "@/components/ui/Badge";

interface UserFiltersProps {
    activeFilter: "all" | "active" | "inactive" | "deleted";
    onFilterChange: (filter: "all" | "active" | "inactive" | "deleted") => void;
    counts: Record<string, number>;
}

const USER_FILTERS = [
    { id: "all", label: "Tất cả", bgColor: "bg-gray-100", textColor: "text-gray-700", activeBgColor: "bg-gray-700", activeTextColor: "text-white" },
    { id: "active", label: "Đang hoạt động", bgColor: "bg-green-100", textColor: "text-green-700", activeBgColor: "bg-green-600", activeTextColor: "text-white" },
    { id: "inactive", label: "Ngưng hoạt động", bgColor: "bg-yellow-100", textColor: "text-yellow-700", activeBgColor: "bg-yellow-600", activeTextColor: "text-white" },
    { id: "deleted", label: "Đã xóa", bgColor: "bg-red-100", textColor: "text-red-700", activeBgColor: "bg-red-600", activeTextColor: "text-white" },
];

export function UserFilters({ activeFilter, onFilterChange, counts }: UserFiltersProps) {
    return (
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            {USER_FILTERS.map((filter) => {
                const count = counts[filter.id] || 0;
                const isActive = activeFilter === filter.id;

                return (
                    <button
                        key={filter.id}
                        onClick={() => onFilterChange(filter.id as "all" | "active" | "inactive" | "deleted")}
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
