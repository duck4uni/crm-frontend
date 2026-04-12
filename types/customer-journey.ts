// Customer Journey / Sales Funnel Types

export interface JourneyStage {
  id: string;
  name: string;
  description?: string;
  count: number;
  percentage: number;
  color: string;
  category: JourneyCategory;
  order: number;
}

export enum JourneyCategory {
  AWARENESS = "Nhận Thức (Awareness)",
  DISCOVERY = "Tìm Kiếm",
  CONSIDERATION = "Cân Nhắc",
  SUCCESS = "Thành công",
  POST_SALES = "Hậu giao dịch",
  POST_SALES_ADVANCED = "Hậu Giao Dịch (Post-Sales)",
}

export interface CustomerJourneyData {
  category: JourneyCategory;
  stages: JourneyStage[];
  totalCount: number;
}

// Journey stage mapping
export const JOURNEY_STAGES = {
  // Awareness
  DATA_MOI: {
    id: "data_moi",
    name: "Data mới",
    description: "Là khách hàng mới lại, dữ liệu ban đầu được dụng dịch vụ hoặc mới để có thông tin khử và chưa dụng dịch vụ lần nào",
    category: JourneyCategory.AWARENESS,
    color: "border-gray-600",
  },
  
  // Discovery
  DA_TU_VAN: {
    id: "da_tu_van",
    name: "Đã tư vấn",
    description: "Đã góp dụng - Đã tụập đễ",
    category: JourneyCategory.DISCOVERY,
    color: "border-orange-500",
  },
  DA_LIEN_HE: {
    id: "da_lien_he",
    name: "Đã liên hệ",
    category: JourneyCategory.DISCOVERY,
    color: "border-orange-600",
  },
  DA_TEST_DAU_VAO: {
    id: "da_test_dau_vao",
    name: "Đã test đầu vào",
    category: JourneyCategory.DISCOVERY,
    color: "border-orange-500",
  },
  
  // Consideration
  DANG_CAN_NHAC: {
    id: "dang_can_nhac",
    name: "Đang cân nhắc",
    category: JourneyCategory.CONSIDERATION,
    color: "border-yellow-500",
  },
  KHONG_DANG_KI: {
    id: "khong_dang_ki",
    name: "Không đăng kí",
    category: JourneyCategory.CONSIDERATION,
    color: "border-yellow-600",
  },
  
  // Success
  CHUA_LIEN_HE_DUOC: {
    id: "chua_lien_he_duoc",
    name: "Chưa liên hệ được",
    category: JourneyCategory.SUCCESS,
    color: "border-green-500",
  },
  DA_DANG_KY: {
    id: "da_dang_ky",
    name: "Đã đăng ký",
    category: JourneyCategory.SUCCESS,
    color: "border-green-600",
  },
  
  // Post-Sales
  UPSELL: {
    id: "upsell",
    name: "Upsell",
    category: JourneyCategory.POST_SALES,
    color: "border-cyan-500",
  },
  
  // Post-Sales Advanced
  KHAO_SAT: {
    id: "khao_sat",
    name: "Khảo sát",
    category: JourneyCategory.POST_SALES_ADVANCED,
    color: "border-purple-600",
  },
  DOI_TAC: {
    id: "doi_tac",
    name: "Đợi tác",
    description: "Là khách hàng có quỹ lẩ sử dụng dịch vụ tẩn 2 lẩ. Hẹn đều dựợi 5 lần quay lạ",
    category: JourneyCategory.POST_SALES_ADVANCED,
    color: "border-blue-600",
  },
  HEN_THAT_BAI: {
    id: "hen_that_bai",
    name: "Hẹn thất bại",
    category: JourneyCategory.POST_SALES_ADVANCED,
    color: "border-red-500",
  },
  GUI_BAO_GIA: {
    id: "gui_bao_gia",
    name: "Gửi báo giá",
    category: JourneyCategory.POST_SALES_ADVANCED,
    color: "border-orange-600",
  },
  DAU_VISA_HOAN_TAT: {
    id: "dau_visa_hoan_tat",
    name: "Dấu visa - Hoàn tất",
    category: JourneyCategory.POST_SALES_ADVANCED,
    color: "border-purple-500",
  },
  MAT_KHACH: {
    id: "mat_khach",
    name: "Mất khách",
    category: JourneyCategory.POST_SALES_ADVANCED,
    color: "border-green-700",
  },
  DA_SU_DUNG_DICH_VU: {
    id: "da_su_dung_dich_vu",
    name: "Đã sử dụng dịch vụ",
    category: JourneyCategory.POST_SALES_ADVANCED,
    color: "border-green-600",
  },
};

export type JourneyStageId = keyof typeof JOURNEY_STAGES;
