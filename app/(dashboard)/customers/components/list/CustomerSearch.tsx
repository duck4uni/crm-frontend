"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Users,
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
  const router = useRouter();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Tìm tên, số khách hàng"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all"
          />
        </div>

        <div className="flex-1"></div>

        <button
          onClick={() => router.push("/customers/groups")}
          className="h-10 px-4 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow"
          title="Quản lý nhóm khách hàng"
        >
          <Users className="w-4 h-4" />
          Quản lý nhóm khách hàng
        </button>

        <button
          onClick={onExport}
          className="h-10 w-10 flex items-center justify-center border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors shadow-sm"
          title="Tải xuống"
        >
          <Download className="w-4 h-4 text-gray-600" />
        </button>

        <button
          onClick={() => setIsImportModalOpen(true)}
          className="h-10 w-10 flex items-center justify-center border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors shadow-sm"
          title="Tải lên"
        >
          <Upload className="w-4 h-4 text-gray-600" />
        </button>

        <button
          onClick={onAddCustomer}
          className="h-10 px-4 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow"
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
