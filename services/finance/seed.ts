import type { FinanceState } from "./types";

export function buildSeed(): FinanceState {
  const now = new Date();
  const iso = (d: Date) => d.toISOString();
  const daysAgo = (n: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - n);
    return iso(d);
  };

  const nguoiDung = [
    { id: "u1", ten: "Getfly Admin" },
    { id: "u2", ten: "Trương Kim Ngọc" },
    { id: "u3", ten: "Nguyễn Văn Linh" },
    { id: "u4", ten: "Trần Tuấn Anh" },
    { id: "u5", ten: "Võ Hòa" },
  ];

  const quy = [
    {
      id: "q1",
      ten: "Quỹ tiền mặt chính",
      loai: "tien_mat" as const,
      soDu: 500_700_000,
      nguoiQuanLy: "u1",
      moTa: "Quỹ tiền mặt văn phòng",
      trangThai: "active" as const,
      createdAt: daysAgo(120),
    },
    {
      id: "q2",
      ten: "Quỹ Vietcombank",
      loai: "ngan_hang" as const,
      soDu: 1_034_235_000,
      nguoiQuanLy: "u2",
      moTa: "Tài khoản 0123456789",
      trangThai: "active" as const,
      createdAt: daysAgo(120),
    },
    {
      id: "q3",
      ten: "Quỹ marketing",
      loai: "noi_bo" as const,
      soDu: 38_600_000,
      nguoiQuanLy: "u3",
      trangThai: "active" as const,
      createdAt: daysAgo(60),
    },
  ];

  const congNo = [
    {
      id: "kh1",
      ten: "Trần Thị Huyền Trang",
      maSoThue: "0301234567",
      soDienThoai: "0779474515",
      nhomKhachHang: "VIP",
      nguoiPhuTrach: "u2",
      phaiThu: 1_030_000_000,
      phaiTra: 0,
      ngayCapNhat: daysAgo(33),
    },
    {
      id: "kh2",
      ten: "Bs A",
      phaiThu: 20_000_000,
      phaiTra: 0,
      ngayCapNhat: daysAgo(71),
    },
    {
      id: "kh3",
      ten: "Công Ty A",
      maSoThue: "0309876543",
      phaiThu: 19_999_999,
      phaiTra: 0,
      ngayCapNhat: daysAgo(59),
    },
    {
      id: "kh4",
      ten: "5 Già Bàu Ao",
      phaiThu: 18_000_000,
      phaiTra: 0,
      ngayCapNhat: daysAgo(33),
    },
    {
      id: "kh5",
      ten: "Nguyễn Văn A",
      phaiThu: 150_000,
      phaiTra: 14_000_000,
      ngayCapNhat: daysAgo(29),
    },
    {
      id: "kh6",
      ten: "Nguyễn Văn B Phở",
      phaiThu: 0,
      phaiTra: 1_000_000,
      ngayCapNhat: daysAgo(5),
    },
  ];

  const phieuThu = [
    {
      id: "pt1",
      soChungTu: "PT-260301-0001",
      noiDung: "Thu tiền hợp đồng tháng 3",
      ngayYeuCau: daysAgo(13),
      ngayChungTu: daysAgo(13),
      quyId: "q2",
      hinhThucThanhToan: "chuyen_khoan" as const,
      nguon: "thu_khach_hang" as const,
      khachHangId: "kh3",
      soTien: 50_000_000,
      nguoiNopTien: "Anh Long",
      nguoiTao: "u1",
      createdAt: daysAgo(13),
    },
    {
      id: "pt2",
      soChungTu: "PT-260315-0002",
      noiDung: "Thu tiền dịch vụ",
      ngayYeuCau: daysAgo(8),
      ngayChungTu: daysAgo(8),
      quyId: "q1",
      hinhThucThanhToan: "tien_mat" as const,
      nguon: "tu_nhap" as const,
      soTien: 5_000_000,
      nguoiTao: "u2",
      createdAt: daysAgo(8),
    },
  ];

  const phieuChi = [
    {
      id: "pc1",
      soChungTu: "PC-260318-0001",
      noiDung: "Chi tiền nhập hàng",
      ngayYeuCau: daysAgo(18),
      ngayChungTu: daysAgo(18),
      quyId: "q2",
      hinhThucThanhToan: "chuyen_khoan" as const,
      nguon: "tu_nhap" as const,
      doiTuongLoai: "ncc" as const,
      doiTuongTen: "NCC ABC",
      soTien: 30_000_000,
      nguoiTao: "u3",
      createdAt: daysAgo(18),
    },
  ];

  const nganSach = [
    {
      id: "ns1",
      ten: "Tết 2026",
      soTien: 1_000_000_000,
      ngayBatDau: daysAgo(60),
      ngayKetThuc: daysAgo(-30),
      nguoiQuanLy: "u2",
      nguoiThamGia: ["u3", "u4"],
      moTa: "Ngân sách hoạt động Tết",
      trangThai: "active" as const,
      daSuDung: 200_000_000,
      createdAt: daysAgo(60),
      createdBy: "u1",
    },
    {
      id: "ns2",
      ten: "Chi phí tháng 4/2026",
      soTien: 50_000_000,
      ngayBatDau: daysAgo(20),
      ngayKetThuc: daysAgo(-10),
      nguoiQuanLy: "u2",
      nguoiThamGia: [],
      trangThai: "active" as const,
      daSuDung: 8_000_000,
      createdAt: daysAgo(20),
      createdBy: "u2",
    },
    {
      id: "ns3",
      ten: "Marketing Q1",
      soTien: 100_000_000,
      ngayBatDau: daysAgo(120),
      ngayKetThuc: daysAgo(30),
      nguoiQuanLy: "u3",
      nguoiThamGia: ["u4"],
      trangThai: "expired" as const,
      daSuDung: 95_000_000,
      createdAt: daysAgo(120),
      createdBy: "u3",
    },
  ];

  const yccp = [
    {
      id: "y1",
      maYeuCau: "PYC/2026-03/0008",
      loai: "thanh_toan" as const,
      noiDung: "Mua xe máy",
      lyDo: "Phục vụ giao hàng",
      nguoiYeuCauId: "u2",
      nguoiPheDuyetId: "u2",
      soTien: 35_000_000,
      daCap: 35_000_000,
      ngayYeuCau: daysAgo(20),
      danhSachNoiDung: [
        { id: "n1", noiDung: "Xe Honda", soTien: 35_000_000 },
      ],
      trangThai: "hoan_thanh" as const,
      lichSu: [
        { thoiGian: daysAgo(20), nguoi: "u2", hanhDong: "Tạo yêu cầu" },
        { thoiGian: daysAgo(19), nguoi: "u2", hanhDong: "Phê duyệt" },
        { thoiGian: daysAgo(18), nguoi: "u1", hanhDong: "Tạo phiếu chi" },
      ],
      createdAt: daysAgo(20),
    },
    {
      id: "y2",
      maYeuCau: "PYC/2026-03/0007",
      loai: "thanh_toan" as const,
      noiDung: "Cái này là test chi phí 600k",
      lyDo: "Test chi phí",
      nguoiYeuCauId: "u2",
      nguoiPheDuyetId: "u1",
      soTien: 600_000,
      daCap: 0,
      ngayYeuCau: daysAgo(15),
      danhSachNoiDung: [{ id: "n2", noiDung: "Test", soTien: 600_000 }],
      trangThai: "cho_xac_nhan" as const,
      lichSu: [{ thoiGian: daysAgo(15), nguoi: "u2", hanhDong: "Tạo yêu cầu" }],
      createdAt: daysAgo(15),
    },
    {
      id: "y3",
      maYeuCau: "PYC/2025-11/0006",
      loai: "tam_ung" as const,
      noiDung: "Tạm ứng công tác",
      lyDo: "Đi công tác Hà Nội 3 ngày",
      nguoiYeuCauId: "u4",
      nguoiPheDuyetId: "u1",
      soTien: 4_500_000,
      daCap: 0,
      ngayYeuCau: daysAgo(10),
      danhSachNoiDung: [
        { id: "n3", noiDung: "Vé máy bay", soTien: 2_500_000 },
        { id: "n4", noiDung: "Khách sạn", soTien: 2_000_000 },
      ],
      trangThai: "cho_xuat_quy" as const,
      lichSu: [
        { thoiGian: daysAgo(10), nguoi: "u4", hanhDong: "Tạo yêu cầu" },
        { thoiGian: daysAgo(9), nguoi: "u1", hanhDong: "Phê duyệt" },
      ],
      createdAt: daysAgo(10),
    },
  ];

  const soCai = [
    {
      id: "bt1",
      ngayGhiSo: daysAgo(13),
      ngayChungTu: daysAgo(13),
      soChungTu: "PT-260301-0001",
      loai: "phieu_thu" as const,
      dienGiai: "Thu tiền hợp đồng tháng 3 - Công Ty A",
      taiKhoanNo: "112",
      taiKhoanCo: "131",
      soTien: 50_000_000,
      refId: "pt1",
    },
    {
      id: "bt2",
      ngayGhiSo: daysAgo(8),
      ngayChungTu: daysAgo(8),
      soChungTu: "PT-260315-0002",
      loai: "phieu_thu" as const,
      dienGiai: "Thu tiền dịch vụ",
      taiKhoanNo: "111",
      taiKhoanCo: "511",
      soTien: 5_000_000,
      refId: "pt2",
    },
    {
      id: "bt3",
      ngayGhiSo: daysAgo(18),
      ngayChungTu: daysAgo(18),
      soChungTu: "PC-260318-0001",
      loai: "phieu_chi" as const,
      dienGiai: "Chi tiền nhập hàng - NCC ABC",
      taiKhoanNo: "156",
      taiKhoanCo: "112",
      soTien: 30_000_000,
      refId: "pc1",
    },
  ];

  const hoatDong = [
    {
      id: "hd1",
      loai: "phieu_thu",
      noiDung: "[Phiếu Thu] Tạo mới PT-260301-0001",
      nguoi: "Getfly Admin",
      thoiGian: daysAgo(13),
      refId: "pt1",
      refType: "phieu_thu" as const,
    },
    {
      id: "hd2",
      loai: "phieu_thu",
      noiDung: "[Phiếu Thu] Đã thu tiền",
      nguoi: "Getfly Admin",
      thoiGian: daysAgo(13),
      refId: "pt1",
      refType: "phieu_thu" as const,
    },
    {
      id: "hd3",
      loai: "phieu_chi",
      noiDung: "[Phiếu Chi] Tạo mới PC-260318-0001",
      nguoi: "Nguyễn Văn Linh",
      thoiGian: daysAgo(18),
      refId: "pc1",
      refType: "phieu_chi" as const,
    },
  ];

  return {
    quy,
    phieuThu,
    phieuChi,
    nganSach,
    yccp,
    congNo,
    soCai,
    hoatDong,
    nguoiDung,
  };
}
