"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/ToastProvider";
import { formatVND, formatDateVNDateOnly } from "@/lib/utils";
import { useFinanceState, useFinanceStore } from "@/hooks/useFinanceStore";
import type { NganSach, TrangThaiNganSach } from "@/services/finance/types";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import { NganSachFormModal } from "./components/NganSachFormModal";

export default function NganSachPage() {
  const state = useFinanceState();
  const store = useFinanceStore();
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [trangThai, setTrangThai] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<NganSach | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return state.nganSach.filter((n) => {
      if (q && !n.ten.toLowerCase().includes(q)) return false;
      if (trangThai && n.trangThai !== trangThai) return false;
      return true;
    });
  }, [state.nganSach, search, trangThai]);

  const STATUS_LABEL: Record<TrangThaiNganSach, { label: string; variant: "success" | "warning" | "default" }> = {
    active: { label: "Đang sử dụng", variant: "success" },
    expired: { label: "Hết hạn", variant: "warning" },
    inactive: { label: "Ngưng", variant: "default" },
  };

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Input
          placeholder="Tên ngân sách"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <div className="w-48">
          <Select
            value={trangThai}
            onChange={(e) => setTrangThai(e.target.value)}
            options={[
              { value: "active", label: "Đang sử dụng" },
              { value: "expired", label: "Hết hạn" },
              { value: "inactive", label: "Ngưng" },
            ]}
            placeholder="Tất cả trạng thái"
          />
        </div>
        <Button
          className="ml-auto"
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
        >
          <FiPlus className="w-4 h-4 mr-1" /> Thêm mới
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium">#</th>
              <th className="text-left px-4 py-3 font-medium">Tên ngân sách</th>
              <th className="text-right px-4 py-3 font-medium">Số tiền</th>
              <th className="text-right px-4 py-3 font-medium">Đã sử dụng</th>
              <th className="text-right px-4 py-3 font-medium">Còn lại</th>
              <th className="text-left px-4 py-3 font-medium">Người quản lý</th>
              <th className="text-left px-4 py-3 font-medium">Thời gian</th>
              <th className="text-left px-4 py-3 font-medium">Trạng thái</th>
              <th className="text-right px-4 py-3 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-8 text-gray-500">
                  Chưa có ngân sách
                </td>
              </tr>
            )}
            {filtered.map((n, i) => {
              const conLai = n.soTien - n.daSuDung;
              const manager = state.nguoiDung.find((u) => u.id === n.nguoiQuanLy);
              const status = STATUS_LABEL[n.trangThai];
              return (
                <tr key={n.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-primary-700">{n.ten}</td>
                  <td className="px-4 py-3 text-right">{formatVND(n.soTien)}</td>
                  <td className="px-4 py-3 text-right text-orange-600">{formatVND(n.daSuDung)}</td>
                  <td className={`px-4 py-3 text-right font-semibold ${conLai < 0 ? "text-red-600" : "text-green-600"}`}>
                    {formatVND(conLai)}
                  </td>
                  <td className="px-4 py-3">{manager?.ten ?? "-"}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {formatDateVNDateOnly(n.ngayBatDau)} → {formatDateVNDateOnly(n.ngayKetThuc)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        setEditing(n);
                        setShowForm(true);
                      }}
                      className="text-gray-500 hover:text-primary-600 mr-2"
                    >
                      <FiEdit2 className="w-4 h-4 inline" />
                    </button>
                    <button
                      onClick={() => {
                        if (!confirm(`Xóa ngân sách "${n.ten}"?`)) return;
                        store.deleteNganSach(n.id);
                        toast.success("Đã xóa ngân sách");
                      }}
                      className="text-gray-500 hover:text-red-600"
                    >
                      <FiTrash2 className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <NganSachFormModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        editing={editing}
      />
    </div>
  );
}
