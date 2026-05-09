"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";
import { useFinanceState, useFinanceStore } from "@/hooks/useFinanceStore";
import type { Quy, LoaiQuy, TrangThaiQuy } from "@/services/finance/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editing: Quy | null;
}

export function QuyFormModal({ isOpen, onClose, editing }: Props) {
  const store = useFinanceStore();
  const state = useFinanceState();
  const toast = useToast();
  const [ten, setTen] = useState("");
  const [loai, setLoai] = useState<LoaiQuy>("tien_mat");
  const [soDu, setSoDu] = useState(0);
  const [nguoiQuanLy, setNguoiQuanLy] = useState("");
  const [moTa, setMoTa] = useState("");
  const [trangThai, setTrangThai] = useState<TrangThaiQuy>("active");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;
    if (editing) {
      setTen(editing.ten);
      setLoai(editing.loai);
      setSoDu(editing.soDu);
      setNguoiQuanLy(editing.nguoiQuanLy);
      setMoTa(editing.moTa ?? "");
      setTrangThai(editing.trangThai);
    } else {
      setTen("");
      setLoai("tien_mat");
      setSoDu(0);
      setNguoiQuanLy(state.nguoiDung[0]?.id ?? "");
      setMoTa("");
      setTrangThai("active");
    }
    setErrors({});
  }, [isOpen, editing, state.nguoiDung]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!ten.trim()) e.ten = "Vui lòng nhập tên quỹ";
    if (!nguoiQuanLy) e.nguoiQuanLy = "Vui lòng chọn người quản lý";
    if (soDu < 0) e.soDu = "Số dư không hợp lệ";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = () => {
    if (!validate()) return;
    if (editing) {
      store.updateQuy(editing.id, { ten, loai, nguoiQuanLy, moTa, trangThai });
      toast.success("Cập nhật quỹ thành công");
    } else {
      store.createQuy({ ten, loai, soDu, nguoiQuanLy, moTa, trangThai });
      toast.success("Tạo quỹ thành công");
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editing ? "Cập nhật quỹ" : "Thêm mới quỹ"}
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={onSubmit}>{editing ? "Cập nhật" : "Tạo mới"}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Tên quỹ (*)"
          value={ten}
          onChange={(e) => setTen(e.target.value)}
          error={errors.ten}
        />
        <Select
          label="Loại quỹ"
          value={loai}
          onChange={(e) => setLoai(e.target.value as LoaiQuy)}
          options={[
            { value: "tien_mat", label: "Tiền mặt" },
            { value: "ngan_hang", label: "Ngân hàng" },
            { value: "noi_bo", label: "Nội bộ" },
          ]}
        />
        {!editing && (
          <Input
            label="Số dư khởi tạo"
            type="number"
            value={soDu}
            onChange={(e) => setSoDu(Number(e.target.value))}
            error={errors.soDu}
          />
        )}
        <Select
          label="Người quản lý (*)"
          value={nguoiQuanLy}
          onChange={(e) => setNguoiQuanLy(e.target.value)}
          options={state.nguoiDung.map((u) => ({ value: u.id, label: u.ten }))}
          error={errors.nguoiQuanLy}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mô tả
          </label>
          <textarea
            value={moTa}
            onChange={(e) => setMoTa(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <Select
          label="Trạng thái"
          value={trangThai}
          onChange={(e) => setTrangThai(e.target.value as TrangThaiQuy)}
          options={[
            { value: "active", label: "Đang sử dụng" },
            { value: "inactive", label: "Ngưng sử dụng" },
          ]}
        />
      </div>
    </Modal>
  );
}
