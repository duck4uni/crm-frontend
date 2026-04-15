"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Customer, CustomerStatus } from "@/types/customer";
import {
  AdminUserApiRow,
  CustomerApiRow,
  CustomerAssignedUserApiRow,
  CustomerTagApiRow,
  TagApiRow,
} from "@/types/api";
import { customerAssignedUsersService } from "@/services/customer-assigned-users";
import { customerTagsService } from "@/services/customer-tags";
import { customersService } from "@/services/customers";
import { tagsService } from "@/services/tags";
import { usersService } from "@/services/users";
import { CustomerFilterOption, CustomerFilters } from "./CustomerFilters";
import { CustomerSearch } from "./CustomerSearch";
import { CustomerTable } from "./CustomerTable";
import { ListPageLayout } from "@/components/ui/ListPageLayout";
import { useToast } from "@/components/ui/ToastProvider";

const LEADER_PERMISSION_NAME = "SITE LEADER";
const WORKER_PERMISSION_NAME = "SITE WORKER";

function buildAllowedAssigneeIdSet(users: AdminUserApiRow[]): Set<string> {
  return users.reduce<Set<string>>((acc, user) => {
    const permissionNames = (user.user_permisions || [])
      .map((item) => item.permision?.name || "")
      .map((name) => name.trim())
      .filter(Boolean);

    if (
      permissionNames.includes(LEADER_PERMISSION_NAME) ||
      permissionNames.includes(WORKER_PERMISSION_NAME)
    ) {
      acc.add(user.id);
    }

    return acc;
  }, new Set<string>());
}

interface ImportFeedback {
  success: number;
  failed: number;
  errors: string[];
}

interface CustomerListViewProps {
  onCountChange?: (count: number) => void;
}

const GROUP_FILTER_PAGE_SIZE = "5000";

const DEFAULT_ALL_GROUP_FILTER: CustomerFilterOption = {
  id: "all",
  label: "Tất cả",
  bgColor: "bg-primary-500",
  textColor: "text-white",
  activeBgColor: "bg-primary-600",
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

function mapIsActiveToStatus(isActive?: boolean): CustomerStatus {
  return isActive === false ? CustomerStatus.NOT_CONTACTED : CustomerStatus.REGISTERED;
}

function toAssignedUsersFromCustomer(
  row: CustomerApiRow,
  allowedAssigneeIds?: Set<string> | null,
): Array<{ id: string; full_name: string }> {
  const seen = new Set<string>();

  return (row.assigned_users || []).reduce<Array<{ id: string; full_name: string }>>((acc, user) => {
    const id = typeof user?.id === "string" ? user.id.trim() : "";
    if (!id || seen.has(id)) {
      return acc;
    }

    if (allowedAssigneeIds && !allowedAssigneeIds.has(id)) {
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

function mapAssignedUsersByCustomerId(
  rows: CustomerAssignedUserApiRow[],
  allowedAssigneeIds?: Set<string> | null,
): Record<string, Array<{ id: string; full_name: string }>> {
  return rows.reduce<Record<string, Array<{ id: string; full_name: string }>>>((acc, row) => {
    const customerId = typeof row.customer_id === "string" ? row.customer_id.trim() : "";
    const assignedUserId = typeof row.assigned_user_id === "string" ? row.assigned_user_id.trim() : "";
    if (!customerId || !assignedUserId) {
      return acc;
    }

    if (allowedAssigneeIds && !allowedAssigneeIds.has(assignedUserId)) {
      return acc;
    }

    if (!acc[customerId]) {
      acc[customerId] = [];
    }

    if (!acc[customerId].some((user) => user.id === assignedUserId)) {
      acc[customerId].push({
        id: assignedUserId,
        full_name: row.assigned_user?.full_name?.trim() || assignedUserId,
      });
    }

    return acc;
  }, {});
}

function formatAssigneeLabel(assignedUsers: Array<{ id: string; full_name: string }>): string {
  if (assignedUsers.length === 0) {
    return "";
  }

  return assignedUsers
    .map((user) => user.full_name?.trim() || user.id)
    .filter(Boolean)
    .join(", ");
}

function mapApiRowToCustomerWithAssignee(
  row: CustomerApiRow,
  index: number,
  assignedUsersByCustomerId: Record<string, Array<{ id: string; full_name: string }>>,
  groupNamesByCustomerId: Record<string, string[]>,
  allowedAssigneeIds?: Set<string> | null,
): Customer {
  const customerName =
    row.full_name ||
    `${row.last_name || ""} ${row.first_name || ""}`.trim() ||
    row.email ||
    "Khach hang";

  const assignedUsers =
    assignedUsersByCustomerId[row.id]?.length
      ? assignedUsersByCustomerId[row.id]
      : toAssignedUsersFromCustomer(row, allowedAssigneeIds);

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
    assignee: formatAssigneeLabel(assignedUsers),
    relationship: row.note || "",
    lastContactDate: row.updated_at ? new Date(row.updated_at) : undefined,
    createdDate: row.created_at ? new Date(row.created_at) : new Date(),
    customerSource: row.type || "",
    gender: mapApiGenderToCustomer(row.gender),
    status: mapIsActiveToStatus(row.is_active),
    avatar: undefined,
    groups: groupNamesByCustomerId[row.id] || [],
    first_name: row.first_name,
    last_name: row.last_name,
    full_name: row.full_name || undefined,
    assigned_user_id: assignedUsers[0]?.id || undefined,
    assigned_users: assignedUsers,
    customer_source_id: row.customer_source_id || undefined,
    // API-matched fields
    type: row.type || undefined,
    company_name: row.company_name || undefined,
    company_establish_date: row.company_establish_date ? new Date(row.company_establish_date) : undefined,
    description: row.description || undefined,
    day_of_birth: row.day_of_birth ? new Date(row.day_of_birth) : undefined,
    major: row.major || undefined,
    id_no: row.id_no || undefined,
    id_issued_by: row.id_issued_by || undefined,
    id_issued_date: row.id_issued_date ? new Date(row.id_issued_date) : undefined,
    id_issued_place: row.id_issued_place || undefined,
    tax_code: row.tax_code || undefined,
    note: row.note || undefined,
    website: row.website || undefined,
    is_active: row.is_active,
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


export function CustomerListView({ onCountChange }: CustomerListViewProps) {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [groupFilters, setGroupFilters] = useState<CustomerFilterOption[]>([DEFAULT_ALL_GROUP_FILTER]);
  const [customerIdsByGroup, setCustomerIdsByGroup] = useState<Record<string, Set<string>>>({});
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();
  const toastRef = useRef(toast);
  toastRef.current = toast;

  const loadCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const [
        customersResponse,
        tagsResponse,
        customerTagsResponse,
        customerAssignedUsersResponse,
        adminUsersResponse,
      ] = await Promise.all([
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
        customerAssignedUsersService.getCustomerAssignedUsers({
          currentPage: "1",
          pageSize: GROUP_FILTER_PAGE_SIZE,
        }),
        usersService.getAdminUsers({
          currentPage: "1",
          pageSize: "500",
        }),
      ]);

      const data = customersResponse.responseData;
      const rows = data?.rows ?? [];
      const tagRows = tagsResponse.responseData?.rows || [];
      const customerTagRows = customerTagsResponse.responseData?.rows || [];
      const assignedUserRows = customerAssignedUsersResponse.responseData?.rows || [];
      const allowedAssigneeIdSet = buildAllowedAssigneeIdSet(adminUsersResponse.responseData?.rows || []);
      const assignedUsersByCustomerId = mapAssignedUsersByCustomerId(assignedUserRows, allowedAssigneeIdSet);
      const tagNameById = tagRows.reduce<Record<string, string>>((acc, tag) => {
        acc[tag.id] = tag.name;
        return acc;
      }, {});
      const mappedGroupNamesByCustomerId = mapCustomerGroupNamesByCustomerId(
        customerTagRows,
        tagNameById,
      );
      const mappedCustomers = rows.map((row, idx) =>
        mapApiRowToCustomerWithAssignee(
          row,
          idx,
          assignedUsersByCustomerId,
          mappedGroupNamesByCustomerId,
          allowedAssigneeIdSet,
        ),
      );
      const mappedGroupFilters = mapTagRowsToFilters(tagRows);
      const mappedCustomerIdsByGroup = mapCustomerTagRows(customerTagRows);

      setCustomers(mappedCustomers);
      setGroupFilters(mappedGroupFilters);
      setCustomerIdsByGroup(mappedCustomerIdsByGroup);
      setActiveFilter((prev) =>
        prev === "all" || mappedGroupFilters.some((filter) => filter.id === prev) ? prev : "all",
      );
      onCountChange?.(data?.count ?? rows.length);
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Không thể tải danh sách khách hàng.";
      toastRef.current.error("Tải dữ liệu thất bại", msg);
    } finally {
      setIsLoading(false);
    }
  }, [onCountChange]);

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

  const handleCustomerClick = (customer: Customer) => {
    router.push(`/customers/${customer.id}?tab=detail`);
  };

  const handleAddCustomer = () => {
    router.push("/customers/new");
  };

  const handleEditCustomer = (customer: Customer) => {
    router.push(`/customers/${customer.id}?tab=detail&mode=edit`);
  };

  const handleDeleteCustomer = async (customer: Customer) => {
    try {
      await customersService.deleteCustomer(customer.id);
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
      <ListPageLayout
        items={filteredCustomers}
        resetPageKey={`${activeFilter}|${searchQuery}`}
        renderFilters={
          <CustomerFilters
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            counts={filterCounts}
            filters={groupFilters}
          />
        }
        renderSearch={
          <CustomerSearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onAddCustomer={handleAddCustomer}
            onExport={handleExport}
            onImport={handleImport}
          />
        }
        renderTable={(paged) => (
          <CustomerTable
            customers={paged}
            onCustomerClick={handleCustomerClick}
            onCustomerEdit={handleEditCustomer}
            onCustomerDelete={(customer) => { void handleDeleteCustomer(customer); }}
          />
        )}
      />
    </div>
  );
}
