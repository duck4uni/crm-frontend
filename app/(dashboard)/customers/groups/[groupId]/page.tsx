"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/ToastProvider";
import { customerTagsService } from "@/services/customer-tags";
import { customersService } from "@/services/customers";
import { tagsService } from "@/services/tags";
import { usersService } from "@/services/users";
import { CustomerApiRow, CustomerTagApiRow } from "@/types/api";
import { ArrowLeft, Search, Trash2, UserPlus, Users } from "lucide-react";

interface CustomerLookupItem {
  id: string;
  customerName: string;
  phone?: string;
  assigneeId?: string;
  assigneeName: string;
}

interface GroupMemberItem extends CustomerLookupItem {
  customerTagId: string;
}

interface UserOption {
  id: string;
  label: string;
}

const CUSTOMER_PAGE_SIZE = "1000";
const LINK_PAGE_SIZE = "5000";
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function toErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function toCustomerName(row: CustomerApiRow): string {
  return (
    row.full_name || `${row.last_name || ""} ${row.first_name || ""}`.trim() || row.email || row.id
  );
}

export default function CustomerGroupDetailPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const router = useRouter();
  const toast = useToast();

  const [groupName, setGroupName] = useState("");
  const [allCustomers, setAllCustomers] = useState<CustomerLookupItem[]>([]);
  const [members, setMembers] = useState<GroupMemberItem[]>([]);

  const [searchAdd, setSearchAdd] = useState("");
  const [selectedToAdd, setSelectedToAdd] = useState<string[]>([]);
  const [selectedToRemove, setSelectedToRemove] = useState<string[]>([]);
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [assigningCustomerId, setAssigningCustomerId] = useState<string | null>(null);

  const assigneeCacheRef = useRef<Record<string, string>>({});

  const resolveAssigneeNameMap = useCallback(async (rows: CustomerApiRow[]) => {
    const assigneeIds = Array.from(
      new Set(
        rows
          .map((row) => row.assigned_user_id)
          .filter((id): id is string => typeof id === "string" && UUID_PATTERN.test(id)),
      ),
    );

    const missingIds = assigneeIds.filter((id) => !assigneeCacheRef.current[id]);

    if (missingIds.length > 0) {
      const fetched = await Promise.all(
        missingIds.map(async (id) => {
          try {
            const response = await usersService.getUser(id);
            const fullName = response.responseData?.full_name?.trim();
            return [id, fullName || id] as const;
          } catch {
            return [id, id] as const;
          }
        }),
      );

      assigneeCacheRef.current = {
        ...assigneeCacheRef.current,
        ...Object.fromEntries(fetched),
      };
    }

    return assigneeCacheRef.current;
  }, []);

  const mapCustomerRow = useCallback(
    (row: CustomerApiRow, assigneeMap: Record<string, string>): CustomerLookupItem => ({
      id: row.id,
      customerName: toCustomerName(row),
      phone: row.phone || undefined,
      assigneeId: row.assigned_user_id || undefined,
      assigneeName: row.assigned_user_id
        ? assigneeMap[row.assigned_user_id] || row.assigned_user_id
        : "-",
    }),
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
      const [groupRes, customersRes, links, usersRes] = await Promise.all([
        tagsService.getTag(groupId),
        customersService.getCustomers({ currentPage: "1", pageSize: CUSTOMER_PAGE_SIZE }),
        getCustomerTagsByGroup(),
        usersService.getUsers({ currentPage: "1", pageSize: "500" }),
      ]);

      const group = groupRes.responseData;
      if (!group?.id) {
        toast.error("Không tìm thấy nhóm", "Nhóm khách hàng không tồn tại.");
        router.push("/customers/groups");
        return;
      }

      setGroupName(group.name || "Nhóm khách hàng");

      const mappedUserOptions = (usersRes.responseData?.rows || [])
        .map((user) => ({
          id: user.id,
          label: user.full_name?.trim() || user.email || user.id,
        }))
        .sort((a, b) => a.label.localeCompare(b.label, "vi"));

      setUserOptions(mappedUserOptions);
      assigneeCacheRef.current = {
        ...Object.fromEntries(mappedUserOptions.map((user) => [user.id, user.label])),
        ...assigneeCacheRef.current,
      };

      const rows = customersRes.responseData?.rows || [];
      const assigneeMap = await resolveAssigneeNameMap(rows);
      const mappedAllCustomers = rows.map((row) => mapCustomerRow(row, assigneeMap));
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
          const missingAssigneeMap = await resolveAssigneeNameMap(validMissingRows);
          validMissingRows.forEach((row) => {
            allById.set(row.id, mapCustomerRow(row, missingAssigneeMap));
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
              assigneeId: undefined,
              assigneeName: "-",
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
    } catch (error) {
      toast.error("Không thể tải dữ liệu nhóm", toErrorMessage(error, "Đã có lỗi xảy ra."));
    } finally {
      setIsLoading(false);
    }
  }, [getCustomerTagsByGroup, groupId, mapCustomerRow, resolveAssigneeNameMap, router, toast]);

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

  const handleAssignCustomerOwner = async (customerId: string, userId: string) => {
    setAssigningCustomerId(customerId);
    try {
      await customersService.updateCustomer(customerId, {
        assigned_user_id: userId || undefined,
      });

      const assigneeName = userId ? userNameById[userId] || userId : "-";

      setMembers((prev) =>
        prev.map((member) =>
          member.id === customerId
            ? {
                ...member,
                assigneeId: userId || undefined,
                assigneeName,
              }
            : member,
        ),
      );

      setAllCustomers((prev) =>
        prev.map((customer) =>
          customer.id === customerId
            ? {
                ...customer,
                assigneeId: userId || undefined,
                assigneeName,
              }
            : customer,
        ),
      );

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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
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
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left w-10 sticky top-0 z-20 bg-gray-50" />
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 z-20 bg-gray-50">Tên khách hàng</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 z-20 bg-gray-50">Người phụ trách</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24 sticky top-0 z-20 bg-gray-50">Thao tác</th>
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
                      <div className="font-medium">{member.customerName}</div>
                      <div className="text-xs text-gray-500">{member.phone || "-"}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Select
                        value={member.assigneeId || ""}
                        onChange={(e) => void handleAssignCustomerOwner(member.id, e.target.value)}
                        disabled={isSaving || assigningCustomerId === member.id}
                        variant="subtle"
                        size="sm"
                        placeholder="Chưa gán"
                        options={userOptions.map((option) => ({
                          value: option.id,
                          label: option.label,
                        }))}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => void handleRemoveSingleCustomer(member.customerTagId)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Xóa khách khỏi nhóm"
                        disabled={isSaving}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!isLoading && members.length === 0 && (
              <div className="p-8 text-center text-sm text-gray-500">Nhóm này hiện chưa có khách hàng.</div>
            )}
          </div>
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
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left w-10 sticky top-0 z-20 bg-gray-50" />
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 z-20 bg-gray-50">Tên khách hàng</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 z-20 bg-gray-50">Người phụ trách</th>
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
                      <div className="font-medium">{customer.customerName}</div>
                      <div className="text-xs text-gray-500">{customer.phone || "-"}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{customer.assigneeName}</td>
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
