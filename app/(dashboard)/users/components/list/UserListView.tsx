"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { UserProfile } from "@/types/user";
import { UserApiRow } from "@/types/api";
import { usersService } from "@/services/users";
import { UserFilters } from "./UserFilters";
import { UserSearch } from "./UserSearch";
import { UserTable } from "./UserTable";
import { UserFormModal } from "../forms/UserFormModal";
import { UserDetailModal } from "../forms/UserDetailModal";
import { useToast } from "@/components/ui/ToastProvider";

function mapApiRowToProfile(row: UserApiRow): UserProfile {
    return {
        id: row.id,
        email: row.email,
        full_name: row.full_name,
        phone: row.phone || undefined,
        avatar: row.avatar || undefined,
        birthday: row.birthday ? new Date(row.birthday) : undefined,
        is_active: row.is_active,
        is_delete: row.is_delete,
        created_at: row.created_at ? new Date(row.created_at) : new Date(),
        created_by: row.created_by || undefined,
        updated_at: row.updated_at ? new Date(row.updated_at) : new Date(),
        updated_by: row.updated_by || undefined,
    };
}

export function UserListView() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive" | "deleted">("all");
    const [isLoading, setIsLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const toast = useToast();

    // Modal states
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

    const loadUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await usersService.getUsers({ pageSize: "100" });
            const rows = response.responseData?.rows ?? [];
            setUsers(rows.map(mapApiRowToProfile));
            setTotalCount(response.responseData?.count ?? 0);
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Không thể tải danh sách người dùng.";
            toast.error("Tải dữ liệu thất bại", msg);
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    // Calculate filter counts
    const filterCounts = useMemo(() => {
        return {
            all: users.length,
            active: users.filter((u) => u.is_active && !u.is_delete).length,
            inactive: users.filter((u) => !u.is_active && !u.is_delete).length,
            deleted: users.filter((u) => u.is_delete).length,
        };
    }, [users]);

    // Filter users
    const filteredUsers = useMemo(() => {
        let filtered = users;

        if (activeFilter === "active") {
            filtered = filtered.filter((u) => u.is_active && !u.is_delete);
        } else if (activeFilter === "inactive") {
            filtered = filtered.filter((u) => !u.is_active && !u.is_delete);
        } else if (activeFilter === "deleted") {
            filtered = filtered.filter((u) => u.is_delete);
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (user) =>
                    user.full_name.toLowerCase().includes(query) ||
                    user.email.toLowerCase().includes(query) ||
                    (user.phone && user.phone.includes(query))
            );
        }

        return filtered;
    }, [users, activeFilter, searchQuery]);

    const handleUserClick = (user: UserProfile) => {
        setSelectedUser(user);
        setIsDetailModalOpen(true);
    };

    const handleAddUser = () => {
        setEditingUser(null);
        setIsFormModalOpen(true);
    };

    const handleEditUser = (user: UserProfile) => {
        setEditingUser(user);
        setIsDetailModalOpen(false);
        setIsFormModalOpen(true);
    };

    const handleSaveUser = async (userData: Partial<UserProfile>) => {
        try {
            if (editingUser) {
                const response = await usersService.updateUser(editingUser.id, {
                    email: userData.email,
                    full_name: userData.full_name,
                    phone: userData.phone,
                    avatar: userData.avatar,
                    birthday: userData.birthday ? new Date(userData.birthday).toISOString() : undefined,
                    is_active: userData.is_active,
                });
                const updated = mapApiRowToProfile(response.responseData);
                setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? updated : u)));
                toast.success("Cập nhật thành công", `Người dùng "${userData.full_name}" đã được cập nhật.`);
            } else {
                const response = await usersService.createUsers([{
                    email: userData.email || "",
                    full_name: userData.full_name,
                    phone: userData.phone,
                    avatar: userData.avatar,
                    birthday: userData.birthday ? new Date(userData.birthday).toISOString() : undefined,
                }]);
                const created = (response.responseData ?? []).map(mapApiRowToProfile);
                setUsers((prev) => [...created, ...prev]);
                toast.success("Thêm mới thành công", `Người dùng "${userData.full_name}" đã được thêm.`);
            }
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Thao tác thất bại.";
            toast.error("Lỗi", msg);
        }
    };

    const handleDeleteUser = async (user: UserProfile) => {
        try {
            await usersService.deleteUser(user.id);
            setUsers((prev) => prev.filter((u) => u.id !== user.id));
            setIsDetailModalOpen(false);
            toast.success("Xóa thành công", `Người dùng "${user.full_name}" đã bị xóa.`);
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Không thể xóa người dùng.";
            toast.error("Xóa thất bại", msg);
        }
    };

    const handleExport = async () => {
        try {
            const blob = await usersService.exportUsers();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `users-${Date.now()}.xlsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success("Xuất file thành công", `Đã xuất danh sách người dùng`);
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Không thể xuất file.";
            toast.error("Xuất file thất bại", msg);
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white border border-gray-200 rounded-lg p-6 text-sm text-gray-600">
                Đang tải danh sách người dùng...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filters */}
            <UserFilters
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                counts={filterCounts}
            />

            {/* Search and Actions */}
            <UserSearch
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onAddUser={handleAddUser}
                onExport={handleExport}
            />

            {/* User Table */}
            <UserTable
                users={filteredUsers}
                onUserClick={handleUserClick}
                onUserEdit={handleEditUser}
            />

            {/* Summary */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Tổng số: {filteredUsers.length} người dùng</span>
                    <span>Đang hoạt động: {filterCounts.active}</span>
                </div>
            </div>

            {/* Form Modal */}
            <UserFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSave={handleSaveUser}
                user={editingUser}
            />

            {/* Detail Modal */}
            <UserDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                user={selectedUser}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
            />
        </div>
    );
}
