"use client";

import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, Search } from "lucide-react";
import { CustomerGroupsTable } from "./components/CustomerGroupsTable";
import { useCustomerGroupsPage } from "./hooks/useCustomerGroupsPage";

export default function CustomerGroupsPage() {
    const {
        groups,
        filteredGroups,
        isLoading,
        isCreating,
        newGroupName,
        setNewGroupName,
        searchQuery,
        setSearchQuery,
        userOptions,
        groupOwnerByTagId,
        assigningGroupId,
        handleAssignGroupOwner,
        handleCreateGroup,
        handleDeleteGroup,
        openGroupDetail,
        DeleteConfirmationDialog,
    } = useCustomerGroupsPage();

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý nhóm khách hàng</h1>
                    <p className="text-sm text-gray-500 mt-1">Quản lý danh sách nhóm và truy cập nhanh trang thành viên theo từng nhóm.</p>
                </div>
            </div>

            <Card>
                <CardContent>
                    <div className="flex items-center justify-between gap-3 flex-wrap mb-4 pb-3 border-b border-gray-100">
                        <p className="text-sm text-gray-600">Tạo mới và tìm kiếm nhóm khách hàng</p>
                        <p className="text-sm text-gray-600">
                            Tổng số nhóm: <span className="font-semibold text-gray-900">{groups.length}</span>
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-end">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tạo nhóm mới</label>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <Input
                                    placeholder="Nhập tên nhóm mới"
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            void handleCreateGroup();
                                        }
                                    }}
                                    disabled={isCreating}
                                />
                                <Button
                                    variant="primary"
                                    onClick={() => void handleCreateGroup()}
                                    disabled={isCreating}
                                    className="whitespace-nowrap sm:self-end"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Thêm nhóm mới
                                </Button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm nhóm</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="Tìm nhanh nhóm khách hàng"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <CustomerGroupsTable
                groups={filteredGroups}
                isLoading={isLoading}
                userOptions={userOptions}
                groupOwnerByTagId={groupOwnerByTagId}
                assigningGroupId={assigningGroupId}
                onAssignGroupOwner={(groupId, userId) => void handleAssignGroupOwner(groupId, userId)}
                onOpenGroupDetail={openGroupDetail}
                onDeleteGroup={(group) => void handleDeleteGroup(group)}
            />

            {isLoading && <p className="text-sm text-gray-500">Đang tải danh sách nhóm khách hàng...</p>}
            <DeleteConfirmationDialog />
        </div>
    );
}
