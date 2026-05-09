"use client";

import { useMemo, useState } from "react";
import { useFinanceState, useFinanceStore } from "@/hooks/useFinanceStore";
import { useToast } from "@/components/ui/ToastProvider";
import type { Quy, PhieuThu, PhieuChi } from "@/services/finance/types";

export const SUB_TABS = [
  { id: "quan-ly", label: "Quản lý quỹ" },
  { id: "phieu-thu", label: "Phiếu thu" },
  { id: "phieu-chi", label: "Phiếu chi" },
  { id: "hach-toan", label: "Hạch toán quỹ" },
];

export function useQuyPage() {
  const state = useFinanceState();
  const store = useFinanceStore();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState("quan-ly");

  // Quản lý quỹ state
  const [search, setSearch] = useState("");
  const [trangThaiFilter, setTrangThaiFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Quy | null>(null);

  // Phiếu thu state
  const [showThuForm, setShowThuForm] = useState(false);
  const [editingThu, setEditingThu] = useState<PhieuThu | null>(null);
  const [detailThu, setDetailThu] = useState<PhieuThu | null>(null);

  // Phiếu chi state
  const [showChiForm, setShowChiForm] = useState(false);
  const [editingChi, setEditingChi] = useState<PhieuChi | null>(null);
  const [detailChi, setDetailChi] = useState<PhieuChi | null>(null);

  const filteredQuy = useMemo(() => {
    const q = search.trim().toLowerCase();
    return state.quy.filter((quy) => {
      if (q && !quy.ten.toLowerCase().includes(q)) return false;
      if (trangThaiFilter && quy.trangThai !== trangThaiFilter) return false;
      return true;
    });
  }, [state.quy, search, trangThaiFilter]);

  const totalBalance = state.quy.reduce((s, q) => s + q.soDu, 0);

  const onCreateQuy = () => { setEditing(null); setShowForm(true); };
  const onEditQuy = (quy: Quy) => { setEditing(quy); setShowForm(true); };
  const onDeleteQuy = (quy: Quy) => {
    if (!confirm(`Xóa quỹ "${quy.ten}"?`)) return;
    const result = store.deleteQuy(quy.id);
    if (!result.ok) { toast.warning("Không thể xóa", result.reason); return; }
    toast.success("Đã xóa quỹ");
  };

  const onCreateThu = () => { setEditingThu(null); setShowThuForm(true); };
  const onEditThu = (p: PhieuThu) => { setEditingThu(p); setShowThuForm(true); };
  const onViewThu = (p: PhieuThu) => setDetailThu(p);

  const onCreateChi = () => { setEditingChi(null); setShowChiForm(true); };
  const onEditChi = (p: PhieuChi) => { setEditingChi(p); setShowChiForm(true); };
  const onViewChi = (p: PhieuChi) => setDetailChi(p);

  return {
    state,
    activeTab, setActiveTab,
    search, setSearch,
    trangThaiFilter, setTrangThaiFilter,
    showForm, setShowForm,
    editing,
    filteredQuy,
    totalBalance,
    onCreateQuy, onEditQuy, onDeleteQuy,
    showThuForm, setShowThuForm,
    editingThu,
    detailThu, setDetailThu,
    onCreateThu, onEditThu, onViewThu,
    showChiForm, setShowChiForm,
    editingChi,
    detailChi, setDetailChi,
    onCreateChi, onEditChi, onViewChi,
  };
}
