"use client";

import { formatVND } from "@/lib/utils";
import type { BoToan } from "@/services/finance/types";

interface Props {
  soCai: BoToan[];
}

export function HachToanQuyTab({ soCai }: Props) {
  const filtered = soCai.filter(
    (b) => ["111", "112"].includes(b.taiKhoanNo) || ["111", "112"].includes(b.taiKhoanCo),
  );

  return (
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
          {filtered.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center py-8 text-gray-500">
                Chưa có dữ liệu hạch toán
              </td>
            </tr>
          )}
          {filtered.map((b) => (
            <tr key={b.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="px-4 py-3">
                {new Date(b.ngayGhiSo).toLocaleDateString("vi-VN")}
              </td>
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
  );
}
