"use client";

import { formatVND } from "@/lib/utils";
import type { BalanceRow } from "../_type";

interface Props {
  rows: BalanceRow[];
  onDrillDown: (taiKhoan: string) => void;
}

export function BalanceSheetTable({ rows, onDrillDown }: Props) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th rowSpan={2} className="text-left px-4 py-3 font-medium align-bottom">
              Số hiệu TK
            </th>
            <th rowSpan={2} className="text-left px-4 py-3 font-medium align-bottom">
              Tên tài khoản
            </th>
            <th colSpan={2} className="text-center px-4 py-2 font-medium border-b">
              Số dư đầu kỳ
            </th>
            <th colSpan={2} className="text-center px-4 py-2 font-medium border-b">
              Phát sinh trong kỳ
            </th>
            <th colSpan={2} className="text-center px-4 py-2 font-medium border-b">
              Số dư cuối kỳ
            </th>
          </tr>
          <tr className="border-b">
            <th className="text-right px-4 py-2 font-medium text-xs">Nợ</th>
            <th className="text-right px-4 py-2 font-medium text-xs">Có</th>
            <th className="text-right px-4 py-2 font-medium text-xs">Nợ</th>
            <th className="text-right px-4 py-2 font-medium text-xs">Có</th>
            <th className="text-right px-4 py-2 font-medium text-xs">Nợ</th>
            <th className="text-right px-4 py-2 font-medium text-xs">Có</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.taiKhoan}
              onClick={() => onDrillDown(r.taiKhoan)}
              className="border-b border-gray-100 hover:bg-primary-50 cursor-pointer"
            >
              <td className="px-4 py-3 font-medium text-primary-700">{r.taiKhoan}</td>
              <td className="px-4 py-3">{r.ten}</td>
              <td className="px-4 py-3 text-right">{formatVND(r.duDauNo)}</td>
              <td className="px-4 py-3 text-right">{formatVND(r.duDauCo)}</td>
              <td className="px-4 py-3 text-right">{formatVND(r.psNo)}</td>
              <td className="px-4 py-3 text-right">{formatVND(r.psCo)}</td>
              <td className="px-4 py-3 text-right font-semibold">
                {formatVND(r.duCuoiNo)}
              </td>
              <td className="px-4 py-3 text-right">{formatVND(r.duCuoiCo)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
