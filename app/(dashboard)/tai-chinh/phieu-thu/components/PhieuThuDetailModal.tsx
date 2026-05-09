"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useFinanceState } from "@/hooks/useFinanceStore";
import {
  NGUON_THU_LABEL,
  HINH_THUC_THANH_TOAN_LABEL,
  type PhieuThu,
  type NguonThu,
} from "@/services/finance/types";
import { formatVND, formatDateVNDateOnly } from "@/lib/utils";

interface Props {
  phieu: PhieuThu | null;
  onClose: () => void;
}

export function PhieuThuDetailModal({ phieu, onClose }: Props) {
  const state = useFinanceState();
  if (!phieu) return null;
  const quy = state.quy.find((q) => q.id === phieu.quyId);
  const kh = state.congNo.find((k) => k.id === phieu.khachHangId);
  const nguoi = state.nguoiDung.find((u) => u.id === phieu.nguoiTao);

  return (
    <Modal
      isOpen={!!phieu}
      onClose={onClose}
      title={`Phiếu thu ${phieu.soChungTu}`}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
          <Button onClick={() => window.print()}>In phiếu</Button>
        </>
      }
    >
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
        <Field label="Số chứng từ" value={phieu.soChungTu} />
        <Field label="Ngày" value={formatDateVNDateOnly(phieu.ngayYeuCau)} />
        <Field label="Nội dung" value={phieu.noiDung} className="col-span-2" />
        <Field label="Quỹ nhận" value={quy?.ten ?? "-"} />
        <Field
          label="Hình thức thanh toán"
          value={HINH_THUC_THANH_TOAN_LABEL[phieu.hinhThucThanhToan] ?? "-"}
        />
        <Field label="Nguồn" value={NGUON_THU_LABEL[phieu.nguon as NguonThu]} />
        <Field label="Khách hàng" value={kh?.ten ?? "-"} />
        <Field label="Người nộp tiền" value={phieu.nguoiNopTien ?? "-"} />
        <Field label="Người tạo" value={nguoi?.ten ?? "-"} />
        <Field
          label="Số tiền"
          value={
            <span className="text-lg font-bold text-orange-600">
              {formatVND(phieu.soTien)}
            </span>
          }
          className="col-span-2"
        />
        {phieu.moTa && <Field label="Mô tả" value={phieu.moTa} className="col-span-2" />}
        {phieu.hachToan && (
          <Field
            label="Hạch toán"
            value={`Nợ ${phieu.hachToan.taiKhoanNo} / Có ${phieu.hachToan.taiKhoanCo}`}
            className="col-span-2"
          />
        )}
      </dl>
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
