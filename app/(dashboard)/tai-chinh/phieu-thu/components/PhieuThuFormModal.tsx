"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";
import { useFinanceState, useFinanceStore } from "@/hooks/useFinanceStore";
import {
  NGUON_THU_LABEL,
  type PhieuThu,
  type NguonThu,
} from "@/services/finance/types";
import { formatDateForInput } from "@/lib/utils";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editing: PhieuThu | null;
}

export function PhieuThuFormModal({ isOpen, onClose, editing }: Props) {
  const state = useFinanceState();
  const store = useFinanceStore();
  const toast = useToast();

  const [noiDung, setNoiDung] = useState("");
  const [ngayYeuCau, setNgayYeuCau] = useState(formatDateForInput(new Date()));
  const [quyId, setQuyId] = useState("");
  const [hinhThuc, setHinhThuc] = useState<"tien_mat" | "chuyen_khoan" | "khac">("tien_mat");
  const [moTa, setMoTa] = useState("");
  const [nguon, setNguon] = useState<NguonThu>("tu_nhap");
  const [khachHangId, setKhachHangId] = useState("");
  const [soTien, setSoTien] = useState(0);
  const [nguoiNopTien, setNguoiNopTien] = useState("");
  const [tkNo, setTkNo] = useState("");
  const [tkCo, setTkCo] = useState("");
  const [showHachToan, setShowHachToan] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;
    if (editing) {
      setNoiDung(editing.noiDung);
      setNgayYeuCau(formatDateForInput(editing.ngayYeuCau));
      setQuyId(editing.quyId);
      setHinhThuc(editing.hinhThucThanhToan);
      setMoTa(editing.moTa ?? "");
      setNguon(editing.nguon);
      setKhachHangId(editing.khachHangId ?? "");
      setSoTien(editing.soTien);
      setNguoiNopTien(editing.nguoiNopTien ?? "");
      setTkNo(editing.hachToan?.taiKhoanNo ?? "");
      setTkCo(editing.hachToan?.taiKhoanCo ?? "");
      setShowHachToan(!!editing.hachToan);
    } else {
      setNoiDung("");
      setNgayYeuCau(formatDateForInput(new Date()));
      setQuyId(state.quy[0]?.id ?? "");
      setHinhThuc("tien_mat");
      setMoTa("");
      setNguon("tu_nhap");
      setKhachHangId("");
      setSoTien(0);
      setNguoiNopTien("");
      setTkNo("");
      setTkCo("");
      setShowHachToan(false);
    }
    setErrors({});
  }, [isOpen, editing, state.quy]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!noiDung.trim()) e.noiDung = "Vui lòng nhập nội dung";
    if (!ngayYeuCau) e.ngayYeuCau = "Vui lòng chọn ngày";
    if (!quyId) e.quyId = "Vui lòng chọn quỹ";
    if (soTien <= 0) e.soTien = "Số tiền phải lớn hơn 0";
    if (nguon === "thu_khach_hang" && !khachHangId)
      e.khachHangId = "Vui lòng chọn khách hàng";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = () => {
    if (!validate()) return;
    const payload = {
      noiDung,
      ngayYeuCau,
      quyId,
      hinhThucThanhToan: hinhThuc,
      moTa: moTa || undefined,
      nguon,
      khachHangId: khachHangId || undefined,
      soTien,
      nguoiNopTien: nguoiNopTien || undefined,
      hachToan:
        showHachToan && tkNo && tkCo
          ? { taiKhoanNo: tkNo, taiKhoanCo: tkCo, soTien }
          : undefined,
      nguoiTao: state.nguoiDung[0]?.id ?? "u1",
    };
    if (editing) {
      store.updatePhieuThu(editing.id, payload);
      toast.success("Cập nhật phiếu thu thành công");
    } else {
      const created = store.createPhieuThu(payload);
      toast.success("Tạo phiếu thu thành công", `Số CT: ${created.soChungTu}`);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editing ? "Cập nhật phiếu thu" : "Tạo phiếu thu"}
      size="xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Quay lại
          </Button>
          <Button onClick={onSubmit}>{editing ? "Cập nhật" : "Thêm mới"}</Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Nội dung thu (*)"
          value={noiDung}
          onChange={(e) => setNoiDung(e.target.value)}
          error={errors.noiDung}
        />
        <Input
          label="Ngày yêu cầu (*)"
          type="date"
          value={ngayYeuCau}
          onChange={(e) => setNgayYeuCau(e.target.value)}
          error={errors.ngayYeuCau}
        />
        <Select
          label="Quỹ (*)"
          value={quyId}
          onChange={(e) => setQuyId(e.target.value)}
          options={state.quy.map((q) => ({ value: q.id, label: q.ten }))}
          error={errors.quyId}
        />
        <Select
          label="Hình thức thanh toán"
          value={hinhThuc}
          onChange={(e) => setHinhThuc(e.target.value as typeof hinhThuc)}
          options={[
            { value: "tien_mat", label: "Tiền mặt" },
            { value: "chuyen_khoan", label: "Chuyển khoản" },
            { value: "khac", label: "Khác" },
          ]}
        />
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
          <textarea
            value={moTa}
            onChange={(e) => setMoTa(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Nguồn (*)</label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.entries(NGUON_THU_LABEL) as [NguonThu, string][]).map(([v, l]) => (
              <label key={v} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="nguon"
                  checked={nguon === v}
                  onChange={() => setNguon(v)}
                />
                <span className="text-sm">{l}</span>
              </label>
            ))}
          </div>
        </div>

        {(nguon === "thu_khach_hang" || nguon === "don_hang_ban") && (
          <div className="col-span-2">
            <Select
              label={`Khách hàng nộp tiền${nguon === "thu_khach_hang" ? " (*)" : ""}`}
              value={khachHangId}
              onChange={(e) => setKhachHangId(e.target.value)}
              options={state.congNo.map((kh) => ({
                value: kh.id,
                label: `${kh.ten}${kh.phaiThu > 0 ? ` (Nợ ${kh.phaiThu.toLocaleString("vi-VN")} ₫)` : ""}`,
              }))}
              placeholder="Chọn khách hàng"
              error={errors.khachHangId}
            />
          </div>
        )}

        <Input
          label="Số tiền (*)"
          type="number"
          value={soTien}
          onChange={(e) => setSoTien(Number(e.target.value))}
          error={errors.soTien}
        />
        <Input
          label="Người nộp tiền"
          value={nguoiNopTien}
          onChange={(e) => setNguoiNopTien(e.target.value)}
        />

        <div className="col-span-2">
          <button
            type="button"
            onClick={() => setShowHachToan(!showHachToan)}
            className="text-sm text-primary-600 hover:underline"
          >
            {showHachToan ? "− Ẩn" : "+ Thêm"} thông tin hạch toán
          </button>
          {showHachToan && (
            <div className="grid grid-cols-2 gap-4 mt-3">
              <Input
                label="Tài khoản Nợ"
                value={tkNo}
                onChange={(e) => setTkNo(e.target.value)}
                placeholder="VD: 111"
              />
              <Input
                label="Tài khoản Có"
                value={tkCo}
                onChange={(e) => setTkCo(e.target.value)}
                placeholder="VD: 131"
              />
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
