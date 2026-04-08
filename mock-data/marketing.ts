import { Campaign } from "@/types/marketing";

export const initialCampaigns: Campaign[] = [
  {
    id: "camp-1",
    name: "Khuyến mãi bảo trì đầu tháng",
    channel: "zalo_oa_hn",
    segment: "vip",
    scheduledAt: "2026-04-09T09:00",
    message: "Ưu đãi 20% dịch vụ vệ sinh điều hòa trong tuần này.",
    status: "scheduled",
    sent: 0,
    failed: 0,
  },
  {
    id: "camp-2",
    name: "Nhắc lịch kiểm tra máy lạnh",
    channel: "zalo_oa_hcm",
    segment: "inactive",
    scheduledAt: "2026-04-08T14:00",
    message: "Đã đến lịch kiểm tra định kỳ để máy hoạt động ổn định.",
    status: "completed",
    sent: 428,
    failed: 19,
  },
];
