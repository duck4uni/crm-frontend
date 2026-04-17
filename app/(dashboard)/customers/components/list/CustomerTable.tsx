"use client";

import { Customer } from "@/types/customer";
import { Avatar } from "@/components/ui/Avatar";
import { formatDateVN } from "@/lib/utils";
import { FiEye, FiEdit2, FiTrash2 } from "react-icons/fi";
import { useState } from "react";

interface CustomerTableProps {
  customers: Customer[];
  onCustomerClick?: (customer: Customer) => void;
  onCustomerEdit?: (customer: Customer) => void;
  onCustomerDelete?: (customer: Customer) => void;
}

type SortField = keyof Customer | null;
type SortDirection = "asc" | "desc";

const GENDER_LABELS: Record<string, string> = {
  Male: "Nam",
  Female: "Nữ",
  Other: "Khác",
};

function splitAssigneeLines(value?: string): string[] {
  if (!value || value === "-") return ["-"];
  const lines = value.split("\n").map(item => item.trim()).filter(Boolean);
  return lines.length > 0 ? lines : ["-"];
}

export function CustomerTable({
  customers,
  onCustomerClick,
  onCustomerEdit,
  onCustomerDelete,
}: CustomerTableProps) {
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
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
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <TableHeader label="Tên khách hàng" field="customerName" onSort={handleSort} sortField={sortField} sortDirection={sortDirection} />
            <TableHeader label="Giới tính" field="gender" onSort={handleSort} sortField={sortField} sortDirection={sortDirection} />
            <TableHeader label="Số điện thoại" field="mobilePhone" onSort={handleSort} sortField={sortField} sortDirection={sortDirection} />
            <TableHeader label="Leader" field="leader_assignee" onSort={handleSort} sortField={sortField} sortDirection={sortDirection} />
            <TableHeader label="Worker" field="worker_assignee" onSort={handleSort} sortField={sortField} sortDirection={sortDirection} />
            <TableHeader label="Ngày tạo" field="createdDate" onSort={handleSort} sortField={sortField} sortDirection={sortDirection} />
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sortedCustomers.map((customer) => (
            <CustomerTableRow
              key={customer.id}
              customer={customer}
              onView={onCustomerClick}
              onEdit={onCustomerEdit}
              onDelete={onCustomerDelete}
            />
          ))}
        </tbody>
      </table>
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
          <span className="text-primary-600">
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
  onView?: (customer: Customer) => void;
  onEdit?: (customer: Customer) => void;
  onDelete?: (customer: Customer) => void;
}

function CustomerTableRow({ customer, onView, onEdit, onDelete }: CustomerTableRowProps) {
  const gender = GENDER_LABELS[customer.gender] ?? customer.gender;
  const phone = customer.mobilePhone || customer.phone || "-";
  const leaderAssignee = customer.leader_assignee || "-";
  const workerAssignee = customer.worker_assignee || "-";

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-4">
        <div className="flex items-center space-x-3">
          <Avatar name={customer.customerName} src={customer.avatar} />
          <span className="text-sm font-medium text-gray-900">{customer.customerName}</span>
        </div>
      </td>
      <td className="px-4 py-4 text-sm text-gray-600">{gender}</td>
      <td className="px-4 py-4 text-sm text-gray-900">{phone}</td>
      <td className="px-4 py-4 text-sm text-gray-600 align-top">
        <div className="space-y-1">
          {splitAssigneeLines(leaderAssignee).map((line, index) => (
            <p key={`${customer.id}-leader-${index}`} className="whitespace-nowrap">
              {line}
            </p>
          ))}
        </div>
      </td>
      <td className="px-4 py-4 text-sm text-gray-600 align-top">
        <div className="space-y-1">
          {splitAssigneeLines(workerAssignee).map((line, index) => (
            <p key={`${customer.id}-worker-${index}`} className="whitespace-nowrap">
              {line}
            </p>
          ))}
        </div>
      </td>
      <td className="px-4 py-4 text-sm text-gray-600 whitespace-pre-line">
        {formatDateVN(customer.createdDate)}
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onView?.(customer)}
            className="p-1.5 text-primary-600 hover:bg-primary-50 rounded transition-colors"
            title="Xem chi tiết"
          >
            <FiEye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit?.(customer)}
            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
            title="Chỉnh sửa"
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete?.(customer)}
            className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
            title="Xóa"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
