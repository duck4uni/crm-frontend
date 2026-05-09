"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";
import { useFinanceState, useFinanceStore } from "@/hooks/useFinanceStore";
import { type PhieuChi, type NguonChi } from "@/services/finance/types";
import { formatDateForInput, formatVND } from "@/lib/utils";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editing: PhieuChi | null;
  prefillYccpId?: string | null;
}

const NGUON_CHI_OPTIONS: { value: NguonChi; label: string; sub?: string }[] = [
  { value: "tu_nhap", label: "Tự chi" },
  { value: "don_hang", label: "Đơn nhập hàng" },
  { value: "yccp", label: "YCCP", sub: "(T.toán, Tạm ứng, Hoàn ứng)" },
  { value: "hoan_tien", label: "Chi tiền trả khách hàng qua đơn hàng" },
];

export function PhieuChiFormModal({ isOpen, onClose, editing, prefillYccpId }: Props) {
  const state = useFinanceState();
  const store = useFinanceStore();
  const toast = useToast();

  const [noiDung, setNoiDung] = useState("");
  const [ngayYeuCau, setNgayYeuCau] = useState(formatDateForInput(new Date()));
  const [quyId, setQuyId] = useState("");
  const [hinhThuc, setHinhThuc] = useState<"tien_mat" | "chuyen_khoan" | "khac">("tien_mat");
  const [moTa, setMoTa] = useState("");
  const [nguon, setNguon] = useState<NguonChi>("tu_nhap");
  const [yccpId, setYccpId] = useState("");
  const [doiTuongId, setDoiTuongId] = useState("");
  const [doiTuongTen, setDoiTuongTen] = useState("");
  const [soTien, setSoTien] = useState(0);
  const [nguoiTiepNhan, setNguoiTiepNhan] = useState("");
  const [nganSach, setNganSach] = useState(false);
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
      setYccpId(editing.yccpId ?? "");
      setDoiTuongId(editing.doiTuongId ?? "");
      setDoiTuongTen(editing.doiTuongTen ?? "");
      setSoTien(editing.soTien);
      setNguoiTiepNhan("");
      setNganSach(false);
      setTkNo("");
      setTkCo("");
      setShowHachToan(false);
    } else {
      setNoiDung("");
      setNgayYeuCau(formatDateForInput(new Date()));
      setQuyId(state.quy[0]?.id ?? "");
      setHinhThuc("tien_mat");
      setMoTa("");
      setNguon(prefillYccpId ? "yccp" : "tu_nhap");
      setYccpId(prefillYccpId ?? "");
      setDoiTuongId("");
      setDoiTuongTen("");
      setSoTien(0);
      setNguoiTiepNhan("");
      setNganSach(false);
      setTkNo("");
      setTkCo("");
      setShowHachToan(false);
      if (prefillYccpId) {
        const y = state.yccp.find((x) => x.id === prefillYccpId);
        if (y) { setNoiDung(y.noiDung); setSoTien(y.soTien); }
      }
    }
    setErrors({});
  }, [isOpen, editing, state.quy, state.yccp, prefillYccpId]);

  // Auto-fill khi chọn YCCP
  useEffect(() => {
    if (nguon === "yccp" && yccpId && !editing) {
      const y = state.yccp.find((x) => x.id === yccpId);
      if (y) { setNoiDung(y.noiDung); setSoTien(y.soTien - y.daCap); }
    }
  }, [yccpId, nguon, state.yccp, editing]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!noiDung.trim()) e.noiDung = "Vui lòng nhập nội dung";
    if (!ngayYeuCau) e.ngayYeuCau = "Vui lòng chọn ngày";
    if (!quyId) e.quyId = "Vui lòng chọn quỹ";
    if (soTien <= 0) e.soTien = "Số tiền phải lớn hơn 0";
    if (nguon === "yccp" && !yccpId) e.yccpId = "Vui lòng chọn YCCP";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = () => {
    if (!validate()) return;
    const quy = state.quy.find((q) => q.id === quyId);
    if (quy && quy.soDu < soTien) {
      toast.warning(
        "Số dư quỹ không đủ",
        `Quỹ ${quy.ten} có ${formatVND(quy.soDu)}, không đủ chi ${formatVND(soTien)}`,
      );
    }
    const payload = {
      noiDung,
      ngayYeuCau,
      quyId,
      hinhThucThanhToan: hinhThuc,
      moTa: moTa || undefined,
      nguon,
      yccpId: nguon === "yccp" ? yccpId || undefined : undefined,
      doiTuongLoai: doiTuongId ? ("khach_hang" as const) : undefined,
      doiTuongId: doiTuongId || undefined,
      doiTuongTen: doiTuongTen || undefined,
      soTien,
      hachToan: showHachToan && tkNo && tkCo ? { taiKhoanNo: tkNo, taiKhoanCo: tkCo, soTien } : undefined,
      nguoiTao: state.nguoiDung[0]?.id ?? "u1",
    };
    if (editing) {
      store.updatePhieuChi(editing.id, payload);
      toast.success("Cập nhật phiếu chi thành công");
    } else {
      const created = store.createPhieuChi(payload);
      toast.success("Tạo phiếu chi thành công", `Số CT: ${created.soChungTu}`);
    }
    onClose();
  };

  const yccpOptions = state.yccp
    .filter((y) => y.trangThai === "cho_xuat_quy" || y.id === yccpId)
    .map((y) => ({
      value: y.id,
      label: `${y.maYeuCau} - ${y.noiDung} (${formatVND(y.soTien)})`,
    }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editing ? "Cập nhật phiếu chi" : "Tạo phiếu chi"}
      size="2xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Quay lại</Button>
          <Button onClick={onSubmit}>{editing ? "Cập nhật" : "Thêm mới"}</Button>
        </>
      }
    >
      {/* Section header */}
      <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5 mb-5">
        <svg className="w-4 h-4 text-blue-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <span className="text-xs font-semibold text-blue-700 tracking-wide uppercase">Thông tin phiếu</span>
      </div>

      <div className="grid grid-cols-2 gap-x-5 gap-y-4">
        {/* Row 1: Nội dung + Ngày yêu cầu */}
        <Input
          label="Nội dung chi (*)"
          value={noiDung}
          onChange={(e) => setNoiDung(e.target.value)}
          error={errors.noiDung}
          placeholder="Nhập nội dung chi"
        />
        <Input
          label="Ngày yêu cầu (*)"
          type="datetime-local"
          value={ngayYeuCau}
          onChange={(e) => setNgayYeuCau(e.target.value)}
          error={errors.ngayYeuCau}
        />

        {/* Row 2: Quỹ + Ngày chứng từ */}
        <Select
          label="Quỹ (*)"
          value={quyId}
          onChange={(e) => setQuyId(e.target.value)}
          options={state.quy.map((q) => ({ value: q.id, label: q.ten }))}
          error={errors.quyId}
        />
        <Input
          label="Ngày chứng từ"
          value={ngayYeuCau ? ngayYeuCau.slice(0, 10) : ""}
          disabled
          className="bg-gray-50 text-gray-500"
          onChange={() => {}}
        />

        {/* Row 3: Hình thức thanh toán + Số chứng từ */}
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
        <Input
          label="Số chứng từ"
          value={editing?.soChungTu ?? "(Tự động)"}
          disabled
          className="bg-gray-50 text-gray-500"
          onChange={() => {}}
        />

        {/* Mô tả */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
          <textarea
            value={moTa}
            onChange={(e) => setMoTa(e.target.value)}
            rows={2}
            placeholder="Nhập mô tả thêm (tuỳ chọn)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
        </div>

        {/* Nguồn */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nguồn <span className="text-red-500">(*)</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {NGUON_CHI_OPTIONS.map((opt) => (
              <label key={opt.value} className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="radio"
                  name="nguon-chi"
                  checked={nguon === opt.value}
                  onChange={() => setNguon(opt.value)}
                  className="accent-primary-600 w-4 h-4 mt-0.5 shrink-0"
                />
                <span className="text-sm text-gray-700">
                  {opt.label}
                  {opt.sub && (
                    <span className="text-gray-400 ml-1">{opt.sub}</span>
                  )}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* YCCP selector (chỉ hiện khi nguon = yccp) */}
        {nguon === "yccp" && (
          <div className="col-span-2">
            <Select
              label="Yêu cầu chi phí (*)"
              value={yccpId}
              onChange={(e) => setYccpId(e.target.value)}
              options={yccpOptions}
              placeholder="Chọn YCCP đã duyệt"
              error={errors.yccpId}
            />
          </div>
        )}

        {/* Khách hàng nhận tiền */}
        <div className="col-span-2">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">Khách hàng nhận tiền</label>
            <button type="button" className="text-xs text-orange-500 font-medium hover:underline">
              Thêm nhanh khách hàng
            </button>
          </div>
          <Select
            value={doiTuongId}
            onChange={(e) => {
              const id = e.target.value;
              setDoiTuongId(id);
              const kh = state.congNo.find((k) => k.id === id);
              setDoiTuongTen(kh?.ten ?? "");
            }}
            options={state.congNo.map((kh) => ({
              value: kh.id,
              label: `${kh.ten}${kh.phaiTra > 0 ? ` (Phải trả ${kh.phaiTra.toLocaleString("vi-VN")} ₫)` : ""}`,
            }))}
            placeholder="Vui lòng nhập và ấn enter"
          />
        </div>

        {/* Số tiền */}
        <div className="col-span-2">
          <Input
            label="Số tiền (*)"
            type="number"
            value={soTien}
            onChange={(e) => setSoTien(Number(e.target.value))}
            error={errors.soTien}
            placeholder="0.00"
          />
        </div>

        {/* Ngân Sách checkbox */}
        <div className="col-span-2">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={nganSach}
              onChange={(e) => setNganSach(e.target.checked)}
              className="w-4 h-4 accent-primary-600 rounded"
            />
            <span className="text-sm text-gray-700">Ngân Sách</span>
          </label>
        </div>

        {/* Người tiếp nhận */}
        <div className="col-span-2">
          <Input
            label="Người tiếp nhận"
            value={nguoiTiepNhan}
            onChange={(e) => setNguoiTiepNhan(e.target.value)}
            placeholder=""
          />
        </div>

        {/* File upload */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Tải chứng từ</label>
          <label className="flex items-center gap-3 w-fit border border-gray-300 rounded-lg px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="w-9 h-9 bg-gray-100 rounded-md flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <span className="text-sm text-gray-500">Kéo thả tệp tại đây</span>
            <input type="file" className="hidden" multiple />
          </label>
        </div>

        {/* Hạch toán */}
        <div className="col-span-2 border-t border-gray-100 pt-3">
          <p className="text-sm font-medium text-gray-700 mb-1">Thông tin hạch toán</p>
          <button
            type="button"
            onClick={() => setShowHachToan(!showHachToan)}
            className="text-sm text-primary-600 hover:underline"
          >
            {showHachToan ? "− Ẩn hạch toán" : "+ Thêm hạch toán"}
          </button>
          {showHachToan && (
            <div className="grid grid-cols-2 gap-4 mt-3">
              <Input
                label="Tài khoản Nợ"
                value={tkNo}
                onChange={(e) => setTkNo(e.target.value)}
                placeholder="VD: 331"
              />
              <Input
                label="Tài khoản Có"
                value={tkCo}
                onChange={(e) => setTkCo(e.target.value)}
                placeholder="VD: 111"
              />
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
