"use client";

import { useState, useMemo } from "react";
import { UserProfile } from "@/types/user";
import { mockUsers } from "@/mock-data/users";
import { UserFilters } from "./UserFilters";
import { UserSearch } from "./UserSearch";
import { UserTable } from "./UserTable";
import { UserFormModal } from "../forms/UserFormModal";
import { UserDetailModal } from "../forms/UserDetailModal";
import { useToast } from "@/components/ui/ToastProvider";

export function UserListView() {
    const [users, setUsers] = useState<UserProfile[]>(mockUsers);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive" | "deleted">("all");
    const toast = useToast();

    // Modal states
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

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

        // Apply status filter
        if (activeFilter === "active") {
            filtered = filtered.filter((u) => u.is_active && !u.is_delete);
        } else if (activeFilter === "inactive") {
            filtered = filtered.filter((u) => !u.is_active && !u.is_delete);
        } else if (activeFilter === "deleted") {
            filtered = filtered.filter((u) => u.is_delete);
        }

        // Apply search filter
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

    const handleSaveUser = (userData: Partial<UserProfile>) => {
        if (editingUser) {
            setUsers((prev) =>
                prev.map((u) => (u.id === editingUser.id ? { ...u, ...userData, updated_at: new Date() } : u))
            );
            toast.success("Cập nhật thành công", `Người dùng "${userData.full_name}" đã được cập nhật.`);
        } else {
            const newUser: UserProfile = {
                id: `u${Date.now()}`,
                email: userData.email || "",
                full_name: userData.full_name || "",
                phone: userData.phone || "",
                avatar: userData.avatar || "",
                birthday: userData.birthday,
                is_active: true,
                is_delete: false,
                created_at: new Date(),
                updated_at: new Date(),
            };
            setUsers((prev) => [newUser, ...prev]);
            toast.success("Thêm mới thành công", `Người dùng "${userData.full_name}" đã được thêm.`);
        }
    };

    const handleDeleteUser = (user: UserProfile) => {
        setUsers((prev) =>
            prev.map((u) => (u.id === user.id ? { ...u, is_delete: true, is_active: false } : u))
        );
        setIsDetailModalOpen(false);
        toast.success("Xóa thành công", `Người dùng "${user.full_name}" đã bị xóa.`);
    };

    const handleExport = () => {
        toast.success("Xuất file thành công", `Đã xuất ${filteredUsers.length} người dùng`);
    };

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
