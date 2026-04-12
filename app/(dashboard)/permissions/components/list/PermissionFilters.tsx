"use client";

import { PermissionGroup } from "@/types/permission";

interface PermissionFiltersProps {
    activeFilter: string;
    onFilterChange: (filter: string) => void;
    counts: Record<string, number>;
}

const PERMISSION_FILTERS = [
    { id: "all", label: "Tất cả", bgColor: "bg-gray-100", textColor: "text-gray-700", activeBgColor: "bg-gray-700", activeTextColor: "text-white" },
    { id: PermissionGroup.USER, label: "Người dùng", bgColor: "bg-primary-100", textColor: "text-primary-700", activeBgColor: "bg-primary-600", activeTextColor: "text-white" },
    { id: PermissionGroup.CUSTOMER, label: "Khách hàng", bgColor: "bg-green-100", textColor: "text-green-700", activeBgColor: "bg-green-600", activeTextColor: "text-white" },
    { id: PermissionGroup.DEAL, label: "Thương vụ", bgColor: "bg-purple-100", textColor: "text-purple-700", activeBgColor: "bg-purple-600", activeTextColor: "text-white" },
    { id: PermissionGroup.TASK, label: "Công việc", bgColor: "bg-yellow-100", textColor: "text-yellow-700", activeBgColor: "bg-yellow-600", activeTextColor: "text-white" },
    { id: PermissionGroup.REPORT, label: "Báo cáo", bgColor: "bg-orange-100", textColor: "text-orange-700", activeBgColor: "bg-orange-600", activeTextColor: "text-white" },
    { id: PermissionGroup.SETTING, label: "Cài đặt", bgColor: "bg-red-100", textColor: "text-red-700", activeBgColor: "bg-red-600", activeTextColor: "text-white" },
];

export function PermissionFilters({ activeFilter, onFilterChange, counts }: PermissionFiltersProps) {
    return (
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            {PERMISSION_FILTERS.map((filter) => {
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
