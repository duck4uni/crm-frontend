"use client";

import { Permission, PermissionGroup } from "@/types/permission";
import { Badge } from "@/components/ui/Badge";
import { FiEye, FiEdit2, FiTrash2 } from "react-icons/fi";
import { useState } from "react";

interface PermissionTableProps {
    permissions: Permission[];
    onPermissionClick?: (permission: Permission) => void;
    onPermissionEdit?: (permission: Permission) => void;
    onPermissionDelete?: (permission: Permission) => void;
}

type SortField = keyof Permission | null;
type SortDirection = "asc" | "desc";

const GROUP_CONFIG: Record<string, { label: string; variant: "success" | "warning" | "danger" | "info" }> = {
    [PermissionGroup.USER]: { label: "Người dùng", variant: "info" },
    [PermissionGroup.CUSTOMER]: { label: "Khách hàng", variant: "success" },
    [PermissionGroup.DEAL]: { label: "Thương vụ", variant: "warning" },
    [PermissionGroup.TASK]: { label: "Công việc", variant: "info" },
    [PermissionGroup.REPORT]: { label: "Báo cáo", variant: "warning" },
    [PermissionGroup.SETTING]: { label: "Cài đặt", variant: "danger" },
};

export function PermissionTable({ permissions, onPermissionClick, onPermissionEdit, onPermissionDelete }: PermissionTableProps) {
    const [sortField, setSortField] = useState<SortField>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const handleSelectAll = () => {
        if (selectedRows.size === permissions.length) {
            setSelectedRows(new Set());
        } else {
            setSelectedRows(new Set(permissions.map((p) => p.id)));
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

    const sortedPermissions = [...permissions].sort((a, b) => {
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
                                    checked={selectedRows.size === permissions.length && permissions.length > 0}
                                    onChange={handleSelectAll}
                                    className="rounded border-gray-300"
                                />
                            </th>
                            <TableHeader label="Tên quyền" field="name" onSort={handleSort} sortField={sortField} sortDirection={sortDirection} />
                            <TableHeader label="Mã code" field="code" onSort={handleSort} sortField={sortField} sortDirection={sortDirection} />
                            <TableHeader label="Nhóm" field="group_code" onSort={handleSort} sortField={sortField} sortDirection={sortDirection} />
                            <TableHeader label="Mô tả" field="description" onSort={handleSort} sortField={sortField} sortDirection={sortDirection} />
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {sortedPermissions.map((permission) => (
                            <tr key={permission.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                                    <input
                                        type="checkbox"
                                        checked={selectedRows.has(permission.id)}
                                        onChange={() => handleSelectRow(permission.id)}
                                        className="rounded border-gray-300"
                                    />
                                </td>
                                <td className="px-4 py-4">
                                    <span className="text-sm font-medium text-gray-900">{permission.name}</span>
                                </td>
                                <td className="px-4 py-4">
                                    <code className="text-sm bg-gray-100 px-2 py-1 rounded text-gray-700">{permission.code}</code>
                                </td>
                                <td className="px-4 py-4">
                                    {(() => {
                                        const config = GROUP_CONFIG[permission.group_code];
                                        return config ? <Badge variant={config.variant}>{config.label}</Badge> : permission.group_code;
                                    })()}
                                </td>
                                <td className="px-4 py-4 text-sm text-gray-600 max-w-sm truncate">
                                    {permission.description}
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => onPermissionClick?.(permission)}
                                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                            title="Xem chi tiết"
                                        >
                                            <FiEye className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => onPermissionEdit?.(permission)}
                                            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                                            title="Chỉnh sửa"
                                        >
                                            <FiEdit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => onPermissionDelete?.(permission)}
                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                            title="Xóa"
                                        >
                                            <FiTrash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                    <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">&lt;</button>
                    <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">&gt;</button>
                </div>
                <div className="text-sm text-gray-600">
                    <span>Hiển thị {permissions.length} kết quả</span>
                </div>
            </div>
        </div>
    );
}

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
