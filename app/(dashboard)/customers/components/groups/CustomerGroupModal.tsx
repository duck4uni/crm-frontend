"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/ToastProvider";
import { customersService } from "@/services/customers";
import { customerTagsService } from "@/services/customer-tags";
import { tagsService } from "@/services/tags";
import { CustomerTagApiRow } from "@/types/api";
import { Check, Edit2, Plus, Trash2, Users } from "lucide-react";

interface CustomerGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCustomerIds: string[];
  onSelectGroup: (groupId: string) => void;
  onAssignmentChanged?: () => Promise<void> | void;
}

interface CustomerGroup {
  id: string;
  name: string;
  customerCount: number;
}

interface GroupMemberItem {
  customerTagId: string;
  customerId: string;
  customerName: string;
  phone?: string;
}

const DEFAULT_PAGE_SIZE = "500";

function toApiError(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function CustomerGroupModal({
  isOpen,
  onClose,
  selectedCustomerIds,
  onSelectGroup,
  onAssignmentChanged,
}: CustomerGroupModalProps) {
  const toast = useToast();

  const [groups, setGroups] = useState<CustomerGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [isCreating, setIsCreating] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupName, setEditingGroupName] = useState("");

  const [groupMembers, setGroupMembers] = useState<GroupMemberItem[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const customerInfoCacheRef = useRef<Record<string, { customerName: string; phone?: string }>>({});

  const [isSaving, setIsSaving] = useState(false);

  const selectedCount = selectedCustomerIds.length;

  const loadGroupData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [tagsResponse, customerTagsResponse] = await Promise.all([
        tagsService.getTags({ currentPage: "1", pageSize: DEFAULT_PAGE_SIZE }),
        customerTagsService.getCustomerTags({ currentPage: "1", pageSize: "5000" }),
      ]);

      const tags = tagsResponse.responseData?.rows || [];
      const customerTags = customerTagsResponse.responseData?.rows || [];

      const countByTagId = customerTags.reduce<Record<string, number>>((acc, row) => {
        if (!row.tag_id) {
          return acc;
        }

        acc[row.tag_id] = (acc[row.tag_id] || 0) + 1;
        return acc;
      }, {});

      const mappedGroups = tags
        .map((tag) => ({
          id: tag.id,
          name: tag.name,
          customerCount: countByTagId[tag.id] || 0,
        }))
        .sort((a, b) => a.name.localeCompare(b.name, "vi"));

      setGroups(mappedGroups);

      if (selectedGroupId && !mappedGroups.find((group) => group.id === selectedGroupId)) {
        setSelectedGroupId(null);
      }
    } catch (error) {
      toast.error("Không thể tải nhóm khách hàng", toApiError(error, "Đã có lỗi xảy ra."));
    } finally {
      setIsLoading(false);
    }
  }, [selectedGroupId, toast]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    void loadGroupData();
  }, [isOpen, loadGroupData]);

  const groupNameMap = useMemo(() => {
    return groups.reduce<Record<string, string>>((acc, group) => {
      acc[group.id] = group.name;
      return acc;
    }, {});
  }, [groups]);

  const getCustomerTagsByTagId = useCallback(async (tagId: string): Promise<CustomerTagApiRow[]> => {
    const response = await customerTagsService.getCustomerTagsByTagId(tagId, {
      currentPage: "1",
      pageSize: "5000",
    });

    return response.responseData?.rows || [];
  }, []);

  const resolveCustomerInfo = useCallback(
    async (customerId: string): Promise<{ customerName: string; phone?: string }> => {
      const cached = customerInfoCacheRef.current[customerId];
      if (cached) {
        return cached;
      }

      try {
        const response = await customersService.getCustomer(customerId);
        const row = response.responseData;
        const customerName =
          row?.full_name ||
          `${row?.last_name || ""} ${row?.first_name || ""}`.trim() ||
          row?.email ||
          customerId;
        const info = {
          customerName,
          phone: row?.phone || undefined,
        };
        customerInfoCacheRef.current[customerId] = info;
        return info;
      } catch {
        const fallback = { customerName: customerId };
        customerInfoCacheRef.current[customerId] = fallback;
        return fallback;
      }
    },
    [],
  );

  const loadSelectedGroupMembers = useCallback(
    async (tagId: string) => {
      setIsLoadingMembers(true);
      try {
        const links = await getCustomerTagsByTagId(tagId);
        const mappedMembers = await Promise.all(
          links.map(async (link) => {
            const info = await resolveCustomerInfo(link.customer_id);
            return {
              customerTagId: link.id,
              customerId: link.customer_id,
              customerName: info.customerName,
              phone: info.phone,
            } satisfies GroupMemberItem;
          }),
        );

        setGroupMembers(
          mappedMembers.sort((a, b) => a.customerName.localeCompare(b.customerName, "vi")),
        );
      } catch (error) {
        toast.error("Không thể tải khách hàng trong nhóm", toApiError(error, "Đã có lỗi xảy ra."));
        setGroupMembers([]);
      } finally {
        setIsLoadingMembers(false);
      }
    },
    [getCustomerTagsByTagId, resolveCustomerInfo, toast],
  );

  useEffect(() => {
    if (!isOpen || !selectedGroupId) {
      setGroupMembers([]);
      return;
    }

    void loadSelectedGroupMembers(selectedGroupId);
  }, [isOpen, selectedGroupId, loadSelectedGroupMembers]);

  const handleCreateGroup = async () => {
    const name = newGroupName.trim();
    if (!name) {
      toast.error("Tên nhóm không hợp lệ", "Vui lòng nhập tên nhóm khách hàng.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await tagsService.createTag({ name });
      const createdTag = response.responseData;
      setIsCreating(false);
      setNewGroupName("");
      if (createdTag?.id) {
        setSelectedGroupId(createdTag.id);
        onSelectGroup(createdTag.id);
      }
      toast.success("Tạo nhóm thành công", `Đã tạo nhóm "${name}".`);
      await loadGroupData();
    } catch (error) {
      toast.error("Tạo nhóm thất bại", toApiError(error, "Không thể tạo nhóm khách hàng."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartEditGroup = (group: CustomerGroup) => {
    setEditingGroupId(group.id);
    setEditingGroupName(group.name);
  };

  const handleSaveEditGroup = async () => {
    if (!editingGroupId) {
      return;
    }

    const name = editingGroupName.trim();
    if (!name) {
      toast.error("Tên nhóm không hợp lệ", "Tên nhóm không được để trống.");
      return;
    }

    setIsSaving(true);
    try {
      await tagsService.updateTag(editingGroupId, { name });
      toast.success("Cập nhật nhóm thành công", `Đã cập nhật tên nhóm thành "${name}".`);
      setEditingGroupId(null);
      setEditingGroupName("");
      await loadGroupData();
    } catch (error) {
      toast.error("Cập nhật nhóm thất bại", toApiError(error, "Không thể cập nhật nhóm."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteGroup = async (group: CustomerGroup) => {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa nhóm "${group.name}"? Tất cả liên kết khách hàng trong nhóm này sẽ bị xóa.`,
    );

    if (!confirmed) {
      return;
    }

    setIsSaving(true);
    try {
      const customerTags = await getCustomerTagsByTagId(group.id);
      if (customerTags.length > 0) {
        await Promise.all(customerTags.map((customerTag) => customerTagsService.deleteCustomerTag(customerTag.id)));
      }

      await tagsService.deleteTag(group.id);

      if (selectedGroupId === group.id) {
        setSelectedGroupId(null);
      }

      toast.success("Xóa nhóm thành công", `Đã xóa nhóm "${group.name}".`);
      await onAssignmentChanged?.();
      await loadGroupData();
    } catch (error) {
      toast.error("Xóa nhóm thất bại", toApiError(error, "Không thể xóa nhóm khách hàng."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleAssignSelectedCustomers = async () => {
    if (!selectedGroupId) {
      toast.error("Chưa chọn nhóm", "Vui lòng chọn một nhóm khách hàng.");
      return;
    }

    if (selectedCustomerIds.length === 0) {
      toast.error("Chưa chọn khách hàng", "Vui lòng chọn ít nhất một khách hàng trong bảng danh sách.");
      return;
    }

    setIsSaving(true);
    try {
      const existingCustomerTags = await getCustomerTagsByTagId(selectedGroupId);
      const existingCustomerIdSet = new Set(existingCustomerTags.map((item) => item.customer_id));

      const payload = selectedCustomerIds
        .filter((customerId) => !existingCustomerIdSet.has(customerId))
        .map((customerId) => ({
          customer_id: customerId,
          tag_id: selectedGroupId,
        }));

      if (payload.length === 0) {
        toast.success(
          "Không có thay đổi",
          "Các khách hàng đã chọn đã thuộc nhóm này từ trước.",
        );
        return;
      }

      await customerTagsService.createCustomerTags(payload);
      onSelectGroup(selectedGroupId);
      await onAssignmentChanged?.();
      await loadGroupData();
      await loadSelectedGroupMembers(selectedGroupId);

      const groupName = groupNameMap[selectedGroupId] || "nhóm đã chọn";
      toast.success("Gán nhóm thành công", `Đã thêm ${payload.length} khách hàng vào ${groupName}.`);
    } catch (error) {
      toast.error("Gán nhóm thất bại", toApiError(error, "Không thể thêm khách hàng vào nhóm."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveSelectedCustomers = async () => {
    if (!selectedGroupId) {
      toast.error("Chưa chọn nhóm", "Vui lòng chọn một nhóm khách hàng.");
      return;
    }

    if (selectedCustomerIds.length === 0) {
      toast.error("Chưa chọn khách hàng", "Vui lòng chọn ít nhất một khách hàng trong bảng danh sách.");
      return;
    }

    setIsSaving(true);
    try {
      const existingCustomerTags = await getCustomerTagsByTagId(selectedGroupId);
      const linksToDelete = existingCustomerTags.filter((item) =>
        selectedCustomerIds.includes(item.customer_id),
      );

      if (linksToDelete.length === 0) {
        toast.success(
          "Không có thay đổi",
          "Các khách hàng đã chọn chưa thuộc nhóm này.",
        );
        return;
      }

      await Promise.all(linksToDelete.map((item) => customerTagsService.deleteCustomerTag(item.id)));
      await onAssignmentChanged?.();
      await loadGroupData();
      await loadSelectedGroupMembers(selectedGroupId);

      const groupName = groupNameMap[selectedGroupId] || "nhóm đã chọn";
      toast.success("Xóa khỏi nhóm thành công", `Đã xóa ${linksToDelete.length} khách hàng khỏi ${groupName}.`);
    } catch (error) {
      toast.error("Xóa khỏi nhóm thất bại", toApiError(error, "Không thể xóa khách hàng khỏi nhóm."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveSingleMember = async (member: GroupMemberItem) => {
    if (!selectedGroupId) {
      return;
    }

    setIsSaving(true);
    try {
      await customerTagsService.deleteCustomerTag(member.customerTagId);
      await onAssignmentChanged?.();
      await loadGroupData();
      await loadSelectedGroupMembers(selectedGroupId);
      const groupName = groupNameMap[selectedGroupId] || "nhóm đã chọn";
      toast.success("Xóa khách khỏi nhóm thành công", `Đã xóa ${member.customerName} khỏi ${groupName}.`);
    } catch (error) {
      toast.error("Xóa khách khỏi nhóm thất bại", toApiError(error, "Không thể xóa khách hàng khỏi nhóm."));
    } finally {
      setIsSaving(false);
    }
  };

  return (
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
              className="w-full flex items-center justify-center gap-2 py-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
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
                  setSelectedGroupId(group.id);
                  onSelectGroup(group.id);
                }}
                className={`
                  p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md group
                  ${
                    selectedGroupId === group.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white flex-shrink-0">
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
                          {selectedGroupId === group.id && <Check className="w-5 h-5 text-blue-600" />}
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
  );
}
