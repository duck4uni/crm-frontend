"use client";

import { useState, useMemo } from "react";
import { Customer, CustomerStatus } from "@/types/customer";
import { mockCustomers } from "@/mock-data/customers";
import { CustomerFilters } from "./CustomerFilters";
import { CustomerSearch } from "./CustomerSearch";
import { CustomerTable } from "./CustomerTable";
import { CustomerFormModal } from "../forms/CustomerFormModal";
import { CustomerDetailModal } from "../forms/CustomerDetailModal";
import { useToast } from "@/components/ui/ToastProvider";
import { FilterValues } from "../filters/FilterModal";
import { exportToCSV } from "../import-export/exportUtils";

export function CustomerListView() {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<CustomerStatus | "all">("all");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedAssignee, setSelectedAssignee] = useState("");
  const [advancedFilters, setAdvancedFilters] = useState<FilterValues>({});
  const toast = useToast();

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

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

  const handleSaveCustomer = (customerData: Partial<Customer>) => {
    if (editingCustomer) {
      // Update existing customer
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === editingCustomer.id ? { ...c, ...customerData } : c
        )
      );
      toast.success("Cập nhật thành công", `Khách hàng "${customerData.customerName}" đã được cập nhật.`);
    } else {
      // Add new customer
      const newCustomer: Customer = {
        id: `CUST${Date.now()}`,
        orderNumber: customers.length + 1,
        customerName: customerData.customerName || "",
        phone: customerData.phone || "",
        address: customerData.address || "",
        salutation: customerData.salutation || "Anh",
        mobilePhone: customerData.mobilePhone || "",
        source: customerData.source || "",
        assignee: customerData.assignee || "",
        relationship: customerData.relationship || "",
        createdDate: new Date(),
        customerSource: customerData.customerSource || "",
        gender: customerData.gender || "Male",
        sessionCount: customerData.sessionCount || 0,
        remainingSessions: customerData.remainingSessions || 0,
        status: customerData.status || CustomerStatus.NEW,
      };
      setCustomers((prev) => [newCustomer, ...prev]);
      toast.success("Thêm mới thành công", `Khách hàng "${customerData.customerName}" đã được thêm vào danh sách.`);
    }
  };

  const handleDeleteCustomer = (customer: Customer) => {
    setCustomers((prev) => prev.filter((c) => c.id !== customer.id));
    setIsDetailModalOpen(false);
    toast.success("Xóa thành công", `Khách hàng "${customer.customerName}" đã bị xóa.`);
  };

  const handleApplyFilters = (filters: FilterValues) => {
    setAdvancedFilters(filters);
    toast.success("Áp dụng bộ lọc", "Bộ lọc đã được áp dụng thành công");
  };

  const handleExport = () => {
    exportToCSV(filteredCustomers, "danh-sach-khach-hang");
    toast.success("Xuất file thành công", `Đã xuất ${filteredCustomers.length} khách hàng`);
  };

  const handleImport = (data: any[]) => {
    // In real app, this would parse and validate the imported data
    toast.success("Import thành công", `Đã import ${data.length} khách hàng mới`);
  };

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
        onDelete={handleDeleteCustomer}
      />
    </div>
  );
}
