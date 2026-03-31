"use client";

import { useState } from "react";
import { Select } from "@/components/ui/Select";
import {
  Search,
  Filter,
  Users,
  Calendar,
  Sparkles,
  Download,
  Upload,
  Plus
} from "lucide-react";
import { FiChevronDown } from "react-icons/fi";
import { FilterModal, FilterValues } from "../filters/FilterModal";
import { SavedFiltersDropdown } from "../filters/SavedFiltersDropdown";
import { CustomerGroupModal } from "../groups/CustomerGroupModal";
import { ImportModal } from "../import-export/ImportModal";

interface CustomerSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedGroup?: string;
  onGroupChange: (group: string) => void;
  selectedAssignee?: string;
  onAssigneeChange: (assignee: string) => void;
  onAddCustomer: () => void;
  onApplyFilters: (filters: FilterValues) => void;
  onExport: () => void;
  onImport: (data: any[]) => void;
}

export function CustomerSearch({
  searchQuery,
  onSearchChange,
  selectedGroup,
  onGroupChange,
  selectedAssignee,
  onAssigneeChange,
  onAddCustomer,
  onApplyFilters,
  onExport,
  onImport,
}: CustomerSearchProps) {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<FilterValues>({});

  const handleApplyFilters = (filters: FilterValues) => {
    setCurrentFilters(filters);
    onApplyFilters(filters);
  };

  const handleSelectSavedFilter = (filters: FilterValues) => {
    setCurrentFilters(filters);
    onApplyFilters(filters);
  };

  const handleSelectGroup = (groupId: string) => {
    onGroupChange(groupId);
  };

  return (
    <div className="space-y-3">
      {/* Row 1: Search + Main Actions */}
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

        <button
          onClick={() => setIsFilterModalOpen(true)}
          className="h-10 px-4 flex items-center gap-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-sm font-medium transition-colors shadow-sm"
        >
          <Filter className="w-4 h-4" />
          Bộ lọc
        </button>

        <SavedFiltersDropdown
          onSelectFilter={handleSelectSavedFilter}
          currentFilters={currentFilters}
        />

        <button
          onClick={() => setIsGroupModalOpen(true)}
          className="h-10 px-4 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow"
        >
          <Users className="w-4 h-4" />
          Chọn nhóm khách hàng
        </button>
      </div>

      {/* Row 2: Filters + Quick Actions */}
      <div className="flex items-center gap-3">
        <div className="w-56">
          <Select
            value={selectedAssignee}
            onChange={(e) => onAssigneeChange(e.target.value)}
            options={[
              { value: "getfly_admin", label: "Getfly Admin" },
              { value: "nguyen_van_a", label: "Nguyễn Văn A" },
              { value: "tran_thi_b", label: "Trần Thị B" },
            ]}
            variant="subtle"
            placeholder="Chọn người phụ trách"
          />
        </div>

        <button className="h-10 px-4 flex items-center gap-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-sm transition-colors shadow-sm">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-gray-600">Thời gian:</span>
          <span className="font-medium text-gray-900">Tất cả</span>
          <FiChevronDown className="w-4 h-4 text-gray-400 ml-1" />
        </button>

        <button className="h-10 px-4 border border-blue-300 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-sm font-medium flex items-center gap-2 transition-colors shadow-sm">
          <Sparkles className="w-4 h-4" />
          Mới cập nhật
        </button>

        <button className="h-10 px-4 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors shadow-sm">
          Đừng quên
        </button>

        <button className="h-10 px-4 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors shadow-sm">
          Sinh nhật
        </button>

        <div className="flex-1"></div>

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

      {/* Modals */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={handleApplyFilters}
        initialFilters={currentFilters}
      />

      <CustomerGroupModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        onSelectGroup={handleSelectGroup}
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={onImport}
      />
    </div>
  );
}
