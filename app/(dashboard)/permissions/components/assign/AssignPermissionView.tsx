"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Permission, UserPermission, PermissionGroup } from "@/types/permission";
import { UserProfile } from "@/types/user";
import { UserApiRow, PermissionApiRow, TagApiRow } from "@/types/api";
import { usersService } from "@/services/users";
import { permissionsService } from "@/services/permissions";
import { userTagsService } from "@/services/user-tags";
import { tagsService } from "@/services/tags";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/ToastProvider";

const GROUP_LABELS: Record<PermissionGroup, string> = {
    [PermissionGroup.USER]: "Người dùng",
    [PermissionGroup.CUSTOMER]: "Khách hàng",
    [PermissionGroup.DEAL]: "Thương vụ",
    [PermissionGroup.TASK]: "Công việc",
    [PermissionGroup.REPORT]: "Báo cáo",
    [PermissionGroup.SETTING]: "Cài đặt",
};

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
        updated_at: row.updated_at ? new Date(row.updated_at) : new Date(),
    };
}

function mapApiRowToPermission(row: PermissionApiRow): Permission {
    return {
        id: row.id,
        name: row.name,
        code: row.code,
        description: row.description,
        group_code: (row.group_code as PermissionGroup) || PermissionGroup.USER,
    };
}

function normalizeValue(value?: string | null): string {
    return (value || "").trim().toLowerCase();
}

function buildPermissionTagMap(
    permissions: Permission[],
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

export function AssignPermissionView() {
    const [userPermissions, setUserPermissions] = useState<UserPermission[]>([]);
    const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
    const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
    const [allTags, setAllTags] = useState<TagApiRow[]>([]);
    const [permissionTagMap, setPermissionTagMap] = useState<Record<string, string>>({});
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);
    const [isMutatingAssignments, setIsMutatingAssignments] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const toast = useToast();

    const loadData = useCallback(async () => {
        try {
            const [usersRes, permsRes, tagsRes] = await Promise.all([
                usersService.getUsers({ pageSize: "200" }),
                permissionsService.getPermissions({ pageSize: "100" }),
                tagsService.getTags({ pageSize: "500" }),
            ]);
            const users = (usersRes.responseData?.rows ?? []).map(mapApiRowToProfile);
            const permissions = (permsRes.responseData?.rows ?? []).map(mapApiRowToPermission);
            const tags = tagsRes.responseData?.rows ?? [];

            setAllUsers(users);
            setAllPermissions(permissions);
            setAllTags(tags);
            setPermissionTagMap(buildPermissionTagMap(permissions, tags));
        } catch {
            // silently fail, UI will show empty
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const refreshSelectedUserPermissions = useCallback(async () => {
        if (!selectedUser) {
            setUserPermissions([]);
            return;
        }

        setIsLoadingAssignments(true);
        try {
            const response = await userTagsService.getUserTags({
                pageSize: "500",
                filters: `user_id==${selectedUser.id}`,
            });

            const reversePermissionTagMap = new Map<string, string>();
            Object.entries(permissionTagMap).forEach(([permissionId, tagId]) => {
                reversePermissionTagMap.set(tagId, permissionId);
            });

            const mappedPermissions: UserPermission[] = (response.responseData?.rows ?? [])
                .map((row) => {
                    const permissionId = reversePermissionTagMap.get(row.tag_id);

                    if (!permissionId) {
                        return null;
                    }

                    return {
                        id: row.id,
                        user_id: row.user_id,
                        permision_id: permissionId,
                        updated_at: row.created_at ? new Date(row.created_at) : new Date(),
                    };
                })
                .filter((item): item is UserPermission => item !== null);

            setUserPermissions(mappedPermissions);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Không thể tải phân quyền người dùng.";
            toast.error("Tải phân quyền thất bại", message);
            setUserPermissions([]);
        } finally {
            setIsLoadingAssignments(false);
        }
    }, [permissionTagMap, selectedUser, toast]);

    useEffect(() => {
        void refreshSelectedUserPermissions();
    }, [refreshSelectedUserPermissions]);

    const filteredUsers = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const q = searchQuery.toLowerCase();
        return allUsers
            .filter((u) => !u.is_delete)
            .filter(
                (u) =>
                    u.full_name.toLowerCase().includes(q) ||
                    u.email.toLowerCase().includes(q) ||
                    (u.phone && u.phone.includes(q))
            )
            .slice(0, 8);
    }, [searchQuery, allUsers]);

    const selectedUserPermissions = useMemo(() => {
        if (!selectedUser) return new Set<string>();
        return new Set(
            userPermissions
                .filter((up) => up.user_id === selectedUser.id)
                .map((up) => up.permision_id)
        );
    }, [userPermissions, selectedUser]);

    const permissionsByGroup = useMemo(() => {
        const groups: Record<string, Permission[]> = {};
        allPermissions.forEach((p) => {
            if (!groups[p.group_code]) groups[p.group_code] = [];
            groups[p.group_code].push(p);
        });
        return groups;
    }, [allPermissions]);

    const handleSelectUser = (user: UserProfile) => {
        setSelectedUser(user);
        setSearchQuery("");
        setShowDropdown(false);
    };

    const handleClearUser = () => {
        setSelectedUser(null);
        setSearchQuery("");
        setUserPermissions([]);
    };

    const ensurePermissionTagId = useCallback(
        async (permissionId: string): Promise<string> => {
            const existingTagId = permissionTagMap[permissionId];
            if (existingTagId) {
                return existingTagId;
            }

            const permission = allPermissions.find((item) => item.id === permissionId);
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

            const createResponse = await tagsService.createTag({
                name: permission.code || permission.name,
            });
            const createdTag = createResponse.responseData;

            setAllTags((prev) => [...prev, createdTag]);
            setPermissionTagMap((prev) => ({ ...prev, [permissionId]: createdTag.id }));

            return createdTag.id;
        },
        [allPermissions, allTags, permissionTagMap],
    );

    const handleTogglePermission = async (permissionId: string) => {
        if (!selectedUser || isMutatingAssignments) {
            return;
        }

        setIsMutatingAssignments(true);

        try {
            const hasPermission = selectedUserPermissions.has(permissionId);

            if (hasPermission) {
                const currentAssigned = userPermissions.find(
                    (up) => up.user_id === selectedUser.id && up.permision_id === permissionId,
                );

                if (!currentAssigned) {
                    throw new Error("Không tìm thấy liên kết quyền để gỡ.");
                }

                await userTagsService.deleteUserTag(currentAssigned.id);
                toast.success("Đã gỡ quyền", "Quyền đã được gỡ bỏ thành công");
            } else {
                const tagId = await ensurePermissionTagId(permissionId);
                await userTagsService.createUserTags([
                    {
                        user_id: selectedUser.id,
                        tag_id: tagId,
                    },
                ]);
                toast.success("Đã gán quyền", "Quyền đã được gán thành công");
            }

            await refreshSelectedUserPermissions();
        } catch (error) {
            const message = error instanceof Error ? error.message : "Cập nhật phân quyền thất bại.";
            toast.error("Cập nhật thất bại", message);
        } finally {
            setIsMutatingAssignments(false);
        }
    };

    const handleToggleGroup = async (groupCode: string) => {
        if (!selectedUser || isMutatingAssignments) {
            return;
        }

        const groupPerms = permissionsByGroup[groupCode] ?? [];
        const allChecked = groupPerms.every((p) => selectedUserPermissions.has(p.id));

        setIsMutatingAssignments(true);

        try {
            if (allChecked) {
                const removeIds = userPermissions
                    .filter(
                        (up) =>
                            up.user_id === selectedUser.id &&
                            groupPerms.some((permission) => permission.id === up.permision_id),
                    )
                    .map((item) => item.id);

                await Promise.all(removeIds.map((id) => userTagsService.deleteUserTag(id)));
                toast.success("Đã gỡ nhóm quyền", "Tất cả quyền trong nhóm đã được gỡ.");
            } else {
                const permissionsToAdd = groupPerms.filter(
                    (permission) => !selectedUserPermissions.has(permission.id),
                );

                const payload = [] as Array<{ user_id: string; tag_id: string }>;

                for (const permission of permissionsToAdd) {
                    const tagId = await ensurePermissionTagId(permission.id);
                    payload.push({ user_id: selectedUser.id, tag_id: tagId });
                }

                if (payload.length > 0) {
                    await userTagsService.createUserTags(payload);
                }

                toast.success("Đã gán nhóm quyền", "Các quyền trong nhóm đã được gán thành công.");
            }

            await refreshSelectedUserPermissions();
        } catch (error) {
            const message = error instanceof Error ? error.message : "Cập nhật nhóm quyền thất bại.";
            toast.error("Cập nhật thất bại", message);
        } finally {
            setIsMutatingAssignments(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Chọn người dùng để phân quyền
                </h3>

                {selectedUser ? (
                    <div className="flex items-center justify-between p-3 bg-primary-50 border border-primary-200 rounded-lg">
                        <div className="flex items-center gap-3">
                            <Avatar name={selectedUser.full_name} size="sm" />
                            <div>
                                <p className="text-sm font-semibold text-gray-900">{selectedUser.full_name}</p>
                                <p className="text-xs text-gray-500">{selectedUser.email}</p>
                            </div>
                            <Badge variant={selectedUser.is_active ? "success" : "warning"}>
                                {selectedUser.is_active ? "Hoạt động" : "Ngừng"}
                            </Badge>
                        </div>
                        <button
                            onClick={handleClearUser}
                            className="text-xs text-primary-600 hover:text-primary-800 font-medium px-3 py-1.5 rounded-md hover:bg-primary-100 transition-colors"
                        >
                            Đổi người dùng
                        </button>
                    </div>
                ) : (
                    <div ref={searchRef} className="relative">
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setShowDropdown(true); }}
                                onFocus={() => searchQuery && setShowDropdown(true)}
                                placeholder="Tìm tên, email hoặc số điện thoại..."
                                disabled={isLoadingAssignments || isMutatingAssignments}
                                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>
                        {showDropdown && filteredUsers.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                                {filteredUsers.map((user) => (
                                    <button key={user.id} onClick={() => handleSelectUser(user)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left">
                                        <Avatar name={user.full_name} size="sm" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{user.full_name}</p>
                                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                        </div>
                                        <Badge variant={user.is_active ? "success" : "warning"}>
                                            {user.is_active ? "Hoạt động" : "Ngừng"}
                                        </Badge>
                                    </button>
                                ))}
                            </div>
                        )}
                        {showDropdown && searchQuery.trim() && filteredUsers.length === 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 px-4 py-6 text-center text-sm text-gray-400">
                                Không tìm thấy người dùng nào
                            </div>
                        )}
                    </div>
                )}
            </div>

            {selectedUser && (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-900">Danh sách quyền</h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {selectedUserPermissions.size} / {allPermissions.length} quyền được gán
                        </p>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {Object.entries(permissionsByGroup).map(([groupCode, perms]) => {
                            const allChecked = perms.every((p) => selectedUserPermissions.has(p.id));
                            const someChecked = perms.some((p) => selectedUserPermissions.has(p.id));
                            return (
                                <div key={groupCode} className="p-5">
                                    <div className="flex items-center gap-3 mb-3">
                                        <input
                                            type="checkbox"
                                            checked={allChecked}
                                            ref={(el) => { if (el) el.indeterminate = someChecked && !allChecked; }}
                                            onChange={() => {
                                                void handleToggleGroup(groupCode);
                                            }}
                                            disabled={isMutatingAssignments || isLoadingAssignments}
                                            className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                                        />
                                        <span className="text-sm font-semibold text-gray-800">
                                            {GROUP_LABELS[groupCode as PermissionGroup] ?? groupCode}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            ({perms.filter((p) => selectedUserPermissions.has(p.id)).length}/{perms.length})
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 xl:grid-cols-3 gap-2 pl-7">
                                        {perms.map((permission) => {
                                            const checked = selectedUserPermissions.has(permission.id);
                                            return (
                                                <label key={permission.id} className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${checked ? "bg-primary-50 border-primary-200" : "bg-gray-50 border-gray-200 hover:bg-gray-100"}`}>
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={() => {
                                                            void handleTogglePermission(permission.id);
                                                        }}
                                                        disabled={isMutatingAssignments || isLoadingAssignments}
                                                        className="mt-0.5 w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                                                    />
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium text-gray-800 leading-tight">{permission.name}</p>
                                                        <p className="text-xs text-gray-400 mt-0.5 font-mono">{permission.code}</p>
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {!selectedUser && (
                <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
                    <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-sm font-medium text-gray-500">Chọn người dùng để bắt đầu phân quyền</p>
                    <p className="text-xs mt-1">Tìm theo tên, email hoặc số điện thoại</p>
                </div>
            )}
        </div>
    );
}
