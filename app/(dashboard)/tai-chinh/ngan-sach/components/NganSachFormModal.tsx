"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";
import { useFinanceState, useFinanceStore } from "@/hooks/useFinanceStore";
import type { NganSach, TrangThaiNganSach } from "@/services/finance/types";
import { formatDateForInput } from "@/lib/utils";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editing: NganSach | null;
}

export function NganSachFormModal({ isOpen, onClose, editing }: Props) {
  const state = useFinanceState();
  const store = useFinanceStore();
  const toast = useToast();

  const [ten, setTen] = useState("");
  const [soTien, setSoTien] = useState(0);
  const [ngayBatDau, setNgayBatDau] = useState("");
  const [ngayKetThuc, setNgayKetThuc] = useState("");
  const [nguoiQuanLy, setNguoiQuanLy] = useState("");
  const [nguoiThamGia, setNguoiThamGia] = useState<string[]>([]);
  const [template, setTemplate] = useState(false);
  const [moTa, setMoTa] = useState("");
  const [trangThai, setTrangThai] = useState<TrangThaiNganSach>("active");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;
    if (editing) {
      setTen(editing.ten);
      setSoTien(editing.soTien);
      setNgayBatDau(formatDateForInput(editing.ngayBatDau));
      setNgayKetThuc(formatDateForInput(editing.ngayKetThuc));
      setNguoiQuanLy(editing.nguoiQuanLy);
      setNguoiThamGia(editing.nguoiThamGia);
      setTemplate(!!editing.template);
      setMoTa(editing.moTa ?? "");
      setTrangThai(editing.trangThai);
    } else {
      setTen("");
      setSoTien(0);
      setNgayBatDau(formatDateForInput(new Date()));
      const end = new Date();
      end.setMonth(end.getMonth() + 1);
      setNgayKetThuc(formatDateForInput(end));
      setNguoiQuanLy(state.nguoiDung[0]?.id ?? "");
      setNguoiThamGia([]);
      setTemplate(false);
      setMoTa("");
      setTrangThai("active");
    }
    setErrors({});
  }, [isOpen, editing, state.nguoiDung]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!ten.trim()) e.ten = "Vui lòng nhập tên ngân sách";
    if (soTien <= 0) e.soTien = "Số tiền phải lớn hơn 0";
    if (!ngayBatDau) e.ngayBatDau = "Vui lòng chọn ngày bắt đầu";
    if (!ngayKetThuc) e.ngayKetThuc = "Vui lòng chọn ngày kết thúc";
    if (ngayBatDau && ngayKetThuc && new Date(ngayKetThuc) <= new Date(ngayBatDau)) {
      e.ngayKetThuc = "Ngày kết thúc phải sau ngày bắt đầu";
    }
    if (!nguoiQuanLy) e.nguoiQuanLy = "Vui lòng chọn người quản lý";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = () => {
    if (!validate()) return;
    const payload = {
      ten,
      soTien,
      ngayBatDau,
      ngayKetThuc,
      nguoiQuanLy,
      nguoiThamGia,
      template,
      moTa: moTa || undefined,
      trangThai,
      createdBy: state.nguoiDung[0]?.id ?? "u1",
    };
    if (editing) {
      store.updateNganSach(editing.id, payload);
      toast.success("Cập nhật ngân sách thành công");
    } else {
      store.createNganSach(payload);
      toast.success("Tạo ngân sách thành công");
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editing ? "Cập nhật ngân sách" : "Thêm mới ngân sách"}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={onSubmit}>{editing ? "Cập nhật" : "Tạo mới"}</Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Tên ngân sách (*)"
          value={ten}
          onChange={(e) => setTen(e.target.value)}
          error={errors.ten}
        />
        <Input
          label="Số tiền (*)"
          type="number"
          value={soTien}
          onChange={(e) => setSoTien(Number(e.target.value))}
          error={errors.soTien}
        />
        <Input
          label="Ngày bắt đầu (*)"
          type="date"
          value={ngayBatDau}
          onChange={(e) => setNgayBatDau(e.target.value)}
          error={errors.ngayBatDau}
        />
        <Input
          label="Ngày kết thúc (*)"
          type="date"
          value={ngayKetThuc}
          onChange={(e) => setNgayKetThuc(e.target.value)}
          error={errors.ngayKetThuc}
        />
        <Select
          label="Người quản lý (*)"
          value={nguoiQuanLy}
          onChange={(e) => setNguoiQuanLy(e.target.value)}
          options={state.nguoiDung.map((u) => ({ value: u.id, label: u.ten }))}
          error={errors.nguoiQuanLy}
        />
        <Select
          label="Trạng thái"
          value={trangThai}
          onChange={(e) => setTrangThai(e.target.value as TrangThaiNganSach)}
          options={[
            { value: "active", label: "Đang sử dụng" },
            { value: "expired", label: "Hết hạn" },
            { value: "inactive", label: "Ngưng" },
          ]}
        />

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Người tham gia
          </label>
          <div className="border border-gray-300 rounded-lg p-2 max-h-32 overflow-y-auto space-y-1">
            {state.nguoiDung
              .filter((u) => u.id !== nguoiQuanLy)
              .map((u) => (
                <label key={u.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={nguoiThamGia.includes(u.id)}
                    onChange={(e) => {
                      if (e.target.checked) setNguoiThamGia([...nguoiThamGia, u.id]);
                      else setNguoiThamGia(nguoiThamGia.filter((id) => id !== u.id));
                    }}
                  />
                  {u.ten}
                </label>
              ))}
          </div>
        </div>

        <div className="col-span-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={template}
              onChange={(e) => setTemplate(e.target.checked)}
            />
            Tạo danh sách danh mục theo template
          </label>
        </div>

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
