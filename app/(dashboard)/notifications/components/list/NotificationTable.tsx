"use client";

import { Notification, NotificationCategory } from "@/types/notification";
import { Badge } from "@/components/ui/Badge";
import { formatDateVN } from "@/lib/utils";
import { FiEye, FiBell, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { useState } from "react";

interface NotificationTableProps {
    notifications: Notification[];
    onNotificationClick?: (notification: Notification) => void;
    onMarkAsRead?: (notification: Notification) => void;
}

type SortField = keyof Notification | null;
type SortDirection = "asc" | "desc";

const CATEGORY_CONFIG: Record<string, { label: string; variant: "success" | "warning" | "danger" | "info" }> = {
    [NotificationCategory.SYSTEM]: { label: "Hệ thống", variant: "info" },
    [NotificationCategory.TASK]: { label: "Task", variant: "warning" },
    [NotificationCategory.DEAL]: { label: "Deal", variant: "success" },
    [NotificationCategory.CUSTOMER]: { label: "Khách hàng", variant: "info" },
    [NotificationCategory.REMINDER]: { label: "Nhắc nhở", variant: "danger" },
};

export function NotificationTable({ notifications, onNotificationClick, onMarkAsRead }: NotificationTableProps) {
    const [sortField, setSortField] = useState<SortField>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("desc");
        }
    };

    const handleSelectAll = () => {
        if (selectedRows.size === notifications.length) {
            setSelectedRows(new Set());
        } else {
            setSelectedRows(new Set(notifications.map((n) => n.id)));
        }
    };

    const handleSelectRow = (id: string) => {
        const newSelected = new Set(selectedRows);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedRows(newSelected);
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
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3 text-left w-12">
                                <input
                                    type="checkbox"
                                    checked={selectedRows.size === notifications.length && notifications.length > 0}
                                    onChange={handleSelectAll}
                                    className="rounded border-gray-300"
                                />
                            </th>
                            <TableHeader label="Tiêu đề" field="title" onSort={handleSort} sortField={sortField} sortDirection={sortDirection} />
                            <TableHeader label="Danh mục" field="category" onSort={handleSort} sortField={sortField} sortDirection={sortDirection} />
                            <TableHeader label="Trạng thái" field="has_user_read" onSort={handleSort} sortField={sortField} sortDirection={sortDirection} />
                            <TableHeader label="Gửi" field="has_noti_sent" onSort={handleSort} sortField={sortField} sortDirection={sortDirection} />
                            <TableHeader label="Thời gian gửi" field="sent_time" onSort={handleSort} sortField={sortField} sortDirection={sortDirection} />
                            <TableHeader label="Ngày tạo" field="created_at" onSort={handleSort} sortField={sortField} sortDirection={sortDirection} />
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {sortedNotifications.map((notification) => (
                            <tr
                                key={notification.id}
                                className={`hover:bg-gray-50 transition-colors ${!notification.has_user_read ? "bg-blue-50/30" : ""}`}
                            >
                                <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                                    <input
                                        type="checkbox"
                                        checked={selectedRows.has(notification.id)}
                                        onChange={() => handleSelectRow(notification.id)}
                                        className="rounded border-gray-300"
                                    />
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center space-x-3">
                                        {!notification.has_user_read && (
                                            <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
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
                                <td className="px-4 py-4">
                                    {notification.has_noti_sent ? (
                                        <Badge variant="success">Đã gửi</Badge>
                                    ) : (
                                        <Badge variant="danger">Chưa gửi</Badge>
                                    )}
                                </td>
                                <td className="px-4 py-4 text-sm text-gray-600 whitespace-pre-line">
                                    {notification.sent_time ? formatDateVN(notification.sent_time) : "-"}
                                </td>
                                <td className="px-4 py-4 text-sm text-gray-600 whitespace-pre-line">
                                    {formatDateVN(notification.created_at)}
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => onNotificationClick?.(notification)}
                                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                            title="Xem chi tiết"
                                        >
                                            <FiEye className="w-4 h-4" />
                                        </button>
                                        {!notification.has_user_read && (
                                            <button
                                                onClick={() => onMarkAsRead?.(notification)}
                                                className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                                                title="Đánh dấu đã đọc"
                                            >
                                                <FiCheckCircle className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                    <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">&lt;</button>
                    <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">&gt;</button>
                </div>
                <div className="text-sm text-gray-600">
                    <span>Hiển thị {notifications.length} kết quả</span>
                </div>
            </div>
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
                    <span className="text-blue-600">{sortDirection === "asc" ? "↑" : "↓"}</span>
                )}
            </div>
        </th>
    );
}
