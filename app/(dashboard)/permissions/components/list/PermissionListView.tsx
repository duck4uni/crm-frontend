"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Permission, PermissionGroup } from "@/types/permission";
import { PermissionApiRow } from "@/types/api";
import { permissionsService } from "@/services/permissions";
import { PermissionFilters } from "./PermissionFilters";
import { PermissionSearch } from "./PermissionSearch";
import { PermissionTable } from "./PermissionTable";
import { ListPageLayout } from "@/components/ui/ListPageLayout";
import { PermissionFormModal } from "../forms/PermissionFormModal";
import { PermissionDetailModal } from "../forms/PermissionDetailModal";
import { useToast } from "@/components/ui/ToastProvider";

function mapApiRowToPermission(row: PermissionApiRow): Permission {
    return {
        id: row.id,
        name: row.name,
        code: row.code,
        description: row.description,
        group_code: (row.group_code as PermissionGroup) || PermissionGroup.USER,
    };
}

export function PermissionListView() {
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState<string>("all");
    const [isLoading, setIsLoading] = useState(true);
    const toast = useToast();

    // Modal states
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
    const [editingPermission, setEditingPermission] = useState<Permission | null>(null);

    const loadPermissions = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await permissionsService.getPermissions({ pageSize: "100" });
            const rows = response.responseData?.rows ?? [];
            setPermissions(rows.map(mapApiRowToPermission));
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Không thể tải danh sách quyền.";
            toast.error("Tải dữ liệu thất bại", msg);
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        loadPermissions();
    }, [loadPermissions]);

    // Filter counts
    const filterCounts = useMemo(() => {
        const counts: Record<string, number> = { all: permissions.length };
        Object.values(PermissionGroup).forEach((group) => {
            counts[group] = permissions.filter((p) => p.group_code === group).length;
        });
        return counts;
    }, [permissions]);

    // Filtered permissions
    const filteredPermissions = useMemo(() => {
        let filtered = permissions;

        if (activeFilter !== "all") {
            filtered = filtered.filter((p) => p.group_code === activeFilter);
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (p) =>
                    p.name.toLowerCase().includes(query) ||
                    p.code.toLowerCase().includes(query) ||
                    p.description.toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [permissions, activeFilter, searchQuery]);

    const handlePermissionClick = (permission: Permission) => {
        setSelectedPermission(permission);
        setIsDetailModalOpen(true);
    };

    const handleAddPermission = () => {
        setEditingPermission(null);
        setIsFormModalOpen(true);
    };

    const handleEditPermission = (permission: Permission) => {
        setEditingPermission(permission);
        setIsDetailModalOpen(false);
        setIsFormModalOpen(true);
    };

    const handleSavePermission = async (data: Partial<Permission>) => {
        try {
            if (editingPermission) {
                const response = await permissionsService.updatePermission(editingPermission.id, {
                    name: data.name,
                    code: data.code,
                    description: data.description,
                    group_code: data.group_code,
                });
                const updated = mapApiRowToPermission(response.responseData);
                setPermissions((prev) =>
                    prev.map((p) => (p.id === editingPermission.id ? updated : p))
                );
                toast.success("Cập nhật thành công", `Quyền "${data.name}" đã được cập nhật.`);
            } else {
                const response = await permissionsService.createPermissions([{
                    name: data.name || "",
                    code: data.code || "",
                    description: data.description,
                    group_code: data.group_code,
                }]);
                const created = (response.responseData ?? []).map(mapApiRowToPermission);
                setPermissions((prev) => [...prev, ...created]);
                toast.success("Thêm mới thành công", `Quyền "${data.name}" đã được thêm.`);
            }
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Thao tác thất bại.";
            toast.error("Lỗi", msg);
        }
    };

    const handleDeletePermission = (permission: Permission) => {
        setPermissions((prev) => prev.filter((p) => p.id !== permission.id));
        setIsDetailModalOpen(false);
        toast.success("Xóa thành công", `Quyền "${permission.name}" đã bị xóa.`);
    };

    return (
        <>
            <ListPageLayout
                items={filteredPermissions}
                isLoading={isLoading}
                loadingText="Đang tải danh sách quyền..."
                resetPageKey={`${activeFilter}|${searchQuery}`}
                renderFilters={
                    <PermissionFilters
                        activeFilter={activeFilter}
                        onFilterChange={setActiveFilter}
                        counts={filterCounts}
                    />
                }
                renderSearch={
                    <PermissionSearch
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        onAddPermission={handleAddPermission}
                    />
                }
                renderTable={(paged) => (
                    <PermissionTable
                        permissions={paged}
                        onPermissionClick={handlePermissionClick}
                        onPermissionEdit={handleEditPermission}
                        onPermissionDelete={handleDeletePermission}
                    />
                )}
            />

            <PermissionFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSave={handleSavePermission}
                permission={editingPermission}
            />

            <PermissionDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                permission={selectedPermission}
                onEdit={handleEditPermission}
                onDelete={handleDeletePermission}
            />
        </>
    );
}
