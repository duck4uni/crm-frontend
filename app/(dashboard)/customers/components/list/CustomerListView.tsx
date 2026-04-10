"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Customer, CustomerStatus } from "@/types/customer";
import {
  CreateCustomerPayload,
  CustomerApiRow,
  CustomerTagApiRow,
  TagApiRow,
  UpdateCustomerPayload,
} from "@/types/api";
import { customerTagsService } from "@/services/customer-tags";
import { customersService } from "@/services/customers";
import { tagsService } from "@/services/tags";
import { usersService } from "@/services/users";
import { CustomerFilterOption, CustomerFilters } from "./CustomerFilters";
import { CustomerSearch } from "./CustomerSearch";
import { CustomerTable } from "./CustomerTable";
import { CustomerFormModal } from "../forms/CustomerFormModal";
import { CustomerDetailModal } from "../forms/CustomerDetailModal";
import { useToast } from "@/components/ui/ToastProvider";

interface ImportFeedback {
  success: number;
  failed: number;
  errors: string[];
}

interface CustomerListViewProps {
  onCountChange?: (count: number) => void;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const GROUP_FILTER_PAGE_SIZE = "5000";

const DEFAULT_ALL_GROUP_FILTER: CustomerFilterOption = {
  id: "all",
  label: "Tất cả",
  bgColor: "bg-blue-500",
  textColor: "text-white",
  activeBgColor: "bg-blue-600",
  activeTextColor: "text-white",
};

const GROUP_FILTER_STYLES: Omit<CustomerFilterOption, "id" | "label">[] = [
  {
    bgColor: "bg-emerald-500",
    textColor: "text-white",
    activeBgColor: "bg-emerald-600",
    activeTextColor: "text-white",
  },
  {
    bgColor: "bg-orange-500",
    textColor: "text-white",
    activeBgColor: "bg-orange-600",
    activeTextColor: "text-white",
  },
  {
    bgColor: "bg-cyan-500",
    textColor: "text-white",
    activeBgColor: "bg-cyan-600",
    activeTextColor: "text-white",
  },
  {
    bgColor: "bg-rose-500",
    textColor: "text-white",
    activeBgColor: "bg-rose-600",
    activeTextColor: "text-white",
  },
  {
    bgColor: "bg-indigo-500",
    textColor: "text-white",
    activeBgColor: "bg-indigo-600",
    activeTextColor: "text-white",
  },
  {
    bgColor: "bg-amber-500",
    textColor: "text-white",
    activeBgColor: "bg-amber-600",
    activeTextColor: "text-white",
  },
  {
    bgColor: "bg-teal-500",
    textColor: "text-white",
    activeBgColor: "bg-teal-600",
    activeTextColor: "text-white",
  },
  {
    bgColor: "bg-slate-500",
    textColor: "text-white",
    activeBgColor: "bg-slate-600",
    activeTextColor: "text-white",
  },
];

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function splitCustomerName(fullName: string): { firstName: string; lastName: string } {
  const normalized = normalizeWhitespace(fullName);

  if (!normalized) {
    return { firstName: "Khach", lastName: "Hang" };
  }

  const parts = normalized.split(" ");
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: parts[0] };
  }

  const firstName = parts.pop() || "Khach";
  const lastName = parts.join(" ") || firstName;

  return { firstName, lastName };
}

function mapApiGenderToCustomer(gender?: string | null): Customer["gender"] {
  const normalizedGender = (gender || "").toLowerCase();

  if (["male", "nam"].includes(normalizedGender)) {
    return "Male";
  }

  if (["female", "nu", "nữ"].includes(normalizedGender)) {
    return "Female";
  }

  return "Other";
}

function mapCustomerGenderToApi(gender?: Customer["gender"]): string | undefined {
  if (gender === "Male") {
    return "male";
  }

  if (gender === "Female") {
    return "female";
  }

  return undefined;
}

function mapStatusToIsActive(status?: CustomerStatus): boolean | undefined {
  if (!status) {
    return undefined;
  }

  return status !== CustomerStatus.NOT_CONTACTED;
}

function mapIsActiveToStatus(isActive?: boolean): CustomerStatus {
  return isActive === false ? CustomerStatus.NOT_CONTACTED : CustomerStatus.REGISTERED;
}

function detectCustomerType(data: Partial<Customer>): "individual" | "company" {
  const signal = `${data.customerSource || ""} ${data.source || ""}`.toLowerCase();
  if (signal.includes("company") || signal.includes("cong ty")) {
    return "company";
  }

  return "individual";
}

function mapApiRowToCustomer(row: CustomerApiRow, index: number): Customer {
  return mapApiRowToCustomerWithAssignee(row, index, {}, {});
}

function mapApiRowToCustomerWithAssignee(
  row: CustomerApiRow,
  index: number,
  assigneeNameMap: Record<string, string>,
  groupNamesByCustomerId: Record<string, string[]>,
): Customer {
  const customerName =
    row.full_name ||
    `${row.last_name || ""} ${row.first_name || ""}`.trim() ||
    row.email ||
    "Khach hang";

  return {
    id: row.id,
    orderNumber: index + 1,
    customerName,
    email: row.email || undefined,
    phone: row.phone || "",
    address: row.address || "",
    salutation: row.gender?.toLowerCase() === "female" ? "Chị" : "Anh",
    mobilePhone: row.phone || "",
    source: row.website || "",
    assignee: row.assigned_user_id
      ? assigneeNameMap[row.assigned_user_id] || row.assigned_user_id
      : "",
    relationship: row.note || "",
    lastContactDate: row.updated_at ? new Date(row.updated_at) : undefined,
    createdDate: row.created_at ? new Date(row.created_at) : new Date(),
    customerSource: row.type || "",
    gender: mapApiGenderToCustomer(row.gender),
    status: mapIsActiveToStatus(row.is_active),
    avatar: undefined,
    groups: groupNamesByCustomerId[row.id] || [],
  };
}

function mapTagRowsToFilters(tags: TagApiRow[]): CustomerFilterOption[] {
  const sortedTags = [...tags].sort((a, b) => a.name.localeCompare(b.name, "vi"));

  return [
    DEFAULT_ALL_GROUP_FILTER,
    ...sortedTags.map((tag, index) => {
      const style = GROUP_FILTER_STYLES[index % GROUP_FILTER_STYLES.length];
      return {
        id: tag.id,
        label: tag.name,
        ...style,
      };
    }),
  ];
}

function mapCustomerTagRows(rows: CustomerTagApiRow[]): Record<string, Set<string>> {
  return rows.reduce<Record<string, Set<string>>>((acc, row) => {
    if (!acc[row.tag_id]) {
      acc[row.tag_id] = new Set<string>();
    }

    acc[row.tag_id].add(row.customer_id);
    return acc;
  }, {});
}

function mapCustomerGroupNamesByCustomerId(
  rows: CustomerTagApiRow[],
  tagNameById: Record<string, string>,
): Record<string, string[]> {
  return rows.reduce<Record<string, string[]>>((acc, row) => {
    const groupName = tagNameById[row.tag_id];
    if (!groupName) {
      return acc;
    }

    if (!acc[row.customer_id]) {
      acc[row.customer_id] = [];
    }

    if (!acc[row.customer_id].includes(groupName)) {
      acc[row.customer_id].push(groupName);
    }

    return acc;
  }, {});
}

function mapFormToCreatePayload(data: Partial<Customer>): CreateCustomerPayload {
  const fullName = normalizeWhitespace(data.customerName || "");
  const { firstName, lastName } = splitCustomerName(fullName);

  return {
    first_name: firstName,
    last_name: lastName,
    description: normalizeWhitespace(data.relationship || "") || `Khach hang ${fullName || "moi"}`,
    type: detectCustomerType(data),
    full_name: fullName || undefined,
    email: normalizeWhitespace(data.email || "") || undefined,
    phone: (data.mobilePhone || data.phone || "").trim() || undefined,
    address: normalizeWhitespace(data.address || "") || undefined,
    website: normalizeWhitespace(data.source || "") || undefined,
    gender: mapCustomerGenderToApi(data.gender),
    note: normalizeWhitespace(data.relationship || "") || undefined,
    assigned_user_id:
      data.assignee && UUID_PATTERN.test(data.assignee.trim())
        ? data.assignee.trim()
        : undefined,
    is_active: mapStatusToIsActive(data.status),
  };
}

function mapFormToUpdatePayload(data: Partial<Customer>): UpdateCustomerPayload {
  const fullName = normalizeWhitespace(data.customerName || "");
  const { firstName, lastName } = splitCustomerName(fullName);

  return {
    first_name: firstName,
    last_name: lastName,
    description: normalizeWhitespace(data.relationship || "") || undefined,
    type: detectCustomerType(data),
    full_name: fullName || undefined,
    email: normalizeWhitespace(data.email || "") || undefined,
    phone: (data.mobilePhone || data.phone || "").trim() || undefined,
    address: normalizeWhitespace(data.address || "") || undefined,
    website: normalizeWhitespace(data.source || "") || undefined,
    gender: mapCustomerGenderToApi(data.gender),
    note: normalizeWhitespace(data.relationship || "") || undefined,
    assigned_user_id:
      data.assignee && UUID_PATTERN.test(data.assignee.trim())
        ? data.assignee.trim()
        : undefined,
    is_active: mapStatusToIsActive(data.status),
  };
}

async function syncCustomerGroups(customerId: string, nextGroupIds: string[]): Promise<void> {
  const normalizedNextGroupIds = Array.from(new Set(nextGroupIds.filter(Boolean)));
  const existingLinksResponse = await customerTagsService.getCustomerTagsByCustomerId(customerId, {
    currentPage: "1",
    pageSize: GROUP_FILTER_PAGE_SIZE,
  });

  const existingLinks = existingLinksResponse.responseData?.rows || [];
  const existingGroupIdSet = new Set(existingLinks.map((link) => link.tag_id));
  const nextGroupIdSet = new Set(normalizedNextGroupIds);

  const groupsToAdd = normalizedNextGroupIds.filter((groupId) => !existingGroupIdSet.has(groupId));
  const linksToDelete = existingLinks.filter((link) => !nextGroupIdSet.has(link.tag_id));

  if (groupsToAdd.length > 0) {
    await customerTagsService.createCustomerTags(
      groupsToAdd.map((groupId) => ({
        customer_id: customerId,
        tag_id: groupId,
      })),
    );
  }

  if (linksToDelete.length > 0) {
    await Promise.all(linksToDelete.map((link) => customerTagsService.deleteCustomerTag(link.id)));
  }
}

export function CustomerListView({ onCountChange }: CustomerListViewProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [groupFilters, setGroupFilters] = useState<CustomerFilterOption[]>([DEFAULT_ALL_GROUP_FILTER]);
  const [customerIdsByGroup, setCustomerIdsByGroup] = useState<Record<string, Set<string>>>({});
  const [groupNamesByCustomerId, setGroupNamesByCustomerId] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const assigneeNameCacheRef = useRef<Record<string, string>>({});

  const resolveAssigneeNameMap = useCallback(async (rows: CustomerApiRow[]) => {
    const assignedUserIds = Array.from(
      new Set(
        rows
          .map((row) => row.assigned_user_id)
          .filter(
            (id): id is string => typeof id === "string" && UUID_PATTERN.test(id),
          ),
      ),
    );

    const missingIds = assignedUserIds.filter(
      (id) => !assigneeNameCacheRef.current[id],
    );

    if (missingIds.length > 0) {
      const fetchedEntries = await Promise.all(
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

      assigneeNameCacheRef.current = {
        ...assigneeNameCacheRef.current,
        ...Object.fromEntries(fetchedEntries),
      };
    }

    return assigneeNameCacheRef.current;
  }, []);

  const loadCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const [customersResponse, tagsResponse, customerTagsResponse] = await Promise.all([
        customersService.getCustomers({
          currentPage: "1",
          pageSize: "200",
        }),
        tagsService.getTags({
          currentPage: "1",
          pageSize: GROUP_FILTER_PAGE_SIZE,
        }),
        customerTagsService.getCustomerTags({
          currentPage: "1",
          pageSize: GROUP_FILTER_PAGE_SIZE,
        }),
      ]);

      const data = customersResponse.responseData;
      const rows = data?.rows ?? [];
      const tagRows = tagsResponse.responseData?.rows || [];
      const customerTagRows = customerTagsResponse.responseData?.rows || [];
      const assigneeNameMap = await resolveAssigneeNameMap(rows);
      const tagNameById = tagRows.reduce<Record<string, string>>((acc, tag) => {
        acc[tag.id] = tag.name;
        return acc;
      }, {});
      const mappedGroupNamesByCustomerId = mapCustomerGroupNamesByCustomerId(
        customerTagRows,
        tagNameById,
      );
      const mappedCustomers = rows.map((row, idx) =>
        mapApiRowToCustomerWithAssignee(row, idx, assigneeNameMap, mappedGroupNamesByCustomerId),
      );
      const mappedGroupFilters = mapTagRowsToFilters(tagRows);
      const mappedCustomerIdsByGroup = mapCustomerTagRows(customerTagRows);

      setCustomers(mappedCustomers);
      setGroupFilters(mappedGroupFilters);
      setCustomerIdsByGroup(mappedCustomerIdsByGroup);
      setGroupNamesByCustomerId(mappedGroupNamesByCustomerId);
      setActiveFilter((prev) =>
        prev === "all" || mappedGroupFilters.some((filter) => filter.id === prev) ? prev : "all",
      );
      onCountChange?.(data?.count ?? rows.length);
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Không thể tải danh sách khách hàng.";
      toast.error("Tải dữ liệu thất bại", msg);
    } finally {
      setIsLoading(false);
    }
  }, [onCountChange, resolveAssigneeNameMap, toast]);

  useEffect(() => {
    void loadCustomers();
  }, [loadCustomers]);

  const filterCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: customers.length,
    };

    groupFilters.forEach((filter) => {
      if (filter.id === "all") {
        return;
      }

      const customerIds = customerIdsByGroup[filter.id];
      if (!customerIds) {
        counts[filter.id] = 0;
        return;
      }

      counts[filter.id] = customers.filter((customer) => customerIds.has(customer.id)).length;
    });

    return counts;
  }, [customerIdsByGroup, customers, groupFilters]);

  const filteredCustomers = useMemo(() => {
    let filtered = customers;

    if (activeFilter !== "all") {
      const customerIds = customerIdsByGroup[activeFilter];
      if (!customerIds) {
        return [];
      }

      filtered = filtered.filter((customer) => customerIds.has(customer.id));
    }

    if (!searchQuery.trim()) {
      return filtered;
    }

    const query = searchQuery.toLowerCase();
    return filtered.filter(
      (customer) =>
        customer.customerName.toLowerCase().includes(query) ||
        customer.phone.includes(query) ||
        customer.mobilePhone.includes(query) ||
        customer.id.toLowerCase().includes(query),
    );
  }, [activeFilter, customerIdsByGroup, customers, searchQuery]);

  const handleCustomerClick = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailModalOpen(true);

    try {
      const response = await customersService.getCustomer(customer.id);
      const detail = response.responseData;
      if (detail) {
        const assigneeNameMap = await resolveAssigneeNameMap([detail]);
        setSelectedCustomer(
          mapApiRowToCustomerWithAssignee(
            detail,
            Math.max(customer.orderNumber - 1, 0),
            assigneeNameMap,
            groupNamesByCustomerId,
          ),
        );
      }
    } catch {
      // Keep optimistic detail from table row if detail request fails.
    }
  };

  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setIsFormModalOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsDetailModalOpen(false);
    setIsFormModalOpen(true);
  };

  const handleSaveCustomer = async (customerData: Partial<Customer>, groupIds: string[]) => {
    try {
      let customerId: string | undefined;

      if (editingCustomer) {
        await customersService.updateCustomer(
          editingCustomer.id,
          mapFormToUpdatePayload(customerData),
        );
        customerId = editingCustomer.id;
        toast.success(
          "Cập nhật thành công",
          `Khách hàng "${customerData.customerName}" đã được cập nhật.`,
        );
      } else {
        const createResponse = await customersService.createCustomer(mapFormToCreatePayload(customerData));
        customerId = createResponse.responseData?.id;
        toast.success(
          "Thêm mới thành công",
          `Khách hàng "${customerData.customerName}" đã được thêm vào danh sách.`,
        );
      }

      if (customerId) {
        await syncCustomerGroups(customerId, groupIds);
      }

      await loadCustomers();
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Không thể lưu khách hàng.";
      toast.error("Lưu thất bại", msg);
      throw error;
    }
  };

  const handleDeleteCustomer = async (customer: Customer) => {
    try {
      await customersService.deleteCustomer(customer.id);
      setIsDetailModalOpen(false);
      await loadCustomers();
      toast.success(
        "Xóa thành công",
        `Khách hàng "${customer.customerName}" đã bị xóa.`,
      );
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Không thể xóa khách hàng.";
      toast.error("Xóa thất bại", msg);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await customersService.exportCustomers();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `khach-hang-${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Xuất file thành công", "Đã xuất danh sách khách hàng");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Không thể xuất file.";
      toast.error("Xuất file thất bại", msg);
    }
  };

  const handleImport = async (
    _data: any[],
    file?: File,
  ): Promise<ImportFeedback | undefined> => {
    if (!file) {
      return undefined;
    }

    try {
      const response = await customersService.importCustomers(file);
      const result = response.responseData;
      const successCount = result?.successCount ?? 0;
      const failedCount = (result?.skippedCount ?? 0) + (result?.errorCount ?? 0);
      const errors = (result?.errors || []).map(
        (item) => `Dòng ${item.row}: ${item.message}`,
      );

      toast.success(
        "Nhập dữ liệu thành công",
        `Thành công ${successCount}, lỗi/bỏ qua ${failedCount}`,
      );

      await loadCustomers();

      return {
        success: successCount,
        failed: failedCount,
        errors,
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Không thể nhập file.";
      toast.error("Nhập dữ liệu thất bại", msg);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 text-sm text-gray-600">
        Đang tải danh sách khách hàng...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CustomerFilters
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        counts={filterCounts}
        filters={groupFilters}
      />

      <CustomerSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddCustomer={handleAddCustomer}
        onExport={handleExport}
        onImport={handleImport}
      />

      <CustomerTable
        customers={filteredCustomers}
        onCustomerClick={(customer) => {
          void handleCustomerClick(customer);
        }}
        onCustomerEdit={handleEditCustomer}
      />

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Hiển thị {filteredCustomers.length} khách hàng
            {activeFilter !== "all" && " trong bộ lọc đã chọn"}
          </span>
        </div>
      </div>

      <CustomerFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveCustomer}
        customer={editingCustomer}
      />

      <CustomerDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        customer={selectedCustomer}
        onEdit={handleEditCustomer}
        onDelete={(customer) => {
          void handleDeleteCustomer(customer);
        }}
      />
    </div>
  );
}
