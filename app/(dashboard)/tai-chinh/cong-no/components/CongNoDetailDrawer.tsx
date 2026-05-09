"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useFinanceState } from "@/hooks/useFinanceStore";
import type { KhachHangCongNo } from "@/services/finance/types";
import { formatVND, formatDateVNDateOnly } from "@/lib/utils";

interface Props {
  kh: KhachHangCongNo | null;
  onClose: () => void;
}

const SUB_TABS = [
  { id: "chi-tiet", label: "Chi tiết công nợ" },
  { id: "don-hang", label: "Đơn hàng" },
  { id: "lich-su", label: "Lịch sử" },
];

export function CongNoDetailDrawer({ kh, onClose }: Props) {
  const state = useFinanceState();
  const [tab, setTab] = useState("chi-tiet");
  if (!kh) return null;

  const phieuThuLienQuan = state.phieuThu.filter((p) => p.khachHangId === kh.id);
  const phieuChiLienQuan = state.phieuChi.filter(
    (p) => p.doiTuongId === kh.id && p.doiTuongLoai === "khach_hang",
  );
  const lichSu = [...phieuThuLienQuan, ...phieuChiLienQuan].sort(
    (a, b) => +new Date(b.ngayYeuCau) - +new Date(a.ngayYeuCau),
  );

  return (
    <Modal
      isOpen={!!kh}
      onClose={onClose}
      title={`Chi tiết công nợ — ${kh.ten}`}
      size="2xl"
      footer={<Button variant="outline" onClick={onClose}>Đóng</Button>}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="text-xs text-gray-600">1. Công nợ hiện tại</div>
            <div className="text-xl font-bold text-orange-600 mt-1">
              {formatVND(kh.phaiThu - kh.phaiTra)}
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-xs text-gray-600">2. Công nợ phải thu</div>
            <div className="text-xl font-bold text-blue-600 mt-1">
              {formatVND(kh.phaiThu)}
            </div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-xs text-gray-600">3. Công nợ phải trả</div>
            <div className="text-xl font-bold text-gray-700 mt-1">
              {formatVND(kh.phaiTra)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 border-b border-gray-200">
          {SUB_TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`py-2 px-4 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === t.id
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-gray-600"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "chi-tiet" && (
          <table className="w-full text-sm border border-gray-200 rounded">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-3 py-2">Ngày</th>
                <th className="text-left px-3 py-2">Số CT</th>
                <th className="text-left px-3 py-2">Diễn giải</th>
                <th className="text-right px-3 py-2">Phát sinh nợ</th>
                <th className="text-right px-3 py-2">Phát sinh có</th>
              </tr>
            </thead>
            <tbody>
              {phieuThuLienQuan.length === 0 && phieuChiLienQuan.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-500">
                    Chưa có phát sinh
                  </td>
                </tr>
              )}
              {phieuThuLienQuan.map((p) => (
                <tr key={p.id} className="border-t border-gray-100">
                  <td className="px-3 py-2">{formatDateVNDateOnly(p.ngayYeuCau)}</td>
                  <td className="px-3 py-2 font-medium">{p.soChungTu}</td>
                  <td className="px-3 py-2">Thu tiền - {p.noiDung}</td>
                  <td className="px-3 py-2 text-right">-</td>
                  <td className="px-3 py-2 text-right text-green-600">
                    {formatVND(p.soTien)}
                  </td>
                </tr>
              ))}
              {phieuChiLienQuan.map((p) => (
                <tr key={p.id} className="border-t border-gray-100">
                  <td className="px-3 py-2">{formatDateVNDateOnly(p.ngayYeuCau)}</td>
                  <td className="px-3 py-2 font-medium">{p.soChungTu}</td>
                  <td className="px-3 py-2">Chi tiền - {p.noiDung}</td>
                  <td className="px-3 py-2 text-right text-orange-600">
                    {formatVND(p.soTien)}
                  </td>
                  <td className="px-3 py-2 text-right">-</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === "don-hang" && (
          <div className="text-center text-gray-500 py-8">
            Chưa kết nối module đơn hàng (mock data).
          </div>
        )}

        {tab === "lich-su" && (
          <ol className="space-y-2">
            {lichSu.length === 0 && (
              <p className="text-center text-gray-500 py-6">Chưa có lịch sử</p>
            )}
            {lichSu.map((p) => (
              <li
                key={p.id}
                className="text-sm flex items-center gap-3 border-l-2 border-primary-300 pl-3 py-1"
              >
                <span className="font-medium">{p.soChungTu}</span>
                <span className="text-gray-500">
                  {formatDateVNDateOnly(p.ngayYeuCau)} ·{" "}
                  {"khachHangId" in p ? "Thu" : "Chi"} {formatVND(p.soTien)}
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </Modal>
  );
}
