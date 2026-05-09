"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDateForInput } from "@/lib/utils";
import { useFinanceState } from "@/hooks/useFinanceStore";
import { TAI_KHOAN_LIST, type ReportTabId, type BalanceRow } from "../_type";

export function useBaoCaoPage() {
  const router = useRouter();
  const state = useFinanceState();
  const [tab, setTab] = useState<ReportTabId>("b01-dn");
  const [tuNgay, setTuNgay] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return formatDateForInput(d);
  });
  const [denNgay, setDenNgay] = useState(formatDateForInput(new Date()));
  const [taiKhoanFilter, setTaiKhoanFilter] = useState("");

  const rows: BalanceRow[] = useMemo(() => {
    const ps = state.soCai.filter((b) => {
      if (tuNgay && new Date(b.ngayChungTu) < new Date(tuNgay)) return false;
      if (denNgay && new Date(b.ngayChungTu) > new Date(denNgay)) return false;
      return true;
    });

    return TAI_KHOAN_LIST.filter(
      (tk) => !taiKhoanFilter || tk.id === taiKhoanFilter,
    ).map((tk) => {
      const psNo = ps
        .filter((b) => b.taiKhoanNo === tk.id)
        .reduce((s, b) => s + b.soTien, 0);
      const psCo = ps
        .filter((b) => b.taiKhoanCo === tk.id)
        .reduce((s, b) => s + b.soTien, 0);
      const seedDuDauNo =
        tk.id === "111" ? 400_000_000 : tk.id === "112" ? 200_000_000 : 0;
      const duCuoiNo = Math.max(0, seedDuDauNo + psNo - psCo);
      return {
        taiKhoan: tk.id,
        ten: tk.ten,
        duDauNo: seedDuDauNo,
        duDauCo: 0,
        psNo,
        psCo,
        duCuoiNo,
        duCuoiCo: 0,
      };
    });
  }, [state.soCai, tuNgay, denNgay, taiKhoanFilter]);

  const onDrillDown = (taiKhoan: string) => {
    router.push(`/tai-chinh/so-cai?tai-khoan=${taiKhoan}`);
  };

  return {
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
  };
}
