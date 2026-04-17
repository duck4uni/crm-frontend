"use client";

import { Button } from "@/components/ui/Button";
import { ArrowLeft, Users } from "lucide-react";
import { AddableCustomersPanel } from "./components/AddableCustomersPanel";
import { GroupMembersPanel } from "./components/GroupMembersPanel";
import { useCustomerGroupDetailPage } from "./hooks/useCustomerGroupDetailPage";

export default function CustomerGroupDetailPage() {
    const {
        groupName,
        isLoading,
        isSaving,
        members,
        selectedToRemoveSet,
        selectedToRemoveCount,
        isAllMembersSelected,
        addableCustomers,
        selectedToAddSet,
        selectedToAddCount,
        searchAdd,
        setSearchAdd,
        assigneeEditorRef,
        assigneeSearchInputRef,
        editingAssigneeCustomer,
        assigneeSearchKeyword,
        setAssigneeSearchKeyword,
        assigneeDraftIds,
        userOptionsLength,
        filteredAssigneeOptionsLength,
        allFilteredAssigneesSelected,
        filteredLeaderOptions,
        filteredWorkerOptions,
        isAssigningCurrentCustomer,
        toggleSelectAllMembers,
        toggleRemoveSelection,
        openAssigneeEditor,
        toggleAssigneeSelection,
        toggleSelectAllFilteredAssignees,
        toggleAddSelection,
        handleAddSelectedCustomers,
        handleRemoveSelectedCustomers,
        handleRemoveSingleCustomer,
        handleAssignCustomerOwner,
        cancelAssigneeEdit,
        goToGroupList,
        goToCustomers,
    } = useCustomerGroupDetailPage();

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Nhóm: {groupName || "..."}</h1>
                    <p className="text-sm text-gray-500 mt-1">Quản lý khách hàng thuộc nhóm và thêm/xóa thành viên theo lô.</p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <Button variant="outline" onClick={goToGroupList}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Danh sách nhóm
                    </Button>
                    <Button variant="outline" onClick={goToCustomers}>
                        <Users className="w-4 h-4 mr-2" />
                        Danh sách khách hàng
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_1fr] gap-6">
                <GroupMembersPanel
                    members={members}
                    selectedToRemoveSet={selectedToRemoveSet}
                    isAllMembersSelected={isAllMembersSelected}
                    isSaving={isSaving}
                    selectedToRemoveCount={selectedToRemoveCount}
                    onToggleSelectAllMembers={toggleSelectAllMembers}
                    onRemoveSelected={() => void handleRemoveSelectedCustomers()}
                    onToggleRemoveSelection={toggleRemoveSelection}
                    onOpenAssigneeEditor={openAssigneeEditor}
                    onRemoveSingleCustomer={(customerTagId) => void handleRemoveSingleCustomer(customerTagId)}
                    editingAssigneeCustomer={editingAssigneeCustomer}
                    assigneeEditorRef={assigneeEditorRef}
                    assigneeSearchInputRef={assigneeSearchInputRef}
                    assigneeSearchKeyword={assigneeSearchKeyword}
                    onAssigneeSearchKeywordChange={setAssigneeSearchKeyword}
                    assigneeDraftIds={assigneeDraftIds}
                    userOptionsLength={userOptionsLength}
                    filteredAssigneeOptionsLength={filteredAssigneeOptionsLength}
                    allFilteredAssigneesSelected={allFilteredAssigneesSelected}
                    isAssigningCurrentCustomer={isAssigningCurrentCustomer}
                    onCancelAssigneeEdit={cancelAssigneeEdit}
                    onSaveAssignee={() => void handleAssignCustomerOwner()}
                    onToggleSelectAllFilteredAssignees={toggleSelectAllFilteredAssignees}
                    filteredLeaderOptions={filteredLeaderOptions}
                    filteredWorkerOptions={filteredWorkerOptions}
                    onToggleAssigneeSelection={toggleAssigneeSelection}
                />

                <AddableCustomersPanel
                    addableCustomers={addableCustomers}
                    selectedToAddSet={selectedToAddSet}
                    selectedToAddCount={selectedToAddCount}
                    searchAdd={searchAdd}
                    isSaving={isSaving}
                    onSearchAddChange={setSearchAdd}
                    onToggleAddSelection={toggleAddSelection}
                    onAddSelectedCustomers={() => void handleAddSelectedCustomers()}
                />
            </div>

            {isLoading && <div className="text-sm text-gray-500">Đang tải dữ liệu nhóm khách hàng...</div>}
        </div>
    );
}
