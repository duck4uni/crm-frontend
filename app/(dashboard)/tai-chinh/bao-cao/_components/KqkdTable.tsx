"use client";

import { formatVND } from "@/lib/utils";
import type { KqkdRow } from "../_type";

const KQKD_DATA: KqkdRow[] = [
  { label: "Doanh thu bán hàng", current: 250_000_000, prev: 200_000_000 },
  { label: "Các khoản giảm trừ", current: 5_000_000, prev: 3_000_000 },
  { label: "Doanh thu thuần", current: 245_000_000, prev: 197_000_000 },
  { label: "Giá vốn hàng bán", current: 150_000_000, prev: 120_000_000 },
  { label: "Lợi nhuận gộp", current: 95_000_000, prev: 77_000_000 },
  { label: "Chi phí quản lý", current: 30_000_000, prev: 28_000_000 },
  { label: "Lợi nhuận thuần", current: 65_000_000, prev: 49_000_000 },
];

export function KqkdTable() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left px-4 py-3 font-medium">Chỉ tiêu</th>
            <th className="text-right px-4 py-3 font-medium">Kỳ này</th>
            <th className="text-right px-4 py-3 font-medium">Kỳ trước</th>
          </tr>
        </thead>
        <tbody>
          {KQKD_DATA.map((row, i) => (
            <tr key={i} className="border-t border-gray-100">
              <td className="px-4 py-3">{row.label}</td>
              <td className="px-4 py-3 text-right">{formatVND(row.current)}</td>
              <td className="px-4 py-3 text-right text-gray-600">{formatVND(row.prev)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
