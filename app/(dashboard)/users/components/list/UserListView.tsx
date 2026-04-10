"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { UserProfile } from "@/types/user";
import { PermissionGroup } from "@/types/permission";
import { PermissionApiRow, TagApiRow, UserApiRow, UserTagApiRow } from "@/types/api";
import { usersService } from "@/services/users";
import { permissionsService } from "@/services/permissions";
import { tagsService } from "@/services/tags";
import { userTagsService } from "@/services/user-tags";
import { UserFilters } from "./UserFilters";
import { UserSearch } from "./UserSearch";
import { UserTable } from "./UserTable";
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

function mapApiRowToPermission(row: PermissionApiRow): PermissionOption {
    return {
        id: row.id,
        name: row.name,
        code: row.code,
        group_code: (row.group_code as PermissionGroup) || PermissionGroup.USER,
    };
}

function normalizeValue(value?: string | null): string {
    return (value || "").trim().toLowerCase();
}

function buildPermissionTagMap(
    permissions: PermissionOption[],
    tags: TagApiRow[],
): Record<string, string> {
    const tagByName = new Map<string, string>();

    tags.forEach((tag) => {
        const key = normalizeValue(tag.name);
        if (key) {
            tagByName.set(key, tag.id);
        }
    });

    const mapping: Record<string, string> = {};

    permissions.forEach((permission) => {
        const byCode = tagByName.get(normalizeValue(permission.code));
        const byName = tagByName.get(normalizeValue(permission.name));
        const tagId = byCode || byName;

        if (tagId) {
            mapping[permission.id] = tagId;
        }
    });

    return mapping;
}

function mapUserPermissionIdsByUser(
    rows: UserTagApiRow[],
    permissionTagMap: Record<string, string>,
): Record<string, string[]> {
    const reversePermissionTagMap = new Map<string, string>();
    Object.entries(permissionTagMap).forEach(([permissionId, tagId]) => {
        reversePermissionTagMap.set(tagId, permissionId);
    });

    const byUser: Record<string, Set<string>> = {};

    rows.forEach((row) => {
        const permissionId = reversePermissionTagMap.get(row.tag_id);
        if (!permissionId) {
            return;
        }

        if (!byUser[row.user_id]) {
            byUser[row.user_id] = new Set<string>();
        }

        byUser[row.user_id].add(permissionId);
    });

    return Object.fromEntries(
        Object.entries(byUser).map(([userId, permissionIds]) => [userId, Array.from(permissionIds)]),
    );
}

export function UserListView() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive" | "deleted">("all");
    const [isLoading, setIsLoading] = useState(true);
    const [permissions, setPermissions] = useState<PermissionOption[]>([]);
    const [allTags, setAllTags] = useState<TagApiRow[]>([]);
    const [permissionTagMap, setPermissionTagMap] = useState<Record<string, string>>({});
    const [userPermissionIdsByUser, setUserPermissionIdsByUser] = useState<Record<string, string[]>>({});
    const toast = useToast();

    // Modal states
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
    const [selectedUserPermissionNames, setSelectedUserPermissionNames] = useState<string[]>([]);

    const loadUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const [usersRes, permissionsRes, tagsRes, userTagsRes] = await Promise.all([
                usersService.getUsers({ pageSize: PAGE_SIZE }),
                permissionsService.getPermissions({ pageSize: PAGE_SIZE }),
                tagsService.getTags({ pageSize: PAGE_SIZE }),
                userTagsService.getUserTags({ pageSize: PAGE_SIZE }),
            ]);

            const rows = usersRes.responseData?.rows ?? [];
            const permissionRows = permissionsRes.responseData?.rows ?? [];
            const tagRows = tagsRes.responseData?.rows ?? [];
            const userTagRows = userTagsRes.responseData?.rows ?? [];

            const mappedPermissions = permissionRows
                .map(mapApiRowToPermission)
                .sort((a, b) => a.name.localeCompare(b.name, "vi"));
            const mappedPermissionTagMap = buildPermissionTagMap(mappedPermissions, tagRows);
            const mappedUserPermissionIdsByUser = mapUserPermissionIdsByUser(userTagRows, mappedPermissionTagMap);

            setUsers(rows.map(mapApiRowToProfile));
            setPermissions(mappedPermissions);
            setAllTags(tagRows);
            setPermissionTagMap(mappedPermissionTagMap);
            setUserPermissionIdsByUser(mappedUserPermissionIdsByUser);
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

    const getPermissionNamesForUser = useCallback((userId: string) => {
        const permissionIds = userPermissionIdsByUser[userId] || [];
        if (permissionIds.length === 0) {
            return [];
        }

        const permissionNameById = new Map(permissions.map((permission) => [permission.id, permission.name]));
        return permissionIds
            .map((permissionId) => permissionNameById.get(permissionId))
            .filter((name): name is string => Boolean(name));
    }, [permissions, userPermissionIdsByUser]);

    useEffect(() => {
        if (!selectedUser) {
            setSelectedUserPermissionNames([]);
            return;
        }

        setSelectedUserPermissionNames(getPermissionNamesForUser(selectedUser.id));
    }, [getPermissionNamesForUser, selectedUser]);

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

    const userRolesByUser = useMemo(() => {
        return Object.fromEntries(users.map((user) => [user.id, getPermissionNamesForUser(user.id)]));
    }, [getPermissionNamesForUser, users]);

    const handleUserClick = (user: UserProfile) => {
        setSelectedUser(user);
        setSelectedUserPermissionNames(getPermissionNamesForUser(user.id));
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

    const ensurePermissionTagId = useCallback(async (permissionId: string): Promise<string> => {
        const existingTagId = permissionTagMap[permissionId];
        if (existingTagId) {
            return existingTagId;
        }

        const permission = permissions.find((item) => item.id === permissionId);
        if (!permission) {
            throw new Error("Không tìm thấy quyền cần gán.");
        }

        const keyByCode = normalizeValue(permission.code);
        const keyByName = normalizeValue(permission.name);
        const existedTag = allTags.find(
            (tag) =>
                normalizeValue(tag.name) === keyByCode ||
                normalizeValue(tag.name) === keyByName,
        );

        if (existedTag) {
            setPermissionTagMap((prev) => ({ ...prev, [permissionId]: existedTag.id }));
            return existedTag.id;
        }

        const createResponse = await tagsService.createTag({ name: permission.code || permission.name });
        const createdTag = createResponse.responseData;

        setAllTags((prev) => [...prev, createdTag]);
        setPermissionTagMap((prev) => ({ ...prev, [permissionId]: createdTag.id }));

        return createdTag.id;
    }, [allTags, permissionTagMap, permissions]);

    const syncUserPermissions = useCallback(async (userId: string, nextPermissionIds: string[]) => {
        const normalizedNextPermissionIds = Array.from(new Set(nextPermissionIds.filter(Boolean)));
        const existingResponse = await userTagsService.getUserTagsByUserId(userId, { pageSize: PAGE_SIZE });
        const existingRows = existingResponse.responseData?.rows || [];

        const reverseTagIdToPermissionId = new Map<string, string>();
        Object.entries(permissionTagMap).forEach(([permissionId, tagId]) => {
            reverseTagIdToPermissionId.set(tagId, permissionId);
        });

        const existingPermissionIdByUserTagId = new Map<string, string>();
        existingRows.forEach((row) => {
            const permissionId = reverseTagIdToPermissionId.get(row.tag_id);
            if (permissionId) {
                existingPermissionIdByUserTagId.set(row.id, permissionId);
            }
        });

        const existingPermissionIdSet = new Set(existingPermissionIdByUserTagId.values());
        const nextPermissionIdSet = new Set(normalizedNextPermissionIds);

        const permissionIdsToAdd = normalizedNextPermissionIds.filter(
            (permissionId) => !existingPermissionIdSet.has(permissionId),
        );

        const userTagIdsToDelete = Array.from(existingPermissionIdByUserTagId.entries())
            .filter(([, permissionId]) => !nextPermissionIdSet.has(permissionId))
            .map(([userTagId]) => userTagId);

        if (permissionIdsToAdd.length > 0) {
            const payload: Array<{ user_id: string; tag_id: string }> = [];

            for (const permissionId of permissionIdsToAdd) {
                const tagId = await ensurePermissionTagId(permissionId);
                payload.push({ user_id: userId, tag_id: tagId });
            }

            if (payload.length > 0) {
                await userTagsService.createUserTags(payload);
            }
        }

        if (userTagIdsToDelete.length > 0) {
            await Promise.all(userTagIdsToDelete.map((userTagId) => userTagsService.deleteUserTag(userTagId)));
        }
    }, [ensurePermissionTagId, permissionTagMap]);

    const handleSaveUser = async (userData: Partial<UserProfile>, permissionIds: string[]) => {
        try {
            let targetUserId: string | undefined;

            if (editingUser) {
                const response = await usersService.updateUser(editingUser.id, {
                    email: userData.email,
                    full_name: userData.full_name,
                    phone: userData.phone,
                    avatar: userData.avatar,
                    birthday: userData.birthday ? new Date(userData.birthday).toISOString() : undefined,
                    is_active: userData.is_active,
                });
                targetUserId = response.responseData.id;
                toast.success("Cập nhật thành công", `Người dùng "${userData.full_name}" đã được cập nhật.`);
            } else {
                const response = await usersService.createUsers([{
                    email: userData.email || "",
                    full_name: userData.full_name,
                    phone: userData.phone,
                    avatar: userData.avatar,
                    birthday: userData.birthday ? new Date(userData.birthday).toISOString() : undefined,
                }]);
                targetUserId = response.responseData?.[0]?.id;
                toast.success("Thêm mới thành công", `Người dùng "${userData.full_name}" đã được thêm.`);
            }

            if (targetUserId) {
                await syncUserPermissions(targetUserId, permissionIds);
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
                userRolesByUser={userRolesByUser}
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
                permissions={permissions}
                initialPermissionIds={editingUser ? (userPermissionIdsByUser[editingUser.id] || []) : []}
            />

            {/* Detail Modal */}
            <UserDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                user={selectedUser}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
                permissionNames={selectedUserPermissionNames}
            />
        </div>
    );
}
