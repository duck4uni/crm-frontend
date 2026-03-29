"use client";

import { Customer } from "@/types/customer";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { formatDateVN } from "@/lib/utils";
import { FiMoreVertical } from "react-icons/fi";
import { useState } from "react";

interface CustomerTableProps {
  customers: Customer[];
  onCustomerClick?: (customer: Customer) => void;
}

type SortField = keyof Customer | null;
type SortDirection = "asc" | "desc";

export function CustomerTable({ customers, onCustomerClick }: CustomerTableProps) {
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleSelectAll = () => {
    if (selectedRows.size === customers.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(customers.map((c) => c.id)));
    }
  };

  const handleSelectRow = (id: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const sortedCustomers = [...customers].sort((a, b) => {
    if (!sortField) return 0;
    
    const aVal = a[sortField];
    const bVal = b[sortField];
    
    if (aVal === undefined || aVal === null) return 1;
    if (bVal === undefined || bVal === null) return -1;
    
    const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return sortDirection === "asc" ? comparison : -comparison;
  });

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left w-12">
                <input
                  type="checkbox"
                  checked={selectedRows.size === customers.length && customers.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300"
                />
              </th>
              <TableHeader label="#" field="orderNumber" onSort={handleSort} sortField={sortField} sortDirection={sortDirection} />
              <TableHeader label="Tên khách hàng" field="customerName" onSort={handleSort} sortField={sortField} sortDirection={sortDirection} />
              <TableHeader label="Danh xưng" field="salutation" onSort={handleSort} sortField={sortField} sortDirection={sortDirection} />
              <TableHeader label="Số di động" field="mobilePhone" onSort={handleSort} sortField={sortField} sortDirection={sortDirection} />
              <TableHeader label="Nguồn" field="source" onSort={handleSort} sortField={sortField} sortDirection={sortDirection} />
              <TableHeader label="Người phụ trách" field="assignee" onSort={handleSort} sortField={sortField} sortDirection={sortDirection} />
              <TableHeader label="Mối quan hệ" field="relationship" onSort={handleSort} sortField={sortField} sortDirection={sortDirection} />
              <TableHeader label="Liên hệ lần cuối" field="lastContactDate" onSort={handleSort} sortField={sortField} sortDirection={sortDirection} />
              <TableHeader label="Ngày tạo" field="createdDate" onSort={handleSort} sortField={sortField} sortDirection={sortDirection} />
              <TableHeader label="Nguồn khách hàng" field="customerSource" onSort={handleSort} sortField={sortField} sortDirection={sortDirection} />
              <TableHeader label="Giới tính" field="gender" onSort={handleSort} sortField={sortField} sortDirection={sortDirection} />
              <TableHeader label="Buổi học" field="sessionCount" onSort={handleSort} sortField={sortField} sortDirection={sortDirection} />
              <TableHeader label="Số buổi còn lại" field="remainingSessions" onSort={handleSort} sortField={sortField} sortDirection={sortDirection} />
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedCustomers.map((customer) => (
              <CustomerTableRow
                key={customer.id}
                customer={customer}
                isSelected={selectedRows.has(customer.id)}
                onSelect={handleSelectRow}
                onClick={onCustomerClick}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
            &lt;
          </button>
          <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
            &gt;
          </button>
        </div>
        <div className="text-sm text-gray-600">
          <span className="mr-2">Tùy chỉnh</span>
          <span>Hiển thị 20 kết quả/trang</span>
        </div>
      </div>
    </div>
  );
}

// Table Header Component with Sorting
interface TableHeaderProps {
  label: string;
  field: SortField;
  onSort: (field: SortField) => void;
  sortField: SortField;
  sortDirection: SortDirection;
}

function TableHeader({ label, field, onSort, sortField, sortDirection }: TableHeaderProps) {
  const isSorted = sortField === field;
  
  return (
    <th
      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        {isSorted && (
          <span className="text-blue-600">
            {sortDirection === "asc" ? "↑" : "↓"}
          </span>
        )}
      </div>
    </th>
  );
}

// Table Row Component
interface CustomerTableRowProps {
  customer: Customer;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onClick?: (customer: Customer) => void;
}

function CustomerTableRow({ customer, isSelected, onSelect, onClick }: CustomerTableRowProps) {
  return (
    <tr 
      className="hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={() => onClick?.(customer)}
    >
      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(customer.id)}
          className="rounded border-gray-300"
        />
      </td>
      <td className="px-4 py-4 text-sm text-gray-900">{customer.orderNumber}</td>
      <td className="px-4 py-4">
        <div className="flex items-center space-x-3">
          <Avatar name={customer.customerName} src={customer.avatar} />
          <span className="text-sm font-medium text-gray-900">{customer.customerName}</span>
        </div>
      </td>
      <td className="px-4 py-4 text-sm text-gray-600">{customer.salutation}</td>
      <td className="px-4 py-4 text-sm text-gray-900">{customer.mobilePhone}</td>
      <td className="px-4 py-4 text-sm text-gray-600">{customer.source || "-"}</td>
      <td className="px-4 py-4 text-sm text-gray-600">{customer.assignee}</td>
      <td className="px-4 py-4 text-sm text-gray-600">{customer.relationship}</td>
      <td className="px-4 py-4 text-sm text-gray-600 whitespace-pre-line">
        {customer.lastContactDate ? formatDateVN(customer.lastContactDate) : "-"}
      </td>
      <td className="px-4 py-4 text-sm text-gray-600 whitespace-pre-line">
        {formatDateVN(customer.createdDate)}
      </td>
      <td className="px-4 py-4 text-sm text-gray-600">{customer.customerSource}</td>
      <td className="px-4 py-4 text-sm text-gray-600">{customer.gender}</td>
      <td className="px-4 py-4 text-sm text-center text-gray-900">
        {customer.sessionCount || 0}
      </td>
      <td className="px-4 py-4 text-sm text-center text-gray-900">
        {customer.remainingSessions || 0}
      </td>
      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
        <button className="text-gray-400 hover:text-gray-600">
          <FiMoreVertical className="w-5 h-5" />
        </button>
      </td>
    </tr>
  );
}
