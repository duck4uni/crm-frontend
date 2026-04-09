"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Customer, CustomerStatus } from "@/types/customer";
import {
  CreateCustomerPayload,
  CustomerApiRow,
  UpdateCustomerPayload,
} from "@/types/api";
import { customersService } from "@/services/customers";
import { usersService } from "@/services/users";
import { CustomerFilters } from "./CustomerFilters";
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
  return mapApiRowToCustomerWithAssignee(row, index, {});
}

function mapApiRowToCustomerWithAssignee(
  row: CustomerApiRow,
  index: number,
  assigneeNameMap: Record<string, string>,
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
  };
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

export function CustomerListView({ onCountChange }: CustomerListViewProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<CustomerStatus | "all">("all");
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
      const response = await customersService.getCustomers({
        currentPage: "1",
        pageSize: "200",
      });

      const data = response.responseData;
      const rows = data?.rows ?? [];
      const assigneeNameMap = await resolveAssigneeNameMap(rows);
      const mappedCustomers = rows.map((row, idx) =>
        mapApiRowToCustomerWithAssignee(row, idx, assigneeNameMap),
      );

      setCustomers(mappedCustomers);
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

    Object.values(CustomerStatus).forEach((status) => {
      counts[status] = customers.filter((c) => c.status === status).length;
    });

    return counts;
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    let filtered = customers;

    if (activeFilter !== "all") {
      filtered = filtered.filter((customer) => customer.status === activeFilter);
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
  }, [customers, activeFilter, searchQuery]);

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

  const handleSaveCustomer = async (customerData: Partial<Customer>) => {
    try {
      if (editingCustomer) {
        await customersService.updateCustomer(
          editingCustomer.id,
          mapFormToUpdatePayload(customerData),
        );
        toast.success(
          "Cập nhật thành công",
          `Khách hàng "${customerData.customerName}" đã được cập nhật.`,
        );
      } else {
        await customersService.createCustomer(mapFormToCreatePayload(customerData));
        toast.success(
          "Thêm mới thành công",
          `Khách hàng "${customerData.customerName}" đã được thêm vào danh sách.`,
        );
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
