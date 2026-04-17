import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDeleteConfirmation } from "@/components/ui/useDeleteConfirmation";
import { useToast } from "@/components/ui/ToastProvider";
import { customerTagsService } from "@/services/customer-tags";
import { customersService } from "@/services/customers";
import { tagsService } from "@/services/tags";
import { CustomerTagApiRow } from "@/types/api";
import { toErrorMessage } from "@/lib/utils";

interface UseCustomerGroupModalParams {
  isOpen: boolean;
  selectedCustomerIds: string[];
  onSelectGroup: (groupId: string) => void;
  onAssignmentChanged?: () => Promise<void> | void;
}

export interface CustomerGroup {
  id: string;
  name: string;
  customerCount: number;
}

export interface GroupMemberItem {
  customerTagId: string;
  customerId: string;
  customerName: string;
  phone?: string;
}

const DEFAULT_PAGE_SIZE = "500";

export function useCustomerGroupModal({
  isOpen,
  selectedCustomerIds,
  onSelectGroup,
  onAssignmentChanged,
}: UseCustomerGroupModalParams) {
  const toast = useToast();
  const { requestDeleteConfirmation, DeleteConfirmationDialog } = useDeleteConfirmation();

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
      toast.error("Không thể tải nhóm khách hàng", toErrorMessage(error, "Đã có lỗi xảy ra."));
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
        toast.error("Không thể tải khách hàng trong nhóm", toErrorMessage(error, "Đã có lỗi xảy ra."));
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

  const handleCreateGroup = useCallback(async () => {
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
      toast.error("Tạo nhóm thất bại", toErrorMessage(error, "Không thể tạo nhóm khách hàng."));
    } finally {
      setIsSaving(false);
    }
  }, [loadGroupData, newGroupName, onSelectGroup, toast]);

  const handleStartEditGroup = useCallback((group: CustomerGroup) => {
    setEditingGroupId(group.id);
    setEditingGroupName(group.name);
  }, []);

  const handleSaveEditGroup = useCallback(async () => {
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
      toast.error("Cập nhật nhóm thất bại", toErrorMessage(error, "Không thể cập nhật nhóm."));
    } finally {
      setIsSaving(false);
    }
  }, [editingGroupId, editingGroupName, loadGroupData, toast]);

  const handleDeleteGroup = useCallback((group: CustomerGroup) => {
    requestDeleteConfirmation({
      title: "Xóa nhóm",
      description: `Bạn có chắc chắn muốn xóa nhóm "${group.name}"? Tất cả liên kết khách hàng trong nhóm này sẽ bị xóa.`,
      onConfirm: async () => {
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
          toast.error("Xóa nhóm thất bại", toErrorMessage(error, "Không thể xóa nhóm khách hàng."));
        } finally {
          setIsSaving(false);
        }
      },
    });
  }, [getCustomerTagsByTagId, loadGroupData, onAssignmentChanged, requestDeleteConfirmation, selectedGroupId, toast]);

  const handleAssignSelectedCustomers = useCallback(async () => {
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
      toast.error("Gán nhóm thất bại", toErrorMessage(error, "Không thể thêm khách hàng vào nhóm."));
    } finally {
      setIsSaving(false);
    }
  }, [getCustomerTagsByTagId, groupNameMap, loadGroupData, loadSelectedGroupMembers, onAssignmentChanged, onSelectGroup, selectedCustomerIds, selectedGroupId, toast]);

  const handleRemoveSelectedCustomers = useCallback(async () => {
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
      toast.error("Xóa khỏi nhóm thất bại", toErrorMessage(error, "Không thể xóa khách hàng khỏi nhóm."));
    } finally {
      setIsSaving(false);
    }
  }, [getCustomerTagsByTagId, groupNameMap, loadGroupData, loadSelectedGroupMembers, onAssignmentChanged, selectedCustomerIds, selectedGroupId, toast]);

  const handleRemoveSingleMember = useCallback(async (member: GroupMemberItem) => {
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
      toast.error("Xóa khách khỏi nhóm thất bại", toErrorMessage(error, "Không thể xóa khách hàng khỏi nhóm."));
    } finally {
      setIsSaving(false);
    }
  }, [groupNameMap, loadGroupData, loadSelectedGroupMembers, onAssignmentChanged, selectedGroupId, toast]);

  const selectGroup = useCallback((groupId: string) => {
    setSelectedGroupId(groupId);
    onSelectGroup(groupId);
  }, [onSelectGroup]);

  return {
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
  };
}
