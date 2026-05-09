export const REPORT_TABS = [
  { id: "b01a", label: "Báo cáo tình hình tài chính (B01A)" },
  { id: "b01b", label: "Báo cáo tình hình tài chính (B01B)" },
  { id: "b01-dn", label: "Bảng cân đối kế toán (B01-DN)" },
  { id: "kqkd", label: "Kết quả hoạt động kinh doanh" },
  { id: "b02-dn", label: "Kết quả kinh doanh (B02-DN)" },
  { id: "b03-dn", label: "Lưu chuyển tiền tệ (B03-DN)" },
] as const;

export type ReportTabId = (typeof REPORT_TABS)[number]["id"];

export const TAI_KHOAN_LIST = [
  { id: "111", ten: "Tiền mặt" },
  { id: "112", ten: "Tiền gửi Ngân hàng" },
  { id: "121", ten: "Chứng khoán kinh doanh" },
  { id: "128", ten: "Đầu tư nắm giữ đến ngày đáo hạn" },
  { id: "131", ten: "Phải thu của khách hàng" },
  { id: "133", ten: "Thuế GTGT được khấu trừ" },
  { id: "136", ten: "Phải thu nội bộ" },
  { id: "138", ten: "Phải thu khác" },
  { id: "141", ten: "Tạm ứng" },
  { id: "151", ten: "Hàng mua đang đi đường" },
  { id: "152", ten: "Nguyên liệu, vật liệu" },
  { id: "153", ten: "Công cụ, dụng cụ" },
  { id: "154", ten: "Chi phí sản xuất, kinh doanh dở dang" },
  { id: "155", ten: "Thành phẩm" },
  { id: "156", ten: "Hàng hóa" },
  { id: "157", ten: "Hàng gửi đi bán" },
  { id: "211", ten: "Tài sản cố định" },
  { id: "331", ten: "Phải trả người bán" },
  { id: "511", ten: "Doanh thu" },
  { id: "642", ten: "Chi phí quản lý" },
] as const;

export interface BalanceRow {
  taiKhoan: string;
  ten: string;
  duDauNo: number;
  duDauCo: number;
  psNo: number;
  psCo: number;
  duCuoiNo: number;
  duCuoiCo: number;
}

export interface KqkdRow {
  label: string;
  current: number;
  prev: number;
}
