"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { formatVND } from "@/lib/utils";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import { UserCell } from "./UserCell";
import type { Quy } from "@/services/finance/types";
import type { NguoiDung } from "@/services/finance/types";

interface Props {
  filteredQuy: Quy[];
  nguoiDung: NguoiDung[];
  search: string;
  trangThaiFilter: string;
  totalBalance: number;
  onSearchChange: (v: string) => void;
  onTrangThaiChange: (v: string) => void;
  onCreate: () => void;
  onEdit: (quy: Quy) => void;
  onDelete: (quy: Quy) => void;
}

export function QuanLyQuyTab({
  filteredQuy,
  nguoiDung,
  search,
  trangThaiFilter,
  totalBalance,
  onSearchChange,
  onTrangThaiChange,
  onCreate,
  onEdit,
  onDelete,
}: Props) {
  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Input
          placeholder="Tên quỹ"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-xs"
        />
        <div className="w-48">
          <Select
            value={trangThaiFilter}
            onChange={(e) => onTrangThaiChange(e.target.value)}
            options={[
              { value: "active", label: "Đang sử dụng" },
              { value: "inactive", label: "Ngưng sử dụng" },
            ]}
            placeholder="Trạng thái"
          />
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-sm text-gray-600">
            Tổng tồn quỹ:{" "}
            <span className="font-semibold text-primary-700">{formatVND(totalBalance)}</span>
          </span>
          <Button onClick={onCreate}>
            <FiPlus className="w-4 h-4 mr-1" /> Thêm quỹ
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Tên quỹ</th>
              <th className="text-right px-4 py-3 font-medium text-gray-700">Tồn quỹ</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Thủ quỹ</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Người duyệt</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Người quản lý</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Người tạo</th>
              <th className="text-right px-4 py-3 font-medium text-gray-700">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuy.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">
                  Chưa có dữ liệu
                </td>
              </tr>
            )}
            {filteredQuy.map((quy) => {
              const manager = nguoiDung.find((u) => u.id === quy.nguoiQuanLy);
              const thuQuy = nguoiDung.find((u) => u.id === quy.thuQuy);
              const duyet = nguoiDung.find((u) => u.id === quy.nguoiDuyet);
              const tao = nguoiDung.find((u) => u.id === quy.nguoiTao);
              return (
                <tr key={quy.id} className="border-b border-gray-100 hover:bg-gray-50 group">
                  <td className="px-4 py-3 font-medium text-gray-900">{quy.ten}</td>
                  <td className="px-4 py-3 text-right font-semibold text-orange-600">
                    {quy.soDu.toLocaleString("vi-VN", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3"><UserCell user={thuQuy} /></td>
                  <td className="px-4 py-3"><UserCell user={duyet} /></td>
                  <td className="px-4 py-3"><UserCell user={manager} /></td>
                  <td className="px-4 py-3"><UserCell user={tao} /></td>
                  <td className="px-4 py-3 text-right">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex gap-2">
                      <button
                        onClick={() => onEdit(quy)}
                        className="text-gray-500 hover:text-primary-600"
                        title="Sửa"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(quy)}
                        className="text-gray-500 hover:text-red-600"
                        title="Xóa"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
