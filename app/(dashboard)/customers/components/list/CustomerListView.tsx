"use client";

import { ListPageLayout } from "@/components/ui/ListPageLayout";
import { useCustomersPage } from "../../hooks/useCustomersPage";
import { CustomerFilters } from "./CustomerFilters";
import { CustomerSearch } from "./CustomerSearch";
import { CustomerTable } from "./CustomerTable";

interface CustomerListViewProps {
    onCountChange?: (count: number) => void;
}

export function CustomerListView({ onCountChange }: CustomerListViewProps) {
    const {
        isLoading,
        searchQuery,
        setSearchQuery,
        activeFilter,
        setActiveFilter,
        groupFilters,
        filterCounts,
        filteredCustomers,
        handleCustomerClick,
        handleAddCustomer,
        handleEditCustomer,
        handleRequestDeleteCustomer,
        handleExport,
        handleImport,
        DeleteConfirmationDialog,
    } = useCustomersPage(onCountChange);

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
                        onCustomerDelete={handleRequestDeleteCustomer}
                    />
                )}
            />
            <DeleteConfirmationDialog />
        </div>
    );
}
