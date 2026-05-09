"use client";

import { useQuyPage } from "./_hooks/useQuyPage";
import { QuyTabBar } from "./components/QuyTabBar";
import { QuanLyQuyTab } from "./components/QuanLyQuyTab";
import { PhieuThuTab } from "./components/PhieuThuTab";
import { PhieuChiTab } from "./components/PhieuChiTab";
import { HachToanQuyTab } from "./components/HachToanQuyTab";
import { QuyFormModal } from "./components/QuyFormModal";
import { PhieuThuFormModal } from "../phieu-thu/components/PhieuThuFormModal";
import { PhieuThuDetailModal } from "../phieu-thu/components/PhieuThuDetailModal";
import { PhieuChiFormModal } from "../phieu-chi/components/PhieuChiFormModal";
import { PhieuChiDetailModal } from "../phieu-chi/components/PhieuChiDetailModal";

export default function QuyPage() {
  const {
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
  } = useQuyPage();

  return (
    <div className="p-6">
      <QuyTabBar activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "quan-ly" && (
        <QuanLyQuyTab
          filteredQuy={filteredQuy}
          nguoiDung={state.nguoiDung}
          search={search}
          trangThaiFilter={trangThaiFilter}
          totalBalance={totalBalance}
          onSearchChange={setSearch}
          onTrangThaiChange={setTrangThaiFilter}
          onCreate={onCreateQuy}
          onEdit={onEditQuy}
          onDelete={onDeleteQuy}
        />
      )}

      {activeTab === "phieu-thu" && (
        <PhieuThuTab
          phieuThu={state.phieuThu}
          quyList={state.quy}
          onCreate={onCreateThu}
          onEdit={onEditThu}
          onView={onViewThu}
        />
      )}

      {activeTab === "phieu-chi" && (
        <PhieuChiTab
          phieuChi={state.phieuChi}
          quyList={state.quy}
          onCreate={onCreateChi}
          onEdit={onEditChi}
          onView={onViewChi}
        />
      )}

      {activeTab === "hach-toan" && (
        <HachToanQuyTab soCai={state.soCai} />
      )}

      {/* Modals */}
      <QuyFormModal isOpen={showForm} onClose={() => setShowForm(false)} editing={editing} />
      <PhieuThuFormModal isOpen={showThuForm} onClose={() => setShowThuForm(false)} editing={editingThu} />
      <PhieuThuDetailModal phieu={detailThu} onClose={() => setDetailThu(null)} />
      <PhieuChiFormModal isOpen={showChiForm} onClose={() => setShowChiForm(false)} editing={editingChi} />
      <PhieuChiDetailModal phieu={detailChi} onClose={() => setDetailChi(null)} />
    </div>
  );
}
