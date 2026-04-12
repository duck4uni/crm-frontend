"use client";

import { useState } from "react";
import {
  Search,
  Download,
  Upload,
  Plus
} from "lucide-react";
import { ImportModal } from "../import-export/ImportModal";

interface CustomerSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddCustomer: () => void;
  onExport: () => void;
  onImport: (data: any[], file?: File) => Promise<{
    success: number;
    failed: number;
    errors: string[];
  } | void> | {
    success: number;
    failed: number;
    errors: string[];
  } | void;
}

export function CustomerSearch({
  searchQuery,
  onSearchChange,
  onAddCustomer,
  onExport,
  onImport,
}: CustomerSearchProps) {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {/* Search bar */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Tìm tên, số khách hàng"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm transition-all"
          />
        </div>

        {/* Export button */}
        <button
          onClick={onExport}
          className="h-10 px-3 flex items-center gap-1.5 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-gray-600 text-sm transition-colors shadow-sm"
          title="Xuất danh sách"
        >
          <Download className="w-4 h-4" />
          <span>Xuất</span>
        </button>

        {/* Import button */}
        <button
          onClick={() => setIsImportModalOpen(true)}
          className="h-10 px-3 flex items-center gap-1.5 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-gray-600 text-sm transition-colors shadow-sm"
          title="Nhập danh sách"
        >
          <Upload className="w-4 h-4" />
          <span>Nhập</span>
        </button>

        {/* Add customer button */}
        <button
          onClick={onAddCustomer}
          className="h-10 px-4 flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow"
        >
          <Plus className="w-4 h-4" />
          Thêm khách hàng
        </button>
      </div>

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={onImport}
      />
    </div>
  );
}
