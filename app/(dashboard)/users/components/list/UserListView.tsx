"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { UserProfile } from "@/types/user";
import { AdminUserApiRow, PermissionApiRow } from "@/types/api";
import { usersService } from "@/services/users";
import { permissionsService } from "@/services/permissions";
import { UserFilters } from "./UserFilters";
import { UserSearch } from "./UserSearch";
import { UserTable } from "./UserTable";
import { ListPageLayout } from "@/components/ui/ListPageLayout";
import { UserFormModal } from "../forms/UserFormModal";
import { UserDetailModal } from "../forms/UserDetailModal";
import { useToast } from "@/components/ui/ToastProvider";

interface PermissionOption {
    id: string;
    name: string;
    code: string;
    group_code: string;
}

const PAGE_SIZE = "500";
const ALLOWED_ROLE_CODES = ["SITE_WORKER", "SITE_LEADER"];

function mapApiRowToProfile(row: AdminUserApiRow): UserProfile {
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
    const [userRolesByUser, setUserRolesByUser] = useState<Record<string, string[]>>({});
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");
    const [isLoading, setIsLoading] = useState(true);
    const [permissions, setPermissions] = useState<PermissionOption[]>([]);
    const toast = useToast();
    const toastRef = useRef(toast);
    toastRef.current = toast;

    // Modal states
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

    const loadUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const [usersRes, permissionsRes] = await Promise.all([
                usersService.getAdminUsers({ pageSize: PAGE_SIZE }),
                permissionsService.getPermissions({ pageSize: PAGE_SIZE }),
            ]);

            const rows = usersRes.responseData?.rows ?? [];
            const permissionRows = (permissionsRes.responseData?.rows ?? []) as PermissionApiRow[];

            const filteredPermissions = permissionRows
                .filter((p) => ALLOWED_ROLE_CODES.includes(p.code))
                .map((p) => ({
                    id: p.id,
                    name: p.name,
                    code: p.code,
                    group_code: p.group_code,
                }));

            const rolesMap: Record<string, string[]> = {};
            for (const row of rows) {
                rolesMap[row.id] = (row.user_permisions ?? []).map((up) => up.permision.name);
            }

            setUsers(rows.map(mapApiRowToProfile));
            setUserRolesByUser(rolesMap);
            setPermissions(filteredPermissions);
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Không thể tải danh sách người dùng.";
            toastRef.current.error("Tải dữ liệu thất bại", msg);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadUsers();
    }, [loadUsers]);

    // Calculate filter counts
    const filterCounts = useMemo(() => {
        return {
            all: users.length,
            active: users.filter((u) => u.is_active && !u.is_delete).length,
            inactive: users.filter((u) => !u.is_active && !u.is_delete).length,
        };
    }, [users]);

    // Filter users
    const filteredUsers = useMemo(() => {
        let filtered = users;

        if (activeFilter === "active") {
            filtered = filtered.filter((u) => u.is_active && !u.is_delete);
        } else if (activeFilter === "inactive") {
            filtered = filtered.filter((u) => !u.is_active && !u.is_delete);
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

    const handleSaveUser = async (userData: Partial<UserProfile> & { password?: string }, roleCode: string | null) => {
        try {
            let targetUserId: string | undefined;

            if (editingUser) {
                const updatePayload: Record<string, any> = {};
                
                if (userData.email && userData.email !== editingUser.email) updatePayload.email = userData.email;
                if (userData.full_name && userData.full_name !== editingUser.full_name) updatePayload.full_name = userData.full_name;
                if (userData.phone && userData.phone !== editingUser.phone) updatePayload.phone = userData.phone;
                if (userData.avatar !== undefined && userData.avatar !== editingUser.avatar) updatePayload.avatar = userData.avatar;
                if (userData.is_active !== undefined && userData.is_active !== editingUser.is_active) updatePayload.is_active = userData.is_active;
                if (userData.birthday !== undefined && new Date(userData.birthday).getTime() !== new Date(editingUser.birthday || 0).getTime()) {
                    const birthdayDate = new Date(userData.birthday);
                    const year = birthdayDate.getFullYear();
                    const month = String(birthdayDate.getMonth() + 1).padStart(2, "0");
                    const day = String(birthdayDate.getDate()).padStart(2, "0");
                    updatePayload.birthday = userData.birthday ? `${year}-${month}-${day}` : null;
                }

                console.log("Update payload:", updatePayload);
                const response = await usersService.updateUser(editingUser.id, updatePayload);
                targetUserId = response.responseData.id;
                toast.success("Cập nhật thành công", `Người dùng "${userData.full_name}" đã được cập nhật.`);
            } else {
                await usersService.createAdminUsers(
                    [{
                        email: userData.email || "",
                        full_name: userData.full_name,
                        phone: userData.phone,
                        password: userData.password || "",
                    }],
                    roleCode ?? "",
                );
                toast.success("Thêm mới thành công", `Người dùng "${userData.full_name}" đã được thêm.`);
            }

            await loadUsers();
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Thao tác thất bại.";
            toast.error("Lỗi", msg);
            throw error;
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
        <>
            <ListPageLayout
                items={filteredUsers}
                isLoading={isLoading}
                loadingText="Đang tải danh sách người dùng..."
                resetPageKey={`${activeFilter}|${searchQuery}`}
                renderFilters={
                    <UserFilters
                        activeFilter={activeFilter}
                        onFilterChange={setActiveFilter}
                        counts={filterCounts}
                    />
                }
                renderSearch={
                    <UserSearch
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        onAddUser={handleAddUser}
                        onExport={handleExport}
                    />
                }
                renderTable={(paged) => (
                    <UserTable
                        users={paged}
                        userRolesByUser={userRolesByUser}
                        onUserClick={handleUserClick}
                        onUserEdit={handleEditUser}
                        onUserDelete={(user) => { void handleDeleteUser(user); }}
                    />
                )}
            />

            <UserFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSave={handleSaveUser}
                user={editingUser}
                permissions={permissions}
            />

            <UserDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                user={selectedUser}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
            />
        </>
    );
}
