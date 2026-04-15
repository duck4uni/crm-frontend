"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/ToastProvider";
import { customerAssignedUsersService } from "@/services/customer-assigned-users";
import { customerTagsService } from "@/services/customer-tags";
import { customersService } from "@/services/customers";
import { tagsService } from "@/services/tags";
import { usersService } from "@/services/users";
import { formatPermissionName } from "@/lib/utils";
import { AdminUserApiRow, CustomerApiRow, CustomerAssignedUserApiRow, CustomerTagApiRow } from "@/types/api";
import { ArrowLeft, Search, Trash2, UserPlus, Users } from "lucide-react";

interface CustomerLookupItem {
  id: string;
  customerName: string;
  phone?: string;
  assigneeIds: string[];
  leaderAssigneeName: string;
  workerAssigneeName: string;
}

interface GroupMemberItem extends CustomerLookupItem {
  customerTagId: string;
}

interface UserOption {
  id: string;
  label: string;
  role: "SITE LEADER" | "SITE WORKER";
}

const CUSTOMER_PAGE_SIZE = "1000";
const LINK_PAGE_SIZE = "5000";
const LEADER_ROLE_NAME = "SITE LEADER";
const WORKER_ROLE_NAME = "SITE WORKER";
type AssigneeRole = "leader" | "worker";

function toErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function toCustomerName(row: CustomerApiRow): string {
  return (
    row.full_name || `${row.last_name || ""} ${row.first_name || ""}`.trim() || row.email || row.id
  );
}

function mapAssignedUsersByCustomerId(
  rows: CustomerAssignedUserApiRow[],
): Record<string, Array<{ id: string; full_name: string }>> {
  return rows.reduce<Record<string, Array<{ id: string; full_name: string }>>>((acc, row) => {
    const customerId = typeof row.customer_id === "string" ? row.customer_id.trim() : "";
    const assignedUserId = typeof row.assigned_user_id === "string" ? row.assigned_user_id.trim() : "";
    if (!customerId || !assignedUserId) {
      return acc;
    }

    if (!acc[customerId]) {
      acc[customerId] = [];
    }

    if (!acc[customerId].some((item) => item.id === assignedUserId)) {
      acc[customerId].push({
        id: assignedUserId,
        full_name: row.assigned_user?.full_name?.trim() || assignedUserId,
      });
    }

    return acc;
  }, {});
}

function resolveAssignedUsersForCustomer(
  row: CustomerApiRow,
  assignedUsersByCustomerId: Record<string, Array<{ id: string; full_name: string }>>,
): Array<{ id: string; full_name: string }> {
  const fromAssignmentApi = assignedUsersByCustomerId[row.id] || [];
  if (fromAssignmentApi.length > 0) {
    return fromAssignmentApi;
  }

  const seen = new Set<string>();
  return (row.assigned_users || []).reduce<Array<{ id: string; full_name: string }>>((acc, user) => {
    const id = typeof user?.id === "string" ? user.id.trim() : "";
    if (!id || seen.has(id)) {
      return acc;
    }

    seen.add(id);
    acc.push({
      id,
      full_name: typeof user.full_name === "string" ? user.full_name.trim() || id : id,
    });
    return acc;
  }, []);
}

function buildAssigneeRolesByUserId(users: AdminUserApiRow[]): Record<string, Set<AssigneeRole>> {
  return users.reduce<Record<string, Set<AssigneeRole>>>((acc, user) => {
    const permissionNames = (user.user_permisions || [])
      .map((item) => item.permision?.name || "")
      .map((name) => name.trim());

    const roleSet = new Set<AssigneeRole>();
    if (permissionNames.includes(LEADER_ROLE_NAME)) {
      roleSet.add("leader");
    }

    if (permissionNames.includes(WORKER_ROLE_NAME)) {
      roleSet.add("worker");
    }

    if (roleSet.size > 0) {
      acc[user.id] = roleSet;
    }

    return acc;
  }, {});
}

function toAssigneeDisplayNameByRole(
  assignedUsers: Array<{ id: string; full_name: string }>,
  assigneeRolesByUserId: Record<string, Set<AssigneeRole>>,
  role: AssigneeRole,
): string {
  const names = assignedUsers
    .filter((user) => assigneeRolesByUserId[user.id]?.has(role))
    .map((user) => user.full_name || user.id)
    .filter(Boolean);

  return names.length > 0 ? names.join("\n") : "-";
}

function splitAssigneeLines(value?: string): string[] {
  if (!value || value === "-") {
    return ["-"];
  }

  const lines = value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  return lines.length > 0 ? lines : ["-"];
}

export default function CustomerGroupDetailPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const router = useRouter();
  const toast = useToast();

  const assigneeEditorRef = useRef<HTMLDivElement | null>(null);
  const assigneeSearchInputRef = useRef<HTMLInputElement | null>(null);

  const [groupName, setGroupName] = useState("");
  const [allCustomers, setAllCustomers] = useState<CustomerLookupItem[]>([]);
  const [members, setMembers] = useState<GroupMemberItem[]>([]);

  const [searchAdd, setSearchAdd] = useState("");
  const [selectedToAdd, setSelectedToAdd] = useState<string[]>([]);
  const [selectedToRemove, setSelectedToRemove] = useState<string[]>([]);
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [editingAssigneeCustomerId, setEditingAssigneeCustomerId] = useState<string | null>(null);
  const [assigneeSearchKeyword, setAssigneeSearchKeyword] = useState("");
  const [assigneeDraftIds, setAssigneeDraftIds] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [assigningCustomerId, setAssigningCustomerId] = useState<string | null>(null);

  const mapCustomerRow = useCallback(
    (
      row: CustomerApiRow,
      assignedUsersByCustomerId: Record<string, Array<{ id: string; full_name: string }>>,
      assigneeRolesByUserId: Record<string, Set<AssigneeRole>>,
    ): CustomerLookupItem => {
      const assignedUsers = resolveAssignedUsersForCustomer(row, assignedUsersByCustomerId);

      return {
        id: row.id,
        customerName: toCustomerName(row),
        phone: row.phone || undefined,
        assigneeIds: assignedUsers.map((user) => user.id),
        leaderAssigneeName: toAssigneeDisplayNameByRole(assignedUsers, assigneeRolesByUserId, "leader"),
        workerAssigneeName: toAssigneeDisplayNameByRole(assignedUsers, assigneeRolesByUserId, "worker"),
      };
    },
    [],
  );

  const getCustomerTagsByGroup = useCallback(async (): Promise<CustomerTagApiRow[]> => {
    const response = await customerTagsService.getCustomerTagsByTagId(groupId, {
      currentPage: "1",
      pageSize: LINK_PAGE_SIZE,
    });

    return response.responseData?.rows || [];
  }, [groupId]);

  const loadData = useCallback(async () => {
    if (!groupId) {
      return;
    }

    setIsLoading(true);
    try {
      const [groupRes, customersRes, links, usersRes, customerAssignedUsersRes] = await Promise.all([
        tagsService.getTag(groupId),
        customersService.getCustomers({ currentPage: "1", pageSize: CUSTOMER_PAGE_SIZE }),
        getCustomerTagsByGroup(),
        usersService.getAdminUsers({ currentPage: "1", pageSize: "500" }),
        customerAssignedUsersService.getCustomerAssignedUsers({
          currentPage: "1",
          pageSize: LINK_PAGE_SIZE,
        }),
      ]);

      const group = groupRes.responseData;
      if (!group?.id) {
        toast.error("Không tìm thấy nhóm", "Nhóm khách hàng không tồn tại.");
        router.push("/customers/groups");
        return;
      }

      setGroupName(group.name || "Nhóm khách hàng");

      const adminUsers = usersRes.responseData?.rows || [];
      const assigneeRolesByUserId = buildAssigneeRolesByUserId(adminUsers);

      const mappedUserOptions = adminUsers
        .map((user) => {
          const permissionNames = (user.user_permisions || [])
            .map((item) => item.permision?.name || "")
            .map((name) => name.trim());

          const isLeader = permissionNames.includes(LEADER_ROLE_NAME);
          const isWorker = permissionNames.includes(WORKER_ROLE_NAME);

          if (!isLeader && !isWorker) {
            return null;
          }

          return {
            id: user.id,
            label: user.full_name?.trim() || user.email || user.id,
            role: isLeader ? LEADER_ROLE_NAME : WORKER_ROLE_NAME,
          };
        })
        .filter((user): user is UserOption => Boolean(user))
        .sort((a, b) => a.label.localeCompare(b.label, "vi"));

      setUserOptions(mappedUserOptions);

      const rows = customersRes.responseData?.rows || [];
      const assignedUsersByCustomerId = mapAssignedUsersByCustomerId(
        customerAssignedUsersRes.responseData?.rows || [],
      );
      const mappedAllCustomers = rows.map((row) =>
        mapCustomerRow(row, assignedUsersByCustomerId, assigneeRolesByUserId),
      );
      setAllCustomers(mappedAllCustomers);

      const allById = new Map(mappedAllCustomers.map((item) => [item.id, item]));
      const missingIds = links
        .map((link) => link.customer_id)
        .filter((customerId) => !allById.has(customerId));

      if (missingIds.length > 0) {
        const missingRows = await Promise.all(
          missingIds.map(async (customerId) => {
            try {
              const response = await customersService.getCustomer(customerId);
              return response.responseData || null;
            } catch {
              return null;
            }
          }),
        );

        const validMissingRows = missingRows.filter((row): row is CustomerApiRow => Boolean(row));
        if (validMissingRows.length > 0) {
          validMissingRows.forEach((row) => {
            allById.set(row.id, mapCustomerRow(row, assignedUsersByCustomerId, assigneeRolesByUserId));
          });
        }
      }

      const mappedMembers: GroupMemberItem[] = links
        .map((link) => {
          const customer = allById.get(link.customer_id);
          if (!customer) {
            return {
              customerTagId: link.id,
              id: link.customer_id,
              customerName: "Khách hàng",
              phone: undefined,
              assigneeIds: [],
              leaderAssigneeName: "-",
              workerAssigneeName: "-",
            };
          }

          return {
            customerTagId: link.id,
            ...customer,
          };
        })
        .sort((a, b) => a.customerName.localeCompare(b.customerName, "vi"));

      setMembers(mappedMembers);
      setSelectedToAdd([]);
      setSelectedToRemove([]);
      setEditingAssigneeCustomerId(null);
      setAssigneeSearchKeyword("");
      setAssigneeDraftIds([]);
    } catch (error) {
      toast.error("Không thể tải dữ liệu nhóm", toErrorMessage(error, "Đã có lỗi xảy ra."));
    } finally {
      setIsLoading(false);
    }
  }, [getCustomerTagsByGroup, groupId, mapCustomerRow, router, toast]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const memberIdSet = useMemo(() => new Set(members.map((member) => member.id)), [members]);

  const addableCustomers = useMemo(() => {
    const source = allCustomers.filter((customer) => !memberIdSet.has(customer.id));
    if (!searchAdd.trim()) {
      return source;
    }

    const query = searchAdd.toLowerCase();
    return source.filter(
      (customer) =>
        customer.customerName.toLowerCase().includes(query) ||
        (customer.phone || "").includes(query) ||
        customer.id.toLowerCase().includes(query),
    );
  }, [allCustomers, memberIdSet, searchAdd]);

  const selectedAddSet = useMemo(() => new Set(selectedToAdd), [selectedToAdd]);
  const selectedRemoveSet = useMemo(() => new Set(selectedToRemove), [selectedToRemove]);
  const userNameById = useMemo(
    () => Object.fromEntries(userOptions.map((option) => [option.id, option.label])),
    [userOptions],
  );
  const userRolesById = useMemo(
    () => Object.fromEntries(userOptions.map((option) => [option.id, option.role])),
    [userOptions],
  );
  const editingAssigneeCustomer = useMemo(
    () => members.find((member) => member.id === editingAssigneeCustomerId) || null,
    [editingAssigneeCustomerId, members],
  );

  const findScrollableParent = useCallback((node: HTMLElement | null): HTMLElement | null => {
    if (!node) return null;
    let parent: HTMLElement | null = node.parentElement;
    while (parent) {
      try {
        const style = getComputedStyle(parent);
        const overflowY = style.overflowY;
        if ((overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") && parent.scrollHeight > parent.clientHeight) {
          return parent;
        }
      } catch {
        // ignore cross-origin or other errors
      }
      parent = parent.parentElement;
    }

    return document.scrollingElement as HTMLElement | null;
  }, []);

  const scrollToEditor = useCallback((node: HTMLElement) => {
    const scrollParent = findScrollableParent(node) || (document.scrollingElement as HTMLElement | null);
    if (!scrollParent || scrollParent === document.scrollingElement || scrollParent === document.body || scrollParent === document.documentElement) {
      node.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => assigneeSearchInputRef.current?.focus(), 120);
      return;
    }

    const nodeRect = node.getBoundingClientRect();
    const parentRect = (scrollParent as HTMLElement).getBoundingClientRect();
    const offsetTop = nodeRect.top - parentRect.top + (scrollParent as HTMLElement).scrollTop;
    (scrollParent as HTMLElement).scrollTo({ top: Math.max(0, offsetTop - 8), behavior: "smooth" });
    setTimeout(() => assigneeSearchInputRef.current?.focus(), 200);
  }, [findScrollableParent]);

  useEffect(() => {
    if (!editingAssigneeCustomer) return;

    let raf1 = 0;
    let raf2 = 0;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        const el = assigneeEditorRef.current;
        if (el) {
          scrollToEditor(el);
        }
      });
    });

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [editingAssigneeCustomer, scrollToEditor]);

  const filteredAssigneeOptions = useMemo(() => {
    const keyword = assigneeSearchKeyword.trim().toLowerCase();
    if (!keyword) {
      return userOptions;
    }

    return userOptions.filter((option) => option.label.toLowerCase().includes(keyword));
  }, [assigneeSearchKeyword, userOptions]);

  const filteredLeaderOptions = useMemo(
    () => filteredAssigneeOptions.filter((option) => option.role === LEADER_ROLE_NAME),
    [filteredAssigneeOptions],
  );

  const filteredWorkerOptions = useMemo(
    () => filteredAssigneeOptions.filter((option) => option.role === WORKER_ROLE_NAME),
    [filteredAssigneeOptions],
  );

  const allFilteredAssigneesSelected =
    filteredAssigneeOptions.length > 0 &&
    filteredAssigneeOptions.every((option) => assigneeDraftIds.includes(option.id));
  const isAllMembersSelected =
    members.length > 0 && members.every((member) => selectedRemoveSet.has(member.customerTagId));

  const toggleAddSelection = (customerId: string) => {
    setSelectedToAdd((prev) =>
      prev.includes(customerId) ? prev.filter((id) => id !== customerId) : [...prev, customerId],
    );
  };

  const toggleRemoveSelection = (customerTagId: string) => {
    setSelectedToRemove((prev) =>
      prev.includes(customerTagId)
        ? prev.filter((id) => id !== customerTagId)
        : [...prev, customerTagId],
    );
  };

  const toggleSelectAllMembers = () => {
    if (isAllMembersSelected) {
      setSelectedToRemove([]);
      return;
    }

    setSelectedToRemove(members.map((member) => member.customerTagId));
  };

  const openAssigneeEditor = (member: GroupMemberItem) => {
    setEditingAssigneeCustomerId(member.id);
    setAssigneeSearchKeyword("");
    setAssigneeDraftIds(member.assigneeIds);
  };

  const toggleAssigneeSelection = (userId: string) => {
    setAssigneeDraftIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  };

  const toggleSelectAllFilteredAssignees = () => {
    setAssigneeDraftIds((prev) => {
      const next = new Set(prev);

      if (allFilteredAssigneesSelected) {
        filteredAssigneeOptions.forEach((option) => next.delete(option.id));
      } else {
        filteredAssigneeOptions.forEach((option) => next.add(option.id));
      }

      return Array.from(next);
    });
  };

  const handleAddSelectedCustomers = async () => {
    if (selectedToAdd.length === 0) {
      toast.error("Chưa chọn khách hàng", "Vui lòng chọn ít nhất một khách hàng để thêm vào nhóm.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = selectedToAdd.map((customerId) => ({
        customer_id: customerId,
        tag_id: groupId,
      }));

      await customerTagsService.createCustomerTags(payload);
      toast.success("Thêm khách hàng thành công", `Đã thêm ${payload.length} khách hàng vào nhóm.`);
      await loadData();
    } catch (error) {
      toast.error("Thêm khách hàng thất bại", toErrorMessage(error, "Không thể thêm khách hàng vào nhóm."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveSelectedCustomers = async () => {
    if (selectedToRemove.length === 0) {
      toast.error("Chưa chọn khách hàng", "Vui lòng chọn ít nhất một khách hàng để xóa khỏi nhóm.");
      return;
    }

    setIsSaving(true);
    try {
      await Promise.all(selectedToRemove.map((customerTagId) => customerTagsService.deleteCustomerTag(customerTagId)));
      toast.success("Xóa khách hàng thành công", `Đã xóa ${selectedToRemove.length} khách hàng khỏi nhóm.`);
      await loadData();
    } catch (error) {
      toast.error("Xóa khách hàng thất bại", toErrorMessage(error, "Không thể xóa khách hàng khỏi nhóm."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveSingleCustomer = async (customerTagId: string) => {
    setIsSaving(true);
    try {
      await customerTagsService.deleteCustomerTag(customerTagId);
      toast.success("Xóa khách hàng thành công", "Đã xóa khách hàng khỏi nhóm.");
      await loadData();
    } catch (error) {
      toast.error("Xóa khách hàng thất bại", toErrorMessage(error, "Không thể xóa khách hàng khỏi nhóm."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleAssignCustomerOwner = async () => {
    if (!editingAssigneeCustomer) {
      return;
    }

    const customerId = editingAssigneeCustomer.id;
    setAssigningCustomerId(customerId);
    try {
      await customerAssignedUsersService.syncCustomerAssignedUsers(customerId, assigneeDraftIds);

      const leaderAssigneeName =
        assigneeDraftIds
          .filter((id) => userRolesById[id] === LEADER_ROLE_NAME)
          .map((id) => userNameById[id] || id)
          .filter(Boolean)
          .join("\n") || "-";

      const workerAssigneeName =
        assigneeDraftIds
          .filter((id) => userRolesById[id] === WORKER_ROLE_NAME)
          .map((id) => userNameById[id] || id)
          .filter(Boolean)
          .join("\n") || "-";

      setMembers((prev) =>
        prev.map((member) =>
          member.id === customerId
            ? {
                ...member,
                assigneeIds: assigneeDraftIds,
                leaderAssigneeName,
                workerAssigneeName,
              }
            : member,
        ),
      );

      setAllCustomers((prev) =>
        prev.map((customer) =>
          customer.id === customerId
            ? {
                ...customer,
                assigneeIds: assigneeDraftIds,
                leaderAssigneeName,
                workerAssigneeName,
              }
            : customer,
        ),
      );

      setEditingAssigneeCustomerId(null);
      setAssigneeSearchKeyword("");
      setAssigneeDraftIds([]);

      toast.success("Cập nhật phụ trách", "Đã cập nhật người phụ trách cho khách hàng.");
    } catch (error) {
      toast.error("Cập nhật phụ trách thất bại", toErrorMessage(error, "Không thể cập nhật người phụ trách."));
    } finally {
      setAssigningCustomerId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nhóm: {groupName || "..."}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý khách hàng thuộc nhóm và thêm/xóa thành viên theo lô.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" onClick={() => router.push("/customers/groups")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Danh sách nhóm
          </Button>
          <Button variant="outline" onClick={() => router.push("/customers")}>
            <Users className="w-4 h-4 mr-2" />
            Danh sách khách hàng
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_1fr] gap-6">
        <Card className="overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between gap-2 flex-wrap bg-gray-50">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Khách hàng trong nhóm ({members.length})</h2>
              <p className="text-xs text-gray-500 mt-0.5">Danh sách thành viên hiện có của nhóm.</p>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={toggleSelectAllMembers} disabled={members.length === 0}>
                {isAllMembersSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => void handleRemoveSelectedCustomers()}
                disabled={isSaving || selectedToRemove.length === 0}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Xóa đã chọn ({selectedToRemove.length})
              </Button>
            </div>
          </div>

          <div className="max-h-[560px] overflow-y-auto">
            <table className="w-full table-fixed">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left w-12 sticky top-0 z-20 bg-gray-50" />
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap w-[26%] sticky top-0 z-20 bg-gray-50">Tên khách hàng</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap w-[26%] sticky top-0 z-20 bg-gray-50">Leader</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap w-[24%] sticky top-0 z-20 bg-gray-50">Worker</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap w-[24%] sticky top-0 z-20 bg-gray-50">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {members.map((member) => (
                  <tr
                    key={member.customerTagId}
                    className={selectedRemoveSet.has(member.customerTagId) ? "bg-red-50" : "hover:bg-gray-50"}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRemoveSet.has(member.customerTagId)}
                        onChange={() => toggleRemoveSelection(member.customerTagId)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="font-medium truncate" title={member.customerName}>{member.customerName}</div>
                      <div className="text-xs text-gray-500 truncate" title={member.phone || "-"}>{member.phone || "-"}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 align-top">
                      <div className="space-y-1">
                        {splitAssigneeLines(member.leaderAssigneeName || "-").map((line, index) => (
                          <p key={`${member.id}-leader-${index}`} className="whitespace-nowrap">
                            {line}
                          </p>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 align-top">
                      <div className="space-y-1">
                        {splitAssigneeLines(member.workerAssigneeName || "-").map((line, index) => (
                          <p key={`${member.id}-worker-${index}`} className="whitespace-nowrap">
                            {line}
                          </p>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="p-2"
                          onClick={() => openAssigneeEditor(member)}
                          disabled={isSaving || assigningCustomerId === member.id}
                          title="Phân người phụ trách"
                        >
                          <Users className="w-4 h-4" />
                        </Button>
                        <button
                          onClick={() => void handleRemoveSingleCustomer(member.customerTagId)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Xóa khách khỏi nhóm"
                          disabled={isSaving}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!isLoading && members.length === 0 && (
              <div className="p-8 text-center text-sm text-gray-500">Nhóm này hiện chưa có khách hàng.</div>
            )}
          </div>

          {editingAssigneeCustomer && (
            <div ref={assigneeEditorRef} className="border-t border-gray-200 p-4 space-y-3 bg-white">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Phân người phụ trách: {editingAssigneeCustomer.customerName}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Đã chọn {assigneeDraftIds.length} người</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingAssigneeCustomerId(null);
                      setAssigneeSearchKeyword("");
                      setAssigneeDraftIds([]);
                    }}
                    disabled={assigningCustomerId === editingAssigneeCustomer.id}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => void handleAssignCustomerOwner()}
                    disabled={assigningCustomerId === editingAssigneeCustomer.id}
                  >
                    Lưu phụ trách
                  </Button>
                </div>
              </div>

              <Input
                ref={assigneeSearchInputRef}
                value={assigneeSearchKeyword}
                onChange={(event) => setAssigneeSearchKeyword(event.target.value)}
                placeholder="Tìm theo tên user"
                disabled={assigningCustomerId === editingAssigneeCustomer.id}
              />

              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="text-xs text-gray-500">
                  Hiển thị {filteredAssigneeOptions.length}/{userOptions.length} user
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="h-8 px-3 text-xs"
                  onClick={toggleSelectAllFilteredAssignees}
                  disabled={filteredAssigneeOptions.length === 0 || assigningCustomerId === editingAssigneeCustomer.id}
                >
                  {allFilteredAssigneesSelected ? "Bỏ chọn user đang lọc" : "Chọn user đang lọc"}
                </Button>
              </div>

              <div className="space-y-3">
                <AssigneeRoleSection
                  title={formatPermissionName(LEADER_ROLE_NAME)}
                  users={filteredLeaderOptions}
                  selectedIds={assigneeDraftIds}
                  onToggle={toggleAssigneeSelection}
                  disabled={assigningCustomerId === editingAssigneeCustomer.id}
                />
                <AssigneeRoleSection
                  title={formatPermissionName(WORKER_ROLE_NAME)}
                  users={filteredWorkerOptions}
                  selectedIds={assigneeDraftIds}
                  onToggle={toggleAssigneeSelection}
                  disabled={assigningCustomerId === editingAssigneeCustomer.id}
                />
              </div>
            </div>
          )}
        </Card>

        <Card className="overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 space-y-3 bg-gray-50">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Thêm khách hàng vào nhóm</h2>
              <p className="text-xs text-gray-500 mt-0.5">Chọn nhiều khách để thêm cùng lúc.</p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative flex-1 min-w-[260px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Tìm khách hàng để thêm vào nhóm"
                  value={searchAdd}
                  onChange={(e) => setSearchAdd(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => void handleAddSelectedCustomers()}
                disabled={isSaving || selectedToAdd.length === 0}
                className="whitespace-nowrap"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Thêm ({selectedToAdd.length})
              </Button>
            </div>
          </div>

          <div className="max-h-[560px] overflow-y-auto">
            <table className="w-full table-fixed">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left w-12 sticky top-0 z-20 bg-gray-50" />
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap w-[40%] sticky top-0 z-20 bg-gray-50">Tên khách hàng</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap w-[30%] sticky top-0 z-20 bg-gray-50">Leader</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap w-[30%] sticky top-0 z-20 bg-gray-50">Worker</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {addableCustomers.map((customer) => (
                  <tr key={customer.id} className={selectedAddSet.has(customer.id) ? "bg-green-50" : "hover:bg-gray-50"}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedAddSet.has(customer.id)}
                        onChange={() => toggleAddSelection(customer.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="font-medium truncate" title={customer.customerName}>{customer.customerName}</div>
                      <div className="text-xs text-gray-500 truncate" title={customer.phone || "-"}>{customer.phone || "-"}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 align-top">
                      <div className="space-y-1">
                        {splitAssigneeLines(customer.leaderAssigneeName || "-").map((line, index) => (
                          <p key={`${customer.id}-leader-${index}`} className="whitespace-nowrap">
                            {line}
                          </p>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 align-top">
                      <div className="space-y-1">
                        {splitAssigneeLines(customer.workerAssigneeName || "-").map((line, index) => (
                          <p key={`${customer.id}-worker-${index}`} className="whitespace-nowrap">
                            {line}
                          </p>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!isLoading && addableCustomers.length === 0 && (
              <div className="p-8 text-center text-sm text-gray-500">
                Không còn khách hàng phù hợp để thêm vào nhóm.
              </div>
            )}
          </div>
        </Card>
      </div>

      {isLoading && (
        <div className="text-sm text-gray-500">Đang tải dữ liệu nhóm khách hàng...</div>
      )}
    </div>
  );
}

function AssigneeRoleSection({
  title,
  users,
  selectedIds,
  onToggle,
  disabled,
}: {
  title: string;
  users: UserOption[];
  selectedIds: string[];
  onToggle: (userId: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="border border-gray-200 rounded-md overflow-hidden">
      <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-700 uppercase tracking-wider">
        {title} ({users.length})
      </div>

      {users.length === 0 ? (
        <p className="px-3 py-3 text-sm text-gray-500">Không có user phù hợp.</p>
      ) : (
        <div className="max-h-44 overflow-y-auto">
          <table className="w-full">
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => {
                const isChecked = selectedIds.includes(user.id);

                return (
                  <tr key={user.id} className={isChecked ? "bg-primary-50" : "hover:bg-gray-50"}>
                    <td className="px-3 py-2 w-10">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onToggle(user.id)}
                        disabled={disabled}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-900">{user.label}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
