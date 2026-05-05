import type { TemplateType, TemplateTag } from "./types";

export const CONNECTIONS_KEY = "crm.zaloOa.connections.v1";

export const TEMPLATE_TYPES: { value: TemplateType; label: string }[] = [
  { value: "1", label: "1 — Custom" },
  { value: "2", label: "2 — Authentication (OTP)" },
  { value: "3", label: "3 — Payment Request" },
  { value: "4", label: "4 — Voucher" },
  { value: "5", label: "5 — Service Rating" },
];

export const TEMPLATE_TAGS: { value: TemplateTag; label: string }[] = [
  { value: "1", label: "1 — Giao dịch" },
  { value: "2", label: "2 — Chăm sóc khách hàng" },
  { value: "3", label: "3 — Hậu mãi / Khuyến mãi" },
];

export const PARAM_TYPES = [
  "CUSTOMER_NAME",
  "ORDER_CODE",
  "AMOUNT",
  "ORDER_DATE",
  "APPOINTMENT_DATE",
  "APPOINTMENT_TIME",
  "DOCTOR_NAME",
  "PAYMENT_LINK",
  "TRACKING_CODE",
  "OTHER",
];

export const STEPS = [
  "Thông tin cơ bản",
  "Thiết kế layout",
  "Biến & Xem trước",
];
