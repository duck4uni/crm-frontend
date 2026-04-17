"use client";

import { Notification, NotificationCategory } from "@/types/notification";
import { Badge } from "@/components/ui/Badge";
import { formatDateVN } from "@/lib/utils";
import { FiEye } from "react-icons/fi";
import { useState } from "react";

interface NotificationTableProps {
    notifications: Notification[];
    onNotificationClick?: (notification: Notification) => void;
}

type SortField = keyof Notification | null;
type SortDirection = "asc" | "desc";

const CATEGORY_CONFIG: Record<string, { label: string; variant: "success" | "warning" | "danger" | "info" }> = {
    [NotificationCategory.SYSTEM]: { label: "Hệ thống", variant: "info" },
    [NotificationCategory.TASK]: { label: "Công việc", variant: "warning" },
    [NotificationCategory.DEAL]: { label: "Thương vụ", variant: "success" },
    [NotificationCategory.CUSTOMER]: { label: "Khách hàng", variant: "info" },
    [NotificationCategory.REMINDER]: { label: "Nhắc nhở", variant: "danger" },
    [NotificationCategory.EXAM]: { label: "Thi cử", variant: "warning" },
};

export function NotificationTable({ notifications, onNotificationClick }: NotificationTableProps) {
    const [sortField, setSortField] = useState<SortField>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("desc");
        }
    };

    const sortedNotifications = [...notifications].sort((a, b) => {
        if (!sortField) return 0;
        const aVal = a[sortField];
        const bVal = b[sortField];
        if (aVal === undefined || aVal === null) return 1;
        if (bVal === undefined || bVal === null) return -1;
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sortDirection === "asc" ? comparison : -comparison;
    });

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <TableHeader label="Tiêu đề" field="title" onSort={handleSort} sortField={sortField} sortDirection={sortDirection} />
                        <TableHeader label="Danh mục" field="category" onSort={handleSort} sortField={sortField} sortDirection={sortDirection} />
                        <TableHeader label="Trạng thái" field="has_user_read" onSort={handleSort} sortField={sortField} sortDirection={sortDirection} />
                        <TableHeader label="Ngày nhận" field="created_at" onSort={handleSort} sortField={sortField} sortDirection={sortDirection} />
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap w-24">Thao tác</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {sortedNotifications.map((notification) => (
                        <tr
                            key={notification.id}
                            className={`hover:bg-gray-50 transition-colors ${!notification.has_user_read ? "bg-primary-50/30" : ""}`}
                        >
                            <td className="px-4 py-4">
                                <div className="flex items-center space-x-3">
                                    {!notification.has_user_read && (
                                        <div className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0" />
                                    )}
                                    <div>
                                        <p className={`text-sm ${!notification.has_user_read ? "font-semibold" : "font-medium"} text-gray-900`}>
                                            {notification.title}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{notification.content}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-4 py-4">
                                {(() => {
                                    const config = CATEGORY_CONFIG[notification.category];
                                    return config ? <Badge variant={config.variant}>{config.label}</Badge> : notification.category;
                                })()}
                            </td>
                            <td className="px-4 py-4">
                                {notification.has_user_read ? (
                                    <Badge variant="success">Đã đọc</Badge>
                                ) : (
                                    <Badge variant="warning">Chưa đọc</Badge>
                                )}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-600 whitespace-pre-line">
                                {formatDateVN(notification.created_at)}
                            </td>
                            <td className="px-4 py-4">
                                <button
                                    onClick={() => onNotificationClick?.(notification)}
                                    className="p-1.5 text-primary-600 hover:bg-primary-50 rounded transition-colors"
                                    title="Xem chi tiết"
                                >
                                    <FiEye className="w-4 h-4" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// Table Header
interface TableHeaderProps {
    label: string;
    field: SortField;
    onSort: (field: SortField) => void;
    sortField: SortField;
    sortDirection: SortDirection;
}

function TableHeader({ label, field, onSort, sortField, sortDirection }: TableHeaderProps) {
    const isSorted = sortField === field;
    return (
        <th
            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
            onClick={() => onSort(field)}
        >
            <div className="flex items-center space-x-1">
                <span>{label}</span>
                {isSorted && (
                    <span className="text-primary-600">{sortDirection === "asc" ? "↑" : "↓"}</span>
                )}
            </div>
        </th>
    );
}
