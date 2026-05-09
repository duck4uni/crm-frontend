"use client";

import { useBaoCaoPage } from "./_hook/useBaoCaoPage";
import { ReportTabBar } from "./_components/ReportTabBar";
import { ReportFilters } from "./_components/ReportFilters";
import { BalanceSheetTable } from "./_components/BalanceSheetTable";
import { KqkdTable } from "./_components/KqkdTable";
import { CashFlowPlaceholder } from "./_components/CashFlowPlaceholder";

export default function BaoCaoTaiChinhPage() {
  const {
    tab,
    setTab,
    tuNgay,
    setTuNgay,
    denNgay,
    setDenNgay,
    taiKhoanFilter,
    setTaiKhoanFilter,
    rows,
    onDrillDown,
  } = useBaoCaoPage();

  return (
    <div className="p-6">
      <ReportTabBar tab={tab} onTabChange={setTab} />

      <ReportFilters
        tuNgay={tuNgay}
        onTuNgayChange={setTuNgay}
        denNgay={denNgay}
        onDenNgayChange={setDenNgay}
        taiKhoanFilter={taiKhoanFilter}
        onTaiKhoanFilterChange={setTaiKhoanFilter}
      />

      {(tab === "b01-dn" || tab === "b01a" || tab === "b01b") && (
        <BalanceSheetTable rows={rows} onDrillDown={onDrillDown} />
      )}

      {(tab === "kqkd" || tab === "b02-dn") && <KqkdTable />}

      {tab === "b03-dn" && <CashFlowPlaceholder />}
    </div>
  );
}
