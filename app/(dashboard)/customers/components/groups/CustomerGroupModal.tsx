"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Check, Edit2, Plus, Trash2, Users } from "lucide-react";
import { useCustomerGroupModal } from "./hooks/useCustomerGroupModal";

interface CustomerGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCustomerIds: string[];
  onSelectGroup: (groupId: string) => void;
  onAssignmentChanged?: () => Promise<void> | void;
}

export function CustomerGroupModal({
  isOpen,
  onClose,
  selectedCustomerIds,
  onSelectGroup,
  onAssignmentChanged,
}: CustomerGroupModalProps) {
  const {
    groups,
    selectedGroupId,
    isLoading,
    isCreating,
    setIsCreating,
    newGroupName,
    setNewGroupName,
    editingGroupId,
    setEditingGroupId,
    editingGroupName,
    setEditingGroupName,
    groupMembers,
    isLoadingMembers,
    isSaving,
    selectedCount,
    groupNameMap,
    handleCreateGroup,
    handleStartEditGroup,
    handleSaveEditGroup,
    handleDeleteGroup,
    handleAssignSelectedCustomers,
    handleRemoveSelectedCustomers,
    handleRemoveSingleMember,
    selectGroup,
    DeleteConfirmationDialog,
  } = useCustomerGroupModal({
    isOpen,
    selectedCustomerIds,
    onSelectGroup,
    onAssignmentChanged,
  });

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Quản lý nhóm khách hàng"
        size="lg"
        footer={
          <div className="flex gap-3 justify-end flex-wrap">
            <Button variant="outline" onClick={onClose} disabled={isSaving}>
              Đóng
            </Button>
            <Button
              variant="outline"
              onClick={handleRemoveSelectedCustomers}
              disabled={isSaving || !selectedGroupId || selectedCount === 0}
            >
              Xóa {selectedCount > 0 ? selectedCount : ""} khách khỏi nhóm
            </Button>
            <Button
              variant="primary"
              onClick={handleAssignSelectedCustomers}
              disabled={isSaving || !selectedGroupId || selectedCount === 0}
            >
              Thêm {selectedCount > 0 ? selectedCount : ""} khách vào nhóm
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            Đã chọn <span className="font-semibold text-gray-900">{selectedCount}</span> khách hàng trong danh sách.
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            {!isCreating ? (
              <button
                onClick={() => setIsCreating(true)}
                className="w-full flex items-center justify-center gap-2 py-2 text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors"
                disabled={isSaving}
              >
                <Plus className="w-4 h-4" />
                Tạo nhóm mới
              </button>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="Tên nhóm khách hàng"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      void handleCreateGroup();
                    }
                  }}
                  autoFocus
                  disabled={isSaving}
                />
                <Button variant="primary" onClick={() => void handleCreateGroup()} disabled={isSaving}>
                  Tạo
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false);
                    setNewGroupName("");
                  }}
                  disabled={isSaving}
                >
                  Hủy
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {isLoading && <p className="text-sm text-gray-500">Đang tải nhóm khách hàng...</p>}

            {!isLoading && groups.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">Chưa có nhóm khách hàng</p>
              </div>
            )}

            {!isLoading &&
              groups.map((group) => (
                <div
                  key={group.id}
                  onClick={() => {
                    selectGroup(group.id);
                  }}
                  className={`
                  p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md group
                  ${selectedGroupId === group.id
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                    }
                `}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                      <Users className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      {editingGroupId === group.id ? (
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <Input
                            value={editingGroupName}
                            onChange={(e) => setEditingGroupName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                void handleSaveEditGroup();
                              }
                            }}
                            disabled={isSaving}
                          />
                          <Button variant="primary" onClick={() => void handleSaveEditGroup()} disabled={isSaving}>
                            Lưu
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setEditingGroupId(null);
                              setEditingGroupName("");
                            }}
                            disabled={isSaving}
                          >
                            Hủy
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900">{group.name}</h4>
                            {selectedGroupId === group.id && <Check className="w-5 h-5 text-primary-600" />}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{group.customerCount} khách hàng</p>
                        </>
                      )}
                    </div>

                    {editingGroupId !== group.id && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleStartEditGroup(group)}
                          className="p-2 hover:bg-gray-100 rounded transition-colors"
                          title="Sửa tên nhóm"
                          disabled={isSaving}
                        >
                          <Edit2 className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => void handleDeleteGroup(group)}
                          className="p-2 hover:bg-red-100 rounded transition-colors"
                          title="Xóa nhóm"
                          disabled={isSaving}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>

          {selectedGroupId && (
            <div className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-900">
                  Khách hàng trong nhóm: {groupNameMap[selectedGroupId] || "Nhóm đã chọn"}
                </h4>
                <span className="text-xs text-gray-500">{groupMembers.length} khách hàng</span>
              </div>

              {isLoadingMembers && <p className="text-sm text-gray-500">Đang tải danh sách khách trong nhóm...</p>}

              {!isLoadingMembers && groupMembers.length === 0 && (
                <p className="text-sm text-gray-500">Nhóm này hiện chưa có khách hàng nào.</p>
              )}

              {!isLoadingMembers && groupMembers.length > 0 && (
                <div className="max-h-56 overflow-y-auto divide-y divide-gray-100 border border-gray-100 rounded-md">
                  {groupMembers.map((member) => (
                    <div key={member.customerTagId} className="flex items-center justify-between px-3 py-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{member.customerName}</p>
                        <p className="text-xs text-gray-500 truncate">{member.phone || member.customerId}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => void handleRemoveSingleMember(member)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Xóa khách hàng khỏi nhóm"
                        disabled={isSaving}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
      <DeleteConfirmationDialog />
    </>
  );
}
