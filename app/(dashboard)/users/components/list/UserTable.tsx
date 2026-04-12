"use client";

import { UserProfile } from "@/types/user";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { formatDateVN } from "@/lib/utils";
import { FiEye, FiEdit2, FiTrash2 } from "react-icons/fi";
import { useState } from "react";

interface UserTableProps {
    users: UserProfile[];
    userRolesByUser?: Record<string, string[]>;
    onUserClick?: (user: UserProfile) => void;
    onUserEdit?: (user: UserProfile) => void;
    onUserDelete?: (user: UserProfile) => void;
}

type SortField = keyof UserProfile | null;
type SortDirection = "asc" | "desc";

export function UserTable({ users, userRolesByUser = {}, onUserClick, onUserEdit, onUserDelete }: UserTableProps) {
    const [sortField, setSortField] = useState<SortField>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const sortedUsers = [...users].sort((a, b) => {
        if (!sortField) return 0;
        const aVal = a[sortField];
        const bVal = b[sortField];
        if (aVal === undefined || aVal === null) return 1;
        if (bVal === undefined || bVal === null) return -1;
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sortDirection === "asc" ? comparison : -comparison;
    });

    const getStatusBadge = (user: UserProfile) => {
        if (user.is_delete) return <Badge variant="danger">Đã xóa</Badge>;
        if (user.is_active) return <Badge variant="success">Hoạt động</Badge>;
        return <Badge variant="warning">Ngưng hoạt động</Badge>;
    };

    const renderRoleBadges = (userId: string) => {
        const roles = userRolesByUser[userId] || [];

        if (roles.length === 0) {
            return <span className="text-sm text-gray-400">Chưa gán quyền</span>;
        }

        const primaryRoles = roles.slice(0, 2);
        const remaining = roles.length - primaryRoles.length;

        return (
            <div className="flex flex-wrap items-center gap-1.5">
                {primaryRoles.map((role) => (
                    <Badge key={role} variant="info">{role}</Badge>
                ))}
                {remaining > 0 && <span className="text-xs text-gray-500">+{remaining}</span>}
            </div>
        );
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <TableHeader label="Họ tên" field="full_name" onSort={handleSort} sortField={sortField} sortDirection={sortDirection} />
                            <TableHeader label="Email" field="email" onSort={handleSort} sortField={sortField} sortDirection={sortDirection} />
                            <TableHeader label="Số điện thoại" field="phone" onSort={handleSort} sortField={sortField} sortDirection={sortDirection} />
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vai trò</th>
                            <TableHeader label="Trạng thái" field="is_active" onSort={handleSort} sortField={sortField} sortDirection={sortDirection} />
                            <TableHeader label="Ngày tạo" field="created_at" onSort={handleSort} sortField={sortField} sortDirection={sortDirection} />
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Thao tác</th>
                        </tr>
                    </thead>
                <tbody className="divide-y divide-gray-200">
                    {sortedUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-4">
                                <div className="flex items-center space-x-3">
                                        <Avatar name={user.full_name} src={user.avatar} />
                                        <span className="text-sm font-medium text-gray-900">{user.full_name}</span>
                                    </div>
                                </td>
                            <td className="px-4 py-4 text-sm text-gray-600">{user.email}</td>
                            <td className="px-4 py-4 text-sm text-gray-900">{user.phone || "-"}</td>
                            <td className="px-4 py-4">{renderRoleBadges(user.id)}</td>
                            <td className="px-4 py-4">{getStatusBadge(user)}</td>
                            <td className="px-4 py-4 text-sm text-gray-600 whitespace-pre-line">
                                {formatDateVN(user.created_at)}
                            </td>
                            <td className="px-4 py-4">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => onUserClick?.(user)}
                                        className="p-1.5 text-primary-600 hover:bg-primary-50 rounded transition-colors"
                                        title="Xem chi tiết"
                                    >
                                        <FiEye className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => onUserEdit?.(user)}
                                        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                        title="Chỉnh sửa"
                                    >
                                        <FiEdit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => onUserDelete?.(user)}
                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
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
    );
}

// Table Header Component with Sorting
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
