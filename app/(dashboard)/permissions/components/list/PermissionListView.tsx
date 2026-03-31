"use client";

import { useState, useMemo } from "react";
import { Permission, PermissionGroup } from "@/types/permission";
import { mockPermissions } from "@/mock-data/permissions";
import { PermissionFilters } from "./PermissionFilters";
import { PermissionSearch } from "./PermissionSearch";
import { PermissionTable } from "./PermissionTable";
import { PermissionFormModal } from "../forms/PermissionFormModal";
import { PermissionDetailModal } from "../forms/PermissionDetailModal";
import { useToast } from "@/components/ui/ToastProvider";

export function PermissionListView() {
    const [permissions, setPermissions] = useState<Permission[]>(mockPermissions);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState<string>("all");
    const toast = useToast();

    // Modal states
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
    const [editingPermission, setEditingPermission] = useState<Permission | null>(null);

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

    const handleSavePermission = (data: Partial<Permission>) => {
        if (editingPermission) {
            setPermissions((prev) =>
                prev.map((p) => (p.id === editingPermission.id ? { ...p, ...data } : p))
            );
            toast.success("Cập nhật thành công", `Quyền "${data.name}" đã được cập nhật.`);
        } else {
            const newPermission: Permission = {
                id: `p${Date.now()}`,
                name: data.name || "",
                code: data.code || "",
                description: data.description || "",
                group_code: data.group_code || PermissionGroup.USER,
            };
            setPermissions((prev) => [...prev, newPermission]);
            toast.success("Thêm mới thành công", `Quyền "${data.name}" đã được thêm.`);
        }
    };

    const handleDeletePermission = (permission: Permission) => {
        setPermissions((prev) => prev.filter((p) => p.id !== permission.id));
        setIsDetailModalOpen(false);
        toast.success("Xóa thành công", `Quyền "${permission.name}" đã bị xóa.`);
    };

    return (
        <div className="space-y-6">
            <PermissionFilters
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                counts={filterCounts}
            />

            <PermissionSearch
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onAddPermission={handleAddPermission}
            />

            <PermissionTable
                permissions={filteredPermissions}
                onPermissionClick={handlePermissionClick}
                onPermissionEdit={handleEditPermission}
                onPermissionDelete={handleDeletePermission}
            />

            <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Tổng số: {filteredPermissions.length} quyền</span>
                    <span>{Object.values(PermissionGroup).length} nhóm quyền</span>
                </div>
            </div>

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
        </div>
    );
}
