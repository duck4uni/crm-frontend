"use client";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { 
  Search, 
  Filter, 
  BookmarkPlus, 
  Users, 
  Calendar,
  Sparkles,
  Download,
  Upload,
  Plus
} from "lucide-react";

interface CustomerSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedGroup?: string;
  onGroupChange: (group: string) => void;
  selectedAssignee?: string;
  onAssigneeChange: (assignee: string) => void;
  onAddCustomer: () => void;
}

export function CustomerSearch({
  searchQuery,
  onSearchChange,
  selectedGroup,
  onGroupChange,
  selectedAssignee,
  onAssigneeChange,
  onAddCustomer,
}: CustomerSearchProps) {
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
            className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button className="h-10 px-4 flex items-center gap-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-sm font-medium">
          <Filter className="w-4 h-4" />
          Bộ lọc
        </button>

        <button className="h-10 px-4 flex items-center gap-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-sm font-medium">
          <BookmarkPlus className="w-4 h-4" />
          Bộ lọc đã lưu
        </button>

        <button className="h-10 px-4 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium">
          <Users className="w-4 h-4" />
          Chọn nhóm khách hàng
        </button>
      </div>

      {/* Row 2: Filters + Quick Actions */}
      <div className="flex items-center gap-3">
        <select
          value={selectedAssignee}
          onChange={(e) => onAssigneeChange(e.target.value)}
          className="h-10 px-3 pr-8 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Chọn người phụ trách</option>
          <option value="getfly_admin">Getfly Admin</option>
          <option value="nguyen_van_a">Nguyễn Văn A</option>
          <option value="tran_thi_b">Trần Thị B</option>
        </select>

        <button className="h-10 px-4 flex items-center gap-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-sm">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span>Thời gian:</span>
          <span className="font-medium">Tất cả</span>
        </button>

        <button className="h-10 px-4 border border-blue-300 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-sm font-medium flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Mới cập nhật
        </button>

        <button className="h-10 px-4 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-sm font-medium">
          Đừng quên
        </button>

        <button className="h-10 px-4 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-sm font-medium">
          Sinh nhật
        </button>

        <div className="flex-1"></div>

        <button className="h-10 w-10 flex items-center justify-center border border-gray-300 rounded-lg bg-white hover:bg-gray-50">
          <Download className="w-4 h-4 text-gray-600" />
        </button>

        <button className="h-10 w-10 flex items-center justify-center border border-gray-300 rounded-lg bg-white hover:bg-gray-50">
          <Upload className="w-4 h-4 text-gray-600" />
        </button>

        <button className="h-10 w-10 flex items-center justify-center border border-gray-300 rounded-lg bg-white hover:bg-gray-50">
          <Plus className="w-4 h-4 text-gray-600" />
        </button>
      </div>
    </div>
  );
}
