export type LoaiQuy = "tien_mat" | "ngan_hang" | "noi_bo";
export type TrangThaiQuy = "active" | "inactive";

export interface Quy {
  id: string;
  ten: string;
  loai: LoaiQuy;
  soDu: number;
  nguoiQuanLy: string;
  moTa?: string;
  trangThai: TrangThaiQuy;
  createdAt: string;
}

export type NguonThu =
  | "tu_nhap"
  | "don_hang_ban"
  | "thu_khach_hang"
  | "hoan_ung";

export interface HachToan {
  taiKhoanNo: string;
  taiKhoanCo: string;
  soTien: number;
}

export interface PhieuThu {
  id: string;
  soChungTu: string;
  noiDung: string;
  ngayYeuCau: string;
  ngayChungTu?: string;
  quyId: string;
  hinhThucThanhToan: "tien_mat" | "chuyen_khoan" | "khac";
  moTa?: string;
  nguon: NguonThu;
  khachHangId?: string;
  soTien: number;
  nguoiNopTien?: string;
  taiLieu?: string[];
  hachToan?: HachToan;
  nguoiTao: string;
  createdAt: string;
}

export type NguonChi = "tu_nhap" | "yccp" | "don_hang" | "hoan_tien";

export interface PhieuChi {
  id: string;
  soChungTu: string;
  noiDung: string;
  ngayYeuCau: string;
  ngayChungTu?: string;
  quyId: string;
  hinhThucThanhToan: "tien_mat" | "chuyen_khoan" | "khac";
  moTa?: string;
  nguon: NguonChi;
  yccpId?: string;
  doiTuongId?: string;
  doiTuongTen?: string;
  doiTuongLoai?: "nhan_vien" | "khach_hang" | "ncc" | "khac";
  soTien: number;
  taiLieu?: string[];
  hachToan?: HachToan;
  nguoiTao: string;
  createdAt: string;
}

export type TrangThaiNganSach = "active" | "expired" | "inactive";

export interface NganSach {
  id: string;
  ten: string;
  soTien: number;
  ngayBatDau: string;
  ngayKetThuc: string;
  nguoiQuanLy: string;
  nguoiThamGia: string[];
  template?: boolean;
  moTa?: string;
  trangThai: TrangThaiNganSach;
  daSuDung: number;
  createdAt: string;
  createdBy: string;
}

export type LoaiYCCP = "thanh_toan" | "tam_ung" | "hoan_ung";
export type TrangThaiYCCP =
  | "nhap"
  | "cho_xac_nhan"
  | "dang_xu_ly"
  | "cho_xuat_quy"
  | "da_xuat_quy"
  | "hoan_thanh"
  | "tu_choi"
  | "huy";

export interface NoiDungChi {
  id: string;
  noiDung: string;
  soTien: number;
}

export interface YeuCauChiPhi {
  id: string;
  maYeuCau: string;
  loai: LoaiYCCP;
  noiDung: string;
  lyDo: string;
  nguoiYeuCauId: string;
  nguoiPheDuyetId: string;
  soTien: number;
  daCap: number;
  ngayYeuCau: string;
  donHangId?: string;
  khachHangId?: string;
  danhSachNoiDung: NoiDungChi[];
  taiLieu?: string[];
  trangThai: TrangThaiYCCP;
  lyDoTuChoi?: string;
  lichSu: { thoiGian: string; nguoi: string; hanhDong: string; ghiChu?: string }[];
  createdAt: string;
}

export interface KhachHangCongNo {
  id: string;
  ten: string;
  maSoThue?: string;
  soDienThoai?: string;
  nhomKhachHang?: string;
  nguoiPhuTrach?: string;
  phaiThu: number;
  phaiTra: number;
  ngayCapNhat?: string;
}

export type LoaiBoToan =
  | "phieu_thu"
  | "phieu_chi"
  | "don_hang"
  | "dieu_chinh";

export interface BoToan {
  id: string;
  ngayGhiSo: string;
  ngayChungTu: string;
  soChungTu: string;
  loai: LoaiBoToan;
  dienGiai: string;
  taiKhoanNo: string;
  taiKhoanCo: string;
  soTien: number;
  refId?: string;
}

export interface HoatDong {
  id: string;
  loai: string;
  noiDung: string;
  nguoi: string;
  thoiGian: string;
  refId?: string;
  refType?: "phieu_thu" | "phieu_chi" | "yccp" | "ngan_sach" | "quy";
}

export interface NguoiDung {
  id: string;
  ten: string;
}

export interface FinanceState {
  quy: Quy[];
  phieuThu: PhieuThu[];
  phieuChi: PhieuChi[];
  nganSach: NganSach[];
  yccp: YeuCauChiPhi[];
  congNo: KhachHangCongNo[];
  soCai: BoToan[];
  hoatDong: HoatDong[];
  nguoiDung: NguoiDung[];
}

export const TRANG_THAI_YCCP_LABEL: Record<TrangThaiYCCP, string> = {
  nhap: "Nháp",
  cho_xac_nhan: "Chờ xác nhận",
  dang_xu_ly: "Đang xử lý",
  cho_xuat_quy: "Chờ xuất quỹ",
  da_xuat_quy: "Đã xuất quỹ",
  hoan_thanh: "Đã hoàn thành",
  tu_choi: "Từ chối",
  huy: "Hủy",
};

export const LOAI_YCCP_LABEL: Record<LoaiYCCP, string> = {
  thanh_toan: "Thanh toán",
  tam_ung: "Tạm ứng",
  hoan_ung: "Hoàn ứng",
};

export const NGUON_THU_LABEL: Record<NguonThu, string> = {
  tu_nhap: "Tự nhập",
  don_hang_ban: "Đơn hàng bán",
  thu_khach_hang: "Thu tiền khách hàng",
  hoan_ung: "Hoàn ứng",
};

export const NGUON_CHI_LABEL: Record<NguonChi, string> = {
  tu_nhap: "Tự nhập",
  yccp: "Yêu cầu chi phí",
  don_hang: "Đơn hàng",
  hoan_tien: "Hoàn tiền",
};

export const LOAI_QUY_LABEL: Record<LoaiQuy, string> = {
  tien_mat: "Tiền mặt",
  ngan_hang: "Ngân hàng",
  noi_bo: "Nội bộ",
};

export const HINH_THUC_THANH_TOAN_LABEL: Record<string, string> = {
  tien_mat: "Tiền mặt",
  chuyen_khoan: "Chuyển khoản",
  khac: "Khác",
};
