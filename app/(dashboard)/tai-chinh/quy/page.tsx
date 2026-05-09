"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/ToastProvider";
import { formatVND } from "@/lib/utils";
import { useFinanceState, useFinanceStore } from "@/hooks/useFinanceStore";
import { LOAI_QUY_LABEL, type Quy, type LoaiQuy } from "@/services/finance/types";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import { QuyFormModal } from "./components/QuyFormModal";

const SUB_TABS = [
  { id: "quan-ly", label: "Quản lý quỹ" },
  { id: "phieu-thu", label: "Phiếu thu" },
  { id: "phieu-chi", label: "Phiếu chi" },
  { id: "hach-toan", label: "Hạch toán quỹ" },
];

export default function QuyPage() {
  const router = useRouter();
  const state = useFinanceState();
  const store = useFinanceStore();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("quan-ly");
  const [search, setSearch] = useState("");
  const [trangThai, setTrangThai] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Quy | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return state.quy.filter((quy) => {
      if (q && !quy.ten.toLowerCase().includes(q)) return false;
      if (trangThai && quy.trangThai !== trangThai) return false;
      return true;
    });
  }, [state.quy, search, trangThai]);

  const handleTabChange = (id: string) => {
    if (id === "phieu-thu") {
      router.push("/tai-chinh/phieu-thu");
      return;
    }
    if (id === "phieu-chi") {
      router.push("/tai-chinh/phieu-chi");
      return;
    }
    setActiveTab(id);
  };

  const onCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const onEdit = (quy: Quy) => {
    setEditing(quy);
    setShowForm(true);
  };

  const onDelete = (quy: Quy) => {
    if (!confirm(`Xóa quỹ "${quy.ten}"?`)) return;
    const result = store.deleteQuy(quy.id);
    if (!result.ok) {
      toast.warning("Không thể xóa", result.reason);
      return;
    }
    toast.success("Đã xóa quỹ");
  };

  const totalBalance = state.quy.reduce((s, q) => s + q.soDu, 0);

  return (
    <div className="p-6">
      <div className="flex items-center gap-1 border-b border-gray-200 mb-4">
        {SUB_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => handleTabChange(t.id)}
            className={`py-2 px-4 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === t.id
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "quan-ly" && (
        <>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Input
              placeholder="Tên quỹ"
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
                  { value: "inactive", label: "Ngưng sử dụng" },
                ]}
                placeholder="Trạng thái"
              />
            </div>
            <div className="ml-auto flex items-center gap-3">
              <span className="text-sm text-gray-600">
                Tổng tồn quỹ:{" "}
                <span className="font-semibold text-primary-700">
                  {formatVND(totalBalance)}
                </span>
              </span>
              <Button onClick={onCreate}>
                <FiPlus className="w-4 h-4 mr-1" /> Thêm quỹ
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">#</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Tên quỹ</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Loại</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-700">Số dư</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Người quản lý</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Trạng thái</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-700">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">
                      Chưa có dữ liệu
                    </td>
                  </tr>
                )}
                {filtered.map((quy, i) => {
                  const manager = state.nguoiDung.find((u) => u.id === quy.nguoiQuanLy);
                  return (
                    <tr key={quy.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3">{i + 1}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{quy.ten}</td>
                      <td className="px-4 py-3 text-gray-600">{LOAI_QUY_LABEL[quy.loai as LoaiQuy]}</td>
                      <td className="px-4 py-3 text-right font-semibold text-orange-600">
                        {formatVND(quy.soDu)}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{manager?.ten ?? "-"}</td>
                      <td className="px-4 py-3">
                        <Badge variant={quy.trangThai === "active" ? "success" : "default"}>
                          {quy.trangThai === "active" ? "Đang sử dụng" : "Ngưng"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => onEdit(quy)}
                          className="text-gray-500 hover:text-primary-600 mr-2"
                          title="Sửa"
                        >
                          <FiEdit2 className="w-4 h-4 inline" />
                        </button>
                        <button
                          onClick={() => onDelete(quy)}
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
        </>
      )}

      {activeTab === "hach-toan" && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Ngày</th>
                <th className="text-left px-4 py-3 font-medium">Số CT</th>
                <th className="text-left px-4 py-3 font-medium">Diễn giải</th>
                <th className="text-left px-4 py-3 font-medium">TK Nợ</th>
                <th className="text-left px-4 py-3 font-medium">TK Có</th>
                <th className="text-right px-4 py-3 font-medium">Số tiền</th>
              </tr>
            </thead>
            <tbody>
              {state.soCai
                .filter((b) => b.taiKhoanNo === "111" || b.taiKhoanNo === "112" || b.taiKhoanCo === "111" || b.taiKhoanCo === "112")
                .map((b) => (
                  <tr key={b.id} className="border-b border-gray-100">
                    <td className="px-4 py-3">{new Date(b.ngayGhiSo).toLocaleDateString("vi-VN")}</td>
                    <td className="px-4 py-3 font-medium">{b.soChungTu}</td>
                    <td className="px-4 py-3 text-gray-600">{b.dienGiai}</td>
                    <td className="px-4 py-3">{b.taiKhoanNo}</td>
                    <td className="px-4 py-3">{b.taiKhoanCo}</td>
                    <td className="px-4 py-3 text-right font-semibold">{formatVND(b.soTien)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      <QuyFormModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        editing={editing}
      />
    </div>
  );
}
