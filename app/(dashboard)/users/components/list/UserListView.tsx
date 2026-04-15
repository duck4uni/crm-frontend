"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserProfile } from "@/types/user";
import { AdminUserApiRow } from "@/types/api";
import { usersService } from "@/services/users";
import { UserFilters } from "./UserFilters";
import { UserSearch } from "./UserSearch";
import { UserTable } from "./UserTable";
import { ListPageLayout } from "@/components/ui/ListPageLayout";
import { useDeleteConfirmation } from "@/components/ui/useDeleteConfirmation";
import { useToast } from "@/components/ui/ToastProvider";
import { formatPermissionName } from "@/lib/utils";

const PAGE_SIZE = "500";

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
    const router = useRouter();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [userRolesByUser, setUserRolesByUser] = useState<Record<string, string[]>>({});
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");
    const [isLoading, setIsLoading] = useState(true);
    const toast = useToast();
    const { requestDeleteConfirmation, DeleteConfirmationDialog } = useDeleteConfirmation();

    const loadUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const usersRes = await usersService.getAdminUsers({ pageSize: PAGE_SIZE });

            const rows = usersRes.responseData?.rows ?? [];

            const rolesMap: Record<string, string[]> = {};
            for (const row of rows) {
                rolesMap[row.id] = (row.user_permisions ?? []).map((up) => formatPermissionName(up.permision.name));
            }

            setUsers(rows.map(mapApiRowToProfile));
            setUserRolesByUser(rolesMap);
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Không thể tải danh sách người dùng.";
            toast.error("Tải dữ liệu thất bại", msg);
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

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
        router.push(`/users/${user.id}?tab=detail`);
    };

    const handleAddUser = () => {
        router.push("/users/new");
    };

    const handleEditUser = (user: UserProfile) => {
        router.push(`/users/${user.id}?tab=detail&mode=edit`);
    };

    const handleDeleteUser = async (user: UserProfile) => {
        try {
            await usersService.deleteUser(user.id);
            setUsers((prev) => prev.filter((u) => u.id !== user.id));
            toast.success("Xóa thành công", `Người dùng "${user.full_name}" đã bị xóa.`);
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Không thể xóa người dùng.";
            toast.error("Xóa thất bại", msg);
        }
    };

    const handleRequestDeleteUser = (user: UserProfile) => {
        requestDeleteConfirmation({
            title: "Xóa người dùng",
            description: `Bạn có chắc chắn muốn xóa người dùng "${user.full_name}"? Hành động này không thể hoàn tác.`,
            onConfirm: async () => {
                await handleDeleteUser(user);
            },
        });
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
                        onUserDelete={handleRequestDeleteUser}
                    />
                )}
            />
            <DeleteConfirmationDialog />
        </>
    );
}
