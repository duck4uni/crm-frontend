"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/ToastProvider";
import { customerTagsService } from "@/services/customer-tags";
import { tagsService } from "@/services/tags";
import { userTagsService } from "@/services/user-tags";
import { usersService } from "@/services/users";
import { ArrowLeft, Plus, Search, Trash2, Users } from "lucide-react";

interface GroupItem {
  id: string;
  name: string;
  customerCount: number;
}

interface UserOption {
  id: string;
  label: string;
}

const TAG_PAGE_SIZE = "500";
const LINK_PAGE_SIZE = "5000";
const SITE_LEADER_PERMISSION_NAME = "SITE LEADER";

function toErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export default function CustomerGroupsPage() {
  const router = useRouter();
  const toast = useToast();

  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [groupOwnerByTagId, setGroupOwnerByTagId] = useState<Record<string, string>>({});
  const [assigningGroupId, setAssigningGroupId] = useState<string | null>(null);

  const loadGroups = useCallback(async () => {
    setIsLoading(true);
    try {
      const [tagsRes, linksRes, usersRes, userTagsRes] = await Promise.all([
        tagsService.getTags({ currentPage: "1", pageSize: TAG_PAGE_SIZE }),
        customerTagsService.getCustomerTags({ currentPage: "1", pageSize: LINK_PAGE_SIZE }),
        usersService.getAdminUsers({ currentPage: "1", pageSize: "500" }),
        userTagsService.getUserTags({ currentPage: "1", pageSize: LINK_PAGE_SIZE }),
      ]);

      const tags = tagsRes.responseData?.rows || [];
      const links = linksRes.responseData?.rows || [];

      const countByTagId = links.reduce<Record<string, number>>((acc, link) => {
        acc[link.tag_id] = (acc[link.tag_id] || 0) + 1;
        return acc;
      }, {});

      const nextGroups = tags
        .map((tag) => ({
          id: tag.id,
          name: tag.name,
          customerCount: countByTagId[tag.id] || 0,
        }))
        .sort((a, b) => a.name.localeCompare(b.name, "vi"));

      setGroups(nextGroups);

      const mappedUsers = (usersRes?.responseData?.rows || [])
        .filter((user) =>
          (user.user_permisions || []).some(
            (permissionItem) =>
              permissionItem.permision?.name?.trim().toUpperCase() === SITE_LEADER_PERMISSION_NAME,
          ),
        )
        .map((user) => ({
          id: user.id,
          label: user.full_name?.trim() || user.email || user.id,
        }))
        .sort((a, b) => a.label.localeCompare(b.label, "vi"));
      setUserOptions(mappedUsers);

      const ownerMap: Record<string, string> = {};
      (userTagsRes?.responseData?.rows || []).forEach((row) => {
        if (!ownerMap[row.tag_id]) {
          ownerMap[row.tag_id] = row.user_id;
        }
      });
      setGroupOwnerByTagId(ownerMap);
    } catch (error) {
      toast.error("Không thể tải danh sách nhóm", toErrorMessage(error, "Đã có lỗi xảy ra."));
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const handleAssignGroupOwner = async (groupId: string, userId: string) => {
    setAssigningGroupId(groupId);
    try {
      const existingRes = await userTagsService.getUserTagsByTagId(groupId, {
        currentPage: "1",
        pageSize: LINK_PAGE_SIZE,
      });

      const existingLinks = existingRes.responseData?.rows || [];
      if (existingLinks.length > 0) {
        await Promise.all(existingLinks.map((link) => userTagsService.deleteUserTag(link.id)));
      }

      if (userId) {
        await userTagsService.createUserTags([{ tag_id: groupId, user_id: userId }]);
      }

      setGroupOwnerByTagId((prev) => {
        const next = { ...prev };
        if (userId) {
          next[groupId] = userId;
        } else {
          delete next[groupId];
        }
        return next;
      });

      toast.success("Cập nhật phụ trách nhóm", "Đã cập nhật người phụ trách cho nhóm.");
    } catch (error) {
      toast.error("Cập nhật phụ trách thất bại", toErrorMessage(error, "Không thể cập nhật phụ trách nhóm."));
    } finally {
      setAssigningGroupId(null);
    }
  };

  useEffect(() => {
    void loadGroups();
  }, [loadGroups]);

  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) {
      return groups;
    }

    const query = searchQuery.toLowerCase();
    return groups.filter((group) => group.name.toLowerCase().includes(query));
  }, [groups, searchQuery]);

  const handleCreateGroup = async () => {
    const name = newGroupName.trim();
    if (!name) {
      toast.error("Tên nhóm không hợp lệ", "Vui lòng nhập tên nhóm khách hàng.");
      return;
    }

    setIsCreating(true);
    try {
      await tagsService.createTag({ name });
      setNewGroupName("");
      toast.success("Tạo nhóm thành công", `Đã tạo nhóm \"${name}\".`);
      await loadGroups();
    } catch (error) {
      toast.error("Tạo nhóm thất bại", toErrorMessage(error, "Không thể tạo nhóm khách hàng."));
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteGroup = async (group: GroupItem) => {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa nhóm \"${group.name}\"? Mọi liên kết khách hàng thuộc nhóm sẽ bị xóa.`,
    );

    if (!confirmed) {
      return;
    }

    setIsLoading(true);
    try {
      const linksRes = await customerTagsService.getCustomerTagsByTagId(group.id, {
        currentPage: "1",
        pageSize: LINK_PAGE_SIZE,
      });

      const links = linksRes.responseData?.rows || [];
      if (links.length > 0) {
        await Promise.all(links.map((link) => customerTagsService.deleteCustomerTag(link.id)));
      }

      await tagsService.deleteTag(group.id);
      toast.success("Xóa nhóm thành công", `Đã xóa nhóm \"${group.name}\".`);
      await loadGroups();
    } catch (error) {
      toast.error("Xóa nhóm thất bại", toErrorMessage(error, "Không thể xóa nhóm khách hàng."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý nhóm khách hàng</h1>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý danh sách nhóm và truy cập nhanh trang thành viên theo từng nhóm.
          </p>
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

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full table-fixed">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[44%]">
                  Tên nhóm
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  Số khách hàng
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[28%]">
                  Người phụ trách
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-44">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredGroups.map((group) => (
                <tr key={group.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div className="font-medium text-gray-900 truncate">{group.name}</div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">{group.customerCount}</td>
                  <td className="px-4 py-4">
                    <Select
                      value={groupOwnerByTagId[group.id] || ""}
                      onChange={(e) => void handleAssignGroupOwner(group.id, e.target.value)}
                      disabled={isLoading || assigningGroupId === group.id}
                      variant="subtle"
                      size="sm"
                      placeholder="Chưa gán"
                      options={userOptions.map((option) => ({
                        value: option.id,
                        label: option.label,
                      }))}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/customers/groups/${group.id}`)}
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Quản lý
                      </Button>

                      <Button
                        variant="danger"
                        size="sm"
                        className="px-3"
                        onClick={() => void handleDeleteGroup(group)}
                        disabled={isLoading}
                        title="Xóa nhóm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!isLoading && filteredGroups.length === 0 && (
            <div className="p-10 text-center text-sm text-gray-500">
              {groups.length === 0 ? "Chưa có nhóm khách hàng nào." : "Không tìm thấy nhóm phù hợp."}
            </div>
          )}
        </CardContent>
      </Card>

      {isLoading && (
        <p className="text-sm text-gray-500">Đang tải danh sách nhóm khách hàng...</p>
      )}
    </div>
  );
}
