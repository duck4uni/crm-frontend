"use client";

import type {
  FinanceState,
  Quy,
  PhieuThu,
  PhieuChi,
  NganSach,
  YeuCauChiPhi,
  TrangThaiYCCP,
  BoToan,
  HoatDong,
} from "./types";
import { buildSeed } from "./seed";

const STORAGE_KEY = "finance:v1";

function makeId(prefix: string): string {
  return prefix + "_" + Math.random().toString(36).slice(2, 9);
}

function pad(n: number, len = 4): string {
  return String(n).padStart(len, "0");
}

function genSoChungTu(prefix: "PT" | "PC", count: number): string {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(2);
  const mm = pad(d.getMonth() + 1, 2);
  const dd = pad(d.getDate(), 2);
  return `${prefix}-${yy}${mm}${dd}-${pad(count + 1)}`;
}

class FinanceStore {
  private state: FinanceState;
  private listeners = new Set<() => void>();

  constructor() {
    this.state = this.load();
  }

  private load(): FinanceState {
    if (typeof window === "undefined") {
      return buildSeed();
    }
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as FinanceState;
        if (parsed && parsed.quy) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    const seed = buildSeed();
    this.persist(seed);
    return seed;
  }

  private persist(state: FinanceState): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore quota
    }
  }

  private emit(): void {
    this.persist(this.state);
    this.listeners.forEach((l) => l());
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getSnapshot(): FinanceState {
    return this.state;
  }

  reset(): void {
    this.state = buildSeed();
    this.emit();
  }

  private addHoatDong(input: Omit<HoatDong, "id" | "thoiGian"> & { thoiGian?: string }): void {
    this.state = {
      ...this.state,
      hoatDong: [
        {
          id: makeId("hd"),
          thoiGian: input.thoiGian ?? new Date().toISOString(),
          loai: input.loai,
          noiDung: input.noiDung,
          nguoi: input.nguoi,
          refId: input.refId,
          refType: input.refType,
        },
        ...this.state.hoatDong,
      ].slice(0, 200),
    };
  }

  private addBoToan(boToan: Omit<BoToan, "id">): void {
    this.state = {
      ...this.state,
      soCai: [{ id: makeId("bt"), ...boToan }, ...this.state.soCai],
    };
  }

  private getUserName(id: string): string {
    return this.state.nguoiDung.find((u) => u.id === id)?.ten ?? "Hệ thống";
  }

  // ===== Quỹ =====
  createQuy(input: Omit<Quy, "id" | "createdAt" | "soDu"> & { soDu?: number }): Quy {
    const quy: Quy = {
      id: makeId("q"),
      createdAt: new Date().toISOString(),
      soDu: input.soDu ?? 0,
      ...input,
    } as Quy;
    this.state = { ...this.state, quy: [...this.state.quy, quy] };
    this.emit();
    return quy;
  }

  updateQuy(id: string, patch: Partial<Quy>): void {
    this.state = {
      ...this.state,
      quy: this.state.quy.map((q) => (q.id === id ? { ...q, ...patch } : q)),
    };
    this.emit();
  }

  deleteQuy(id: string): { ok: boolean; reason?: string } {
    const hasPhieuThu = this.state.phieuThu.some((p) => p.quyId === id);
    const hasPhieuChi = this.state.phieuChi.some((p) => p.quyId === id);
    if (hasPhieuThu || hasPhieuChi) {
      return { ok: false, reason: "Quỹ đã có phát sinh, chỉ có thể ngưng sử dụng." };
    }
    this.state = {
      ...this.state,
      quy: this.state.quy.filter((q) => q.id !== id),
    };
    this.emit();
    return { ok: true };
  }

  // ===== Phiếu thu =====
  createPhieuThu(
    input: Omit<PhieuThu, "id" | "soChungTu" | "createdAt"> & { soChungTu?: string },
  ): PhieuThu {
    const soChungTu =
      input.soChungTu ?? genSoChungTu("PT", this.state.phieuThu.length);
    const phieu: PhieuThu = {
      id: makeId("pt"),
      soChungTu,
      createdAt: new Date().toISOString(),
      ngayChungTu: input.ngayChungTu ?? input.ngayYeuCau,
      ...input,
    };

    let next = { ...this.state, phieuThu: [phieu, ...this.state.phieuThu] };

    // Tăng số dư quỹ
    next.quy = next.quy.map((q) =>
      q.id === phieu.quyId ? { ...q, soDu: q.soDu + phieu.soTien } : q,
    );

    // Giảm công nợ phải thu nếu thu khách hàng
    if (phieu.khachHangId && phieu.nguon === "thu_khach_hang") {
      next.congNo = next.congNo.map((kh) =>
        kh.id === phieu.khachHangId
          ? {
              ...kh,
              phaiThu: Math.max(0, kh.phaiThu - phieu.soTien),
              ngayCapNhat: new Date().toISOString(),
            }
          : kh,
      );
    }

    this.state = next;

    // Bút toán: Nợ TK quỹ, Có TK đối ứng
    const quyAcc = this.state.quy.find((q) => q.id === phieu.quyId)?.loai === "ngan_hang" ? "112" : "111";
    const coAccount =
      phieu.nguon === "thu_khach_hang"
        ? "131"
        : phieu.nguon === "don_hang_ban"
          ? "511"
          : "511";
    this.addBoToan({
      ngayGhiSo: phieu.ngayChungTu ?? phieu.ngayYeuCau,
      ngayChungTu: phieu.ngayChungTu ?? phieu.ngayYeuCau,
      soChungTu: phieu.soChungTu,
      loai: "phieu_thu",
      dienGiai: phieu.noiDung,
      taiKhoanNo: phieu.hachToan?.taiKhoanNo || quyAcc,
      taiKhoanCo: phieu.hachToan?.taiKhoanCo || coAccount,
      soTien: phieu.soTien,
      refId: phieu.id,
    });

    this.addHoatDong({
      loai: "phieu_thu",
      noiDung: `[Phiếu Thu] Tạo mới ${phieu.soChungTu}`,
      nguoi: this.getUserName(phieu.nguoiTao),
      refId: phieu.id,
      refType: "phieu_thu",
    });

    this.emit();
    return phieu;
  }

  updatePhieuThu(id: string, patch: Partial<PhieuThu>): void {
    this.state = {
      ...this.state,
      phieuThu: this.state.phieuThu.map((p) =>
        p.id === id ? { ...p, ...patch } : p,
      ),
    };
    this.emit();
  }

  deletePhieuThu(id: string): void {
    const phieu = this.state.phieuThu.find((p) => p.id === id);
    if (!phieu) return;
    let next = { ...this.state };
    next.phieuThu = next.phieuThu.filter((p) => p.id !== id);
    next.quy = next.quy.map((q) =>
      q.id === phieu.quyId ? { ...q, soDu: q.soDu - phieu.soTien } : q,
    );
    if (phieu.khachHangId && phieu.nguon === "thu_khach_hang") {
      next.congNo = next.congNo.map((kh) =>
        kh.id === phieu.khachHangId
          ? { ...kh, phaiThu: kh.phaiThu + phieu.soTien }
          : kh,
      );
    }
    next.soCai = next.soCai.filter((b) => b.refId !== phieu.id);
    this.state = next;
    this.emit();
  }

  // ===== Phiếu chi =====
  createPhieuChi(
    input: Omit<PhieuChi, "id" | "soChungTu" | "createdAt"> & { soChungTu?: string },
  ): PhieuChi {
    const soChungTu =
      input.soChungTu ?? genSoChungTu("PC", this.state.phieuChi.length);
    const phieu: PhieuChi = {
      id: makeId("pc"),
      soChungTu,
      createdAt: new Date().toISOString(),
      ngayChungTu: input.ngayChungTu ?? input.ngayYeuCau,
      ...input,
    };

    let next = { ...this.state, phieuChi: [phieu, ...this.state.phieuChi] };

    // Trừ số dư quỹ
    next.quy = next.quy.map((q) =>
      q.id === phieu.quyId ? { ...q, soDu: q.soDu - phieu.soTien } : q,
    );

    // Giảm công nợ phải trả nếu đối tượng là khách hàng
    if (phieu.doiTuongId && phieu.doiTuongLoai === "khach_hang") {
      next.congNo = next.congNo.map((kh) =>
        kh.id === phieu.doiTuongId
          ? {
              ...kh,
              phaiTra: Math.max(0, kh.phaiTra - phieu.soTien),
              ngayCapNhat: new Date().toISOString(),
            }
          : kh,
      );
    }

    // Cập nhật YCCP nếu có
    if (phieu.yccpId) {
      next.yccp = next.yccp.map((y) =>
        y.id === phieu.yccpId
          ? {
              ...y,
              daCap: y.daCap + phieu.soTien,
              trangThai: "hoan_thanh" as TrangThaiYCCP,
              lichSu: [
                ...y.lichSu,
                {
                  thoiGian: new Date().toISOString(),
                  nguoi: phieu.nguoiTao,
                  hanhDong: "Tạo phiếu chi",
                  ghiChu: phieu.soChungTu,
                },
              ],
            }
          : y,
      );
    }

    this.state = next;

    const quyAcc = this.state.quy.find((q) => q.id === phieu.quyId)?.loai === "ngan_hang" ? "112" : "111";
    const noAccount = phieu.doiTuongLoai === "ncc" ? "331" : phieu.yccpId ? "141" : "642";
    this.addBoToan({
      ngayGhiSo: phieu.ngayChungTu ?? phieu.ngayYeuCau,
      ngayChungTu: phieu.ngayChungTu ?? phieu.ngayYeuCau,
      soChungTu: phieu.soChungTu,
      loai: "phieu_chi",
      dienGiai: phieu.noiDung,
      taiKhoanNo: phieu.hachToan?.taiKhoanNo || noAccount,
      taiKhoanCo: phieu.hachToan?.taiKhoanCo || quyAcc,
      soTien: phieu.soTien,
      refId: phieu.id,
    });

    this.addHoatDong({
      loai: "phieu_chi",
      noiDung: `[Phiếu Chi] Tạo mới ${phieu.soChungTu}`,
      nguoi: this.getUserName(phieu.nguoiTao),
      refId: phieu.id,
      refType: "phieu_chi",
    });

    this.emit();
    return phieu;
  }

  updatePhieuChi(id: string, patch: Partial<PhieuChi>): void {
    this.state = {
      ...this.state,
      phieuChi: this.state.phieuChi.map((p) =>
        p.id === id ? { ...p, ...patch } : p,
      ),
    };
    this.emit();
  }

  deletePhieuChi(id: string): void {
    const phieu = this.state.phieuChi.find((p) => p.id === id);
    if (!phieu) return;
    let next = { ...this.state };
    next.phieuChi = next.phieuChi.filter((p) => p.id !== id);
    next.quy = next.quy.map((q) =>
      q.id === phieu.quyId ? { ...q, soDu: q.soDu + phieu.soTien } : q,
    );
    next.soCai = next.soCai.filter((b) => b.refId !== phieu.id);
    this.state = next;
    this.emit();
  }

  // ===== Ngân sách =====
  createNganSach(
    input: Omit<NganSach, "id" | "createdAt" | "daSuDung"> & { daSuDung?: number },
  ): NganSach {
    const ns: NganSach = {
      id: makeId("ns"),
      createdAt: new Date().toISOString(),
      daSuDung: input.daSuDung ?? 0,
      ...input,
    };
    this.state = { ...this.state, nganSach: [...this.state.nganSach, ns] };
    this.emit();
    return ns;
  }

  updateNganSach(id: string, patch: Partial<NganSach>): void {
    this.state = {
      ...this.state,
      nganSach: this.state.nganSach.map((n) =>
        n.id === id ? { ...n, ...patch } : n,
      ),
    };
    this.emit();
  }

  deleteNganSach(id: string): void {
    this.state = {
      ...this.state,
      nganSach: this.state.nganSach.filter((n) => n.id !== id),
    };
    this.emit();
  }

  // ===== YCCP =====
  createYCCP(
    input: Omit<YeuCauChiPhi, "id" | "maYeuCau" | "createdAt" | "lichSu" | "daCap"> & {
      maYeuCau?: string;
    },
  ): YeuCauChiPhi {
    const d = new Date();
    const yy = String(d.getFullYear());
    const mm = pad(d.getMonth() + 1, 2);
    const idx = pad(this.state.yccp.length + 1);
    const prefix = input.loai === "tam_ung" ? "PTU" : "PYC";
    const maYeuCau = input.maYeuCau ?? `${prefix}/${yy}-${mm}/${idx}`;
    const yccp: YeuCauChiPhi = {
      id: makeId("y"),
      maYeuCau,
      daCap: 0,
      createdAt: new Date().toISOString(),
      lichSu: [
        {
          thoiGian: new Date().toISOString(),
          nguoi: input.nguoiYeuCauId,
          hanhDong: "Tạo yêu cầu",
        },
      ],
      ...input,
    };
    this.state = { ...this.state, yccp: [yccp, ...this.state.yccp] };
    this.emit();
    return yccp;
  }

  updateYCCP(id: string, patch: Partial<YeuCauChiPhi>): void {
    this.state = {
      ...this.state,
      yccp: this.state.yccp.map((y) => (y.id === id ? { ...y, ...patch } : y)),
    };
    this.emit();
  }

  approveYCCP(id: string, nguoiId: string): void {
    this.state = {
      ...this.state,
      yccp: this.state.yccp.map((y) =>
        y.id === id
          ? {
              ...y,
              trangThai: "cho_xuat_quy",
              lichSu: [
                ...y.lichSu,
                {
                  thoiGian: new Date().toISOString(),
                  nguoi: nguoiId,
                  hanhDong: "Phê duyệt",
                },
              ],
            }
          : y,
      ),
    };
    this.emit();
  }

  rejectYCCP(id: string, nguoiId: string, lyDo: string): void {
    this.state = {
      ...this.state,
      yccp: this.state.yccp.map((y) =>
        y.id === id
          ? {
              ...y,
              trangThai: "tu_choi",
              lyDoTuChoi: lyDo,
              lichSu: [
                ...y.lichSu,
                {
                  thoiGian: new Date().toISOString(),
                  nguoi: nguoiId,
                  hanhDong: "Từ chối",
                  ghiChu: lyDo,
                },
              ],
            }
          : y,
      ),
    };
    this.emit();
  }

  cancelYCCP(id: string, nguoiId: string): void {
    this.state = {
      ...this.state,
      yccp: this.state.yccp.map((y) =>
        y.id === id
          ? {
              ...y,
              trangThai: "huy",
              lichSu: [
                ...y.lichSu,
                {
                  thoiGian: new Date().toISOString(),
                  nguoi: nguoiId,
                  hanhDong: "Hủy",
                },
              ],
            }
          : y,
      ),
    };
    this.emit();
  }

  recalcCongNo(): void {
    // Re-derive phải thu / phải trả từ phiếu thu/chi (mock)
    this.state = {
      ...this.state,
      congNo: this.state.congNo.map((kh) => ({
        ...kh,
        ngayCapNhat: new Date().toISOString(),
      })),
    };
    this.emit();
  }
}

let instance: FinanceStore | null = null;

export function getFinanceStore(): FinanceStore {
  if (!instance) {
    instance = new FinanceStore();
  }
  return instance;
}

export type { FinanceStore };
