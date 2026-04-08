// Customer Management Types
export interface Customer {
  id: string;
  orderNumber: number; // STT - Sequential number
  customerName: string; // Tên khách hàng
  email?: string; // Email
  phone: string; // Điện thoại
  address: string; // Địa chỉ
  salutation: string; // Danh xưng (Mr, Mrs, Ms, Anh, Chị)
  mobilePhone: string; // Số di động
  source: string; // Nguồn
  assignee: string; // Người phụ trách
  relationship: string; // Mối quan hệ
  lastContactDate?: Date; // Liên hệ lần cuối
  createdDate: Date; // Ngày tạo
  customerSource: string; // Nguồn khách hàng
  gender: "Male" | "Female" | "Other"; // Giới tính
  sessionCount?: number; // Buổi học
  remainingSessions?: number; // Số buổi còn lại
  status: CustomerStatus; // Trạng thái
  avatar?: string;
}

export enum CustomerStatus {
  NEW = "new", // Đang mới
  QUOTED = "quoted", // Dự báo giá
  CONTACTED = "contacted", // Đã liên hệ
  NOT_CONTACTED = "not_contacted", // Chưa liên hệ được
  TESTED = "tested", // Đã test đầu vào
  REGISTERED = "registered", // Đã đăng ký
  CONSIDERING = "considering", // Đang cân nhắc
  UPSELL = "upsell", // Upsell
  APPROACHED = "approached", // Đã tiếp cận
  SURVEYED = "surveyed", // Khảo sát
}
