"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatVND, formatDateVNDateOnly } from "@/lib/utils";
import { FiEye, FiEdit2, FiPlus } from "react-icons/fi";
import type { PhieuThu, Quy } from "@/services/finance/types";

interface Props {
  phieuThu: PhieuThu[];
  quyList: Quy[];
  onCreate: () => void;
  onEdit: (p: PhieuThu) => void;
  onView: (p: PhieuThu) => void;
}

export function PhieuThuTab({ phieuThu, quyList, onCreate, onEdit, onView }: Props) {
  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={onCreate}>
          <FiPlus className="w-4 h-4 mr-1" /> Tạo phiếu thu
        </Button>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Số CT</th>
              <th className="text-left px-4 py-3 font-medium">Ngày</th>
              <th className="text-left px-4 py-3 font-medium">Nội dung</th>
              <th className="text-left px-4 py-3 font-medium">Quỹ</th>
              <th className="text-right px-4 py-3 font-medium">Số tiền</th>
              <th className="text-left px-4 py-3 font-medium">Trạng thái</th>
              <th className="text-right px-4 py-3 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {phieuThu.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">
                  Chưa có phiếu thu
                </td>
              </tr>
            )}
            {phieuThu.map((p) => {
              const quy = quyList.find((q) => q.id === p.quyId);
              return (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-primary-700">{p.soChungTu}</td>
                  <td className="px-4 py-3">{formatDateVNDateOnly(p.ngayYeuCau)}</td>
                  <td className="px-4 py-3">{p.noiDung}</td>
                  <td className="px-4 py-3 text-gray-600">{quy?.ten ?? "-"}</td>
                  <td className="px-4 py-3 text-right font-semibold text-green-600">
                    {formatVND(p.soTien)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="success">Đã thu</Badge>
                  </td>
                  <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                    <button
                      onClick={() => onView(p)}
                      className="text-gray-500 hover:text-primary-600"
                      title="Xem"
                    >
                      <FiEye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(p)}
                      className="text-gray-500 hover:text-primary-600"
                      title="Sửa"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
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
