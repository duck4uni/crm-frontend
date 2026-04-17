"use client";

import { UserFilters } from "./UserFilters";
import { UserSearch } from "./UserSearch";
import { UserTable } from "./UserTable";
import { ListPageLayout } from "@/components/ui/ListPageLayout";
import { useUsersPage } from "../../hooks/useUsersPage";

export function UserListView() {
    const {
        isLoading,
        userRolesByUser,
        searchQuery,
        setSearchQuery,
        activeFilter,
        setActiveFilter,
        filterCounts,
        filteredUsers,
        handleUserClick,
        handleAddUser,
        handleEditUser,
        handleRequestDeleteUser,
        handleExport,
        DeleteConfirmationDialog,
    } = useUsersPage();

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
