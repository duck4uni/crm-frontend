"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/ToastProvider";
import { useFinanceState, useFinanceStore } from "@/hooks/useFinanceStore";
import {
  LOAI_YCCP_LABEL,
  TRANG_THAI_YCCP_LABEL,
  type YeuCauChiPhi,
  type TrangThaiYCCP,
  type LoaiYCCP,
} from "@/services/finance/types";
import { formatVND, formatDateVNDateOnly, formatDateVN } from "@/lib/utils";

interface Props {
  yccp: YeuCauChiPhi | null;
  onClose: () => void;
}

export function YccpDetailModal({ yccp, onClose }: Props) {
  const state = useFinanceState();
  const store = useFinanceStore();
  const toast = useToast();
  const router = useRouter();
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  if (!yccp) return null;

  const nguoiYC = state.nguoiDung.find((u) => u.id === yccp.nguoiYeuCauId);
  const nguoiPD = state.nguoiDung.find((u) => u.id === yccp.nguoiPheDuyetId);
  const me = state.nguoiDung[0]?.id ?? "u1";
  const canApprove = yccp.trangThai === "cho_xac_nhan" || yccp.trangThai === "dang_xu_ly";
  const canCancel = yccp.trangThai === "nhap" || yccp.trangThai === "cho_xac_nhan";
  const canCreatePhieuChi = yccp.trangThai === "cho_xuat_quy";

  const onApprove = () => {
    store.approveYCCP(yccp.id, me);
    toast.success("Đã phê duyệt yêu cầu");
    onClose();
  };

  const onReject = () => {
    if (!rejectReason.trim()) {
      toast.warning("Vui lòng nhập lý do từ chối");
      return;
    }
    store.rejectYCCP(yccp.id, me, rejectReason);
    toast.success("Đã từ chối yêu cầu");
    onClose();
  };

  const onCancel = () => {
    if (!confirm("Hủy yêu cầu này?")) return;
    store.cancelYCCP(yccp.id, me);
    toast.success("Đã hủy yêu cầu");
    onClose();
  };

  const onCreatePhieuChi = () => {
    onClose();
    router.push(`/tai-chinh/phieu-chi?from-yccp=${yccp.id}`);
  };

  return (
    <Modal
      isOpen={!!yccp}
      onClose={onClose}
      title={`Yêu cầu chi phí ${yccp.maYeuCau}`}
      size="xl"
      footer={
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
          {canCancel && (
            <Button variant="outline" onClick={onCancel}>
              Hủy yêu cầu
            </Button>
          )}
          {canApprove && (
            <>
              <Button
                variant="danger"
                onClick={() => setShowRejectInput(!showRejectInput)}
              >
                Từ chối
              </Button>
              <Button onClick={onApprove}>Phê duyệt</Button>
            </>
          )}
          {canCreatePhieuChi && <Button onClick={onCreatePhieuChi}>Tạo phiếu chi</Button>}
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Badge variant="info">{LOAI_YCCP_LABEL[yccp.loai as LoaiYCCP]}</Badge>
          <Badge>{TRANG_THAI_YCCP_LABEL[yccp.trangThai as TrangThaiYCCP]}</Badge>
        </div>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <Field label="Mã yêu cầu" value={yccp.maYeuCau} />
          <Field label="Ngày yêu cầu" value={formatDateVNDateOnly(yccp.ngayYeuCau)} />
          <Field label="Người yêu cầu" value={nguoiYC?.ten ?? "-"} />
          <Field label="Người phê duyệt" value={nguoiPD?.ten ?? "-"} />
          <Field label="Nội dung" value={yccp.noiDung} className="col-span-2" />
          <Field label="Lý do" value={yccp.lyDo} className="col-span-2" />
          <Field
            label="Tổng số tiền"
            value={
              <span className="text-lg font-bold text-orange-600">
                {formatVND(yccp.soTien)}
              </span>
            }
          />
          <Field label="Đã cấp" value={formatVND(yccp.daCap)} />
          {yccp.lyDoTuChoi && (
            <Field
              label="Lý do từ chối"
              value={<span className="text-red-600">{yccp.lyDoTuChoi}</span>}
              className="col-span-2"
            />
          )}
        </dl>

        <div>
          <h3 className="font-semibold text-sm mb-2">Danh sách nội dung chi</h3>
          <table className="w-full text-sm border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-3 py-2">Nội dung</th>
                <th className="text-right px-3 py-2">Số tiền</th>
              </tr>
            </thead>
            <tbody>
              {yccp.danhSachNoiDung.map((item) => (
                <tr key={item.id} className="border-t border-gray-100">
                  <td className="px-3 py-2">{item.noiDung}</td>
                  <td className="px-3 py-2 text-right">{formatVND(item.soTien)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <h3 className="font-semibold text-sm mb-2">Lịch sử xử lý</h3>
          <ol className="space-y-2">
            {yccp.lichSu.map((l, i) => {
              const u = state.nguoiDung.find((x) => x.id === l.nguoi);
              return (
                <li
                  key={i}
                  className="text-sm flex items-start gap-3 border-l-2 border-primary-300 pl-3"
                >
                  <div className="flex-1">
                    <div className="font-medium">{l.hanhDong}</div>
                    <div className="text-xs text-gray-500">
                      {u?.ten ?? l.nguoi} · {formatDateVN(l.thoiGian)}
                    </div>
                    {l.ghiChu && <div className="text-xs text-gray-600 mt-1">{l.ghiChu}</div>}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {showRejectInput && (
          <div className="border-t border-gray-200 pt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lý do từ chối
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            <div className="mt-2 flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowRejectInput(false)}>
                Hủy
              </Button>
              <Button variant="danger" size="sm" onClick={onReject}>
                Xác nhận từ chối
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

function Field({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-gray-500 text-xs">{label}</dt>
      <dd className="text-gray-900 mt-0.5">{value}</dd>
    </div>
  );
}
