"use client";

import { useState, useMemo } from "react";
import { Customer, CustomerStatus } from "@/types/customer";
import { mockCustomers } from "@/mock-data/customers";
import { CustomerFilters } from "./CustomerFilters";
import { CustomerSearch } from "./CustomerSearch";
import { CustomerTable } from "./CustomerTable";

export function CustomerListView() {
  const [customers] = useState<Customer[]>(mockCustomers);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<CustomerStatus | "all">("all");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedAssignee, setSelectedAssignee] = useState("");

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

    return filtered;
  }, [customers, activeFilter, searchQuery, selectedAssignee]);

  const handleCustomerClick = (customer: Customer) => {
    console.log("Customer clicked:", customer);
    // TODO: Navigate to customer detail page or open modal
  };

  const handleAddCustomer = () => {
    console.log("Add customer clicked");
    // TODO: Open add customer modal or navigate to form
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
      />

      {/* Customer Table */}
      <CustomerTable 
        customers={filteredCustomers} 
        onCustomerClick={handleCustomerClick}
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
    </div>
  );
}
