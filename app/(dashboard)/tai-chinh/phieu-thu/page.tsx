"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/ToastProvider";
import { formatVND, formatDateVNDateOnly } from "@/lib/utils";
import { useFinanceState, useFinanceStore } from "@/hooks/useFinanceStore";
import {
  NGUON_THU_LABEL,
  type PhieuThu,
  type NguonThu,
} from "@/services/finance/types";
import { FiPlus, FiEye, FiEdit2, FiTrash2 } from "react-icons/fi";
import { PhieuThuFormModal } from "./components/PhieuThuFormModal";
import { PhieuThuDetailModal } from "./components/PhieuThuDetailModal";

export default function PhieuThuPage() {
  const state = useFinanceState();
  const store = useFinanceStore();
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [quyFilter, setQuyFilter] = useState("");
  const [nguonFilter, setNguonFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PhieuThu | null>(null);
  const [detail, setDetail] = useState<PhieuThu | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return state.phieuThu.filter((p) => {
      if (q && !(p.soChungTu.toLowerCase().includes(q) || p.noiDung.toLowerCase().includes(q))) {
        return false;
      }
      if (quyFilter && p.quyId !== quyFilter) return false;
      if (nguonFilter && p.nguon !== nguonFilter) return false;
      return true;
    });
  }, [state.phieuThu, search, quyFilter, nguonFilter]);

  const total = filtered.reduce((s, p) => s + p.soTien, 0);

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Input
          placeholder="Số CT / Nội dung"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <div className="w-48">
          <Select
            value={quyFilter}
            onChange={(e) => setQuyFilter(e.target.value)}
            options={state.quy.map((q) => ({ value: q.id, label: q.ten }))}
            placeholder="Tất cả quỹ"
          />
        </div>
        <div className="w-48">
          <Select
            value={nguonFilter}
            onChange={(e) => setNguonFilter(e.target.value)}
            options={Object.entries(NGUON_THU_LABEL).map(([v, l]) => ({
              value: v,
              label: l,
            }))}
            placeholder="Tất cả nguồn"
          />
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-sm text-gray-600">
            Tổng:{" "}
            <span className="font-semibold text-primary-700">
              {formatVND(total)}
            </span>
          </span>
          <Button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
          >
            <FiPlus className="w-4 h-4 mr-1" /> Tạo phiếu thu
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Số CT</th>
              <th className="text-left px-4 py-3 font-medium">Ngày</th>
              <th className="text-left px-4 py-3 font-medium">Nội dung</th>
              <th className="text-left px-4 py-3 font-medium">Quỹ</th>
              <th className="text-left px-4 py-3 font-medium">Nguồn</th>
              <th className="text-left px-4 py-3 font-medium">Khách hàng</th>
              <th className="text-right px-4 py-3 font-medium">Số tiền</th>
              <th className="text-right px-4 py-3 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-8 text-gray-500">
                  Chưa có phiếu thu
                </td>
              </tr>
            )}
            {filtered.map((p) => {
              const quy = state.quy.find((q) => q.id === p.quyId);
              const kh = state.congNo.find((k) => k.id === p.khachHangId);
              return (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-primary-700">{p.soChungTu}</td>
                  <td className="px-4 py-3">{formatDateVNDateOnly(p.ngayYeuCau)}</td>
                  <td className="px-4 py-3">{p.noiDung}</td>
                  <td className="px-4 py-3 text-gray-600">{quy?.ten ?? "-"}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {NGUON_THU_LABEL[p.nguon as NguonThu]}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{kh?.ten ?? "-"}</td>
                  <td className="px-4 py-3 text-right font-semibold text-orange-600">
                    {formatVND(p.soTien)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setDetail(p)}
                      className="text-gray-500 hover:text-primary-600 mr-2"
                      title="Xem"
                    >
                      <FiEye className="w-4 h-4 inline" />
                    </button>
                    <button
                      onClick={() => {
                        setEditing(p);
                        setShowForm(true);
                      }}
                      className="text-gray-500 hover:text-primary-600 mr-2"
                      title="Sửa"
                    >
                      <FiEdit2 className="w-4 h-4 inline" />
                    </button>
                    <button
                      onClick={() => {
                        if (!confirm(`Xóa phiếu ${p.soChungTu}?`)) return;
                        store.deletePhieuThu(p.id);
                        toast.success("Đã xóa phiếu thu");
                      }}
                      className="text-gray-500 hover:text-red-600"
                      title="Xóa"
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

      <PhieuThuFormModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        editing={editing}
      />
      <PhieuThuDetailModal
        phieu={detail}
        onClose={() => setDetail(null)}
      />
    </div>
  );
}
