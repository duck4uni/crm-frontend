"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Customer, CustomerStatus } from "@/types/customer";
import { UserApiRow, CreateUserPayload, UpdateUserPayload } from "@/types/api";
import { usersService } from "@/services/users";
import { CustomerFilters } from "./CustomerFilters";
import { CustomerSearch } from "./CustomerSearch";
import { CustomerTable } from "./CustomerTable";
import { CustomerFormModal } from "../forms/CustomerFormModal";
import { CustomerDetailModal } from "../forms/CustomerDetailModal";
import { useToast } from "@/components/ui/ToastProvider";
import { FilterValues } from "../filters/FilterModal";
import { exportToCSV } from "../import-export/exportUtils";

function mapApiRowToCustomer(row: UserApiRow, index: number): Customer {
  return {
    id: row.id,
    orderNumber: index + 1,
    customerName: row.full_name || row.email,
    email: row.email,
    phone: row.phone || "",
    address: "",
    salutation: "",
    mobilePhone: row.phone || "",
    source: "",
    assignee: "",
    relationship: "",
    lastContactDate: row.updated_at ? new Date(row.updated_at) : undefined,
    createdDate: row.created_at ? new Date(row.created_at) : new Date(),
    customerSource: "",
    gender: "Other",
    status: row.is_active ? CustomerStatus.REGISTERED : CustomerStatus.NEW,
    avatar: row.avatar || undefined,
  };
}

function mapFormToCreatePayload(data: Partial<Customer>): CreateUserPayload {
  return {
    email: (data.email || "").trim(),
    full_name: data.customerName?.trim() || undefined,
    phone: (data.mobilePhone || data.phone || "").trim() || undefined,
    is_active: data.status !== CustomerStatus.NOT_CONTACTED,
  };
}

function mapFormToUpdatePayload(data: Partial<Customer>): UpdateUserPayload {
  return {
    email: data.email?.trim() || undefined,
    full_name: data.customerName?.trim() || undefined,
    phone: (data.mobilePhone || data.phone || "").trim() || undefined,
    is_active: data.status !== CustomerStatus.NOT_CONTACTED,
  };
}

export function CustomerListView() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<CustomerStatus | "all">("all");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedAssignee, setSelectedAssignee] = useState("");
  const [advancedFilters, setAdvancedFilters] = useState<FilterValues>({});
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const loadCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await usersService.getCustomers({ pageSize: "100" });
      const rows = response.responseData?.rows ?? [];
      setCustomers(rows.map((row, idx) => mapApiRowToCustomer(row, idx)));
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Không thể tải danh sách khách hàng.";
      toast.error("Tải dữ liệu thất bại", msg);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  // Calculate filter counts
  const filterCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: customers.length,
    };

    Object.values(CustomerStatus).forEach((status) => {
      counts[status] = customers.filter((c) => c.status === status).length;
    });

    return counts;
  }, [customers]);

  // Filter customers based on search query and active filter
  const filteredCustomers = useMemo(() => {
    let filtered = customers;

    // Apply status filter
    if (activeFilter !== "all") {
      filtered = filtered.filter((customer) => customer.status === activeFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (customer) =>
          customer.customerName.toLowerCase().includes(query) ||
          customer.phone.includes(query) ||
          customer.mobilePhone.includes(query) ||
          customer.id.toLowerCase().includes(query)
      );
    }

    // Apply assignee filter
    if (selectedAssignee) {
      filtered = filtered.filter((customer) =>
        customer.assignee.toLowerCase().includes(selectedAssignee.toLowerCase())
      );
    }

    // Apply advanced filters
    if (advancedFilters.status) {
      filtered = filtered.filter((customer) => customer.status === advancedFilters.status);
    }

    if (advancedFilters.assignee) {
      filtered = filtered.filter((customer) => customer.assignee === advancedFilters.assignee);
    }

    if (advancedFilters.dateFrom) {
      const fromDate = new Date(advancedFilters.dateFrom);
      filtered = filtered.filter((customer) => new Date(customer.createdDate) >= fromDate);
    }

    if (advancedFilters.dateTo) {
      const toDate = new Date(advancedFilters.dateTo);
      filtered = filtered.filter((customer) => new Date(customer.createdDate) <= toDate);
    }

    if (advancedFilters.source) {
      filtered = filtered.filter((customer) => customer.source === advancedFilters.source);
    }

    return filtered;
  }, [customers, activeFilter, searchQuery, selectedAssignee, advancedFilters]);

  const handleCustomerClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailModalOpen(true);
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
        await usersService.updateUser(
          editingCustomer.id,
          mapFormToUpdatePayload(customerData),
        );
        toast.success("Cập nhật thành công", `Khách hàng "${customerData.customerName}" đã được cập nhật.`);
      } else {
        await usersService.createUsers([mapFormToCreatePayload(customerData)]);
        toast.success("Thêm mới thành công", `Khách hàng "${customerData.customerName}" đã được thêm vào danh sách.`);
      }

      await loadCustomers();
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Không thể lưu khách hàng.";
      toast.error("Lưu thất bại", msg);
      throw error;
    }
  };

  const handleDeleteCustomer = async (customer: Customer) => {
    try {
      await usersService.deleteUser(customer.id);
      setIsDetailModalOpen(false);
      await loadCustomers();
      toast.success("Xóa thành công", `Khách hàng "${customer.customerName}" đã bị xóa.`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Không thể xóa khách hàng.";
      toast.error("Xóa thất bại", msg);
    }
  };

  const handleApplyFilters = (filters: FilterValues) => {
    setAdvancedFilters(filters);
    toast.success("Áp dụng bộ lọc", "Bộ lọc đã được áp dụng thành công");
  };

  const handleExport = async () => {
    try {
      const blob = await usersService.exportUsers();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `khach-hang-${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Xuất file thành công", `Đã xuất danh sách khách hàng`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Không thể xuất file.";
      toast.error("Xuất file thất bại", msg);
    }
  };

  const handleImport = async (data: any[], file?: File) => {
    if (file) {
      try {
        const response = await usersService.importUsers(file);
        const result = response.responseData;
        toast.success("Nhập dữ liệu thành công", `Đã tạo ${result?.created ?? 0}, cập nhật ${result?.updated ?? 0} khách hàng`);
        loadCustomers();
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Không thể nhập file.";
        toast.error("Nhập dữ liệu thất bại", msg);
      }
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
      {/* Filters */}
      <CustomerFilters
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        counts={filterCounts}
      />

      {/* Search and Actions */}
      <CustomerSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedGroup={selectedGroup}
        onGroupChange={setSelectedGroup}
        selectedAssignee={selectedAssignee}
        onAssigneeChange={setSelectedAssignee}
        onAddCustomer={handleAddCustomer}
        onApplyFilters={handleApplyFilters}
        onExport={handleExport}
        onImport={handleImport}
      />

      {/* Customer Table */}
      <CustomerTable
        customers={filteredCustomers}
        onCustomerClick={handleCustomerClick}
        onCustomerEdit={handleEditCustomer}
      />

      {/* Summary Footer */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Hiển thị {filteredCustomers.length} khách hàng
            {activeFilter !== "all" && " trong bộ lọc đã chọn"}
          </span>
        </div>
      </div>

      {/* Modals */}
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
