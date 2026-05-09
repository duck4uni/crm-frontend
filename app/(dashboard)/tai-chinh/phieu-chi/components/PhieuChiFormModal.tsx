"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";
import { useFinanceState, useFinanceStore } from "@/hooks/useFinanceStore";
import {
  NGUON_CHI_LABEL,
  type PhieuChi,
  type NguonChi,
} from "@/services/finance/types";
import { formatDateForInput, formatVND } from "@/lib/utils";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editing: PhieuChi | null;
  prefillYccpId?: string | null;
}

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
  const [doiTuongLoai, setDoiTuongLoai] = useState<"nhan_vien" | "khach_hang" | "ncc" | "khac">("ncc");
  const [doiTuongTen, setDoiTuongTen] = useState("");
  const [doiTuongId, setDoiTuongId] = useState("");
  const [soTien, setSoTien] = useState(0);
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
      setDoiTuongLoai(editing.doiTuongLoai ?? "ncc");
      setDoiTuongTen(editing.doiTuongTen ?? "");
      setDoiTuongId(editing.doiTuongId ?? "");
      setSoTien(editing.soTien);
    } else {
      setNoiDung("");
      setNgayYeuCau(formatDateForInput(new Date()));
      setQuyId(state.quy[0]?.id ?? "");
      setHinhThuc("tien_mat");
      setMoTa("");
      setNguon(prefillYccpId ? "yccp" : "tu_nhap");
      setYccpId(prefillYccpId ?? "");
      setDoiTuongLoai("ncc");
      setDoiTuongTen("");
      setDoiTuongId("");
      setSoTien(0);
      if (prefillYccpId) {
        const y = state.yccp.find((y) => y.id === prefillYccpId);
        if (y) {
          setNoiDung(y.noiDung);
          setSoTien(y.soTien);
        }
      }
    }
    setErrors({});
  }, [isOpen, editing, state.quy, state.yccp, prefillYccpId]);

  // Auto-fill số tiền khi chọn YCCP
  useEffect(() => {
    if (nguon === "yccp" && yccpId) {
      const y = state.yccp.find((y) => y.id === yccpId);
      if (y && !editing) {
        setNoiDung(y.noiDung);
        setSoTien(y.soTien - y.daCap);
      }
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
      doiTuongLoai: doiTuongTen ? doiTuongLoai : undefined,
      doiTuongId: doiTuongId || undefined,
      doiTuongTen: doiTuongTen || undefined,
      soTien,
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
          label="Nội dung chi (*)"
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
          label="Quỹ chi (*)"
          value={quyId}
          onChange={(e) => setQuyId(e.target.value)}
          options={state.quy.map((q) => ({
            value: q.id,
            label: `${q.ten} (${formatVND(q.soDu)})`,
          }))}
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Nguồn (*)</label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.entries(NGUON_CHI_LABEL) as [NguonChi, string][]).map(([v, l]) => (
              <label key={v} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="nguon-chi"
                  checked={nguon === v}
                  onChange={() => setNguon(v)}
                />
                <span className="text-sm">{l}</span>
              </label>
            ))}
          </div>
        </div>

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

        <Select
          label="Loại đối tượng"
          value={doiTuongLoai}
          onChange={(e) => setDoiTuongLoai(e.target.value as typeof doiTuongLoai)}
          options={[
            { value: "nhan_vien", label: "Nhân viên" },
            { value: "khach_hang", label: "Khách hàng" },
            { value: "ncc", label: "Nhà cung cấp" },
            { value: "khac", label: "Khác" },
          ]}
        />
        {doiTuongLoai === "khach_hang" ? (
          <Select
            label="Khách hàng"
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
            placeholder="Chọn khách hàng"
          />
        ) : (
          <Input
            label="Tên đối tượng"
            value={doiTuongTen}
            onChange={(e) => setDoiTuongTen(e.target.value)}
          />
        )}

        <Input
          label="Số tiền (*)"
          type="number"
          value={soTien}
          onChange={(e) => setSoTien(Number(e.target.value))}
          error={errors.soTien}
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
      </div>
    </Modal>
  );
}
