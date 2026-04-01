import { Contact, Company, Deal, Task, Activity, User } from "@/types";
import {
  DashboardStats,
  RevenueData,
  DealsByStage,
  TopPerformer,
} from "@/types/dashboard";

// Mock data for development
export const mockContacts: Contact[] = [
  {
    id: "1",
    firstName: "An",
    lastName: "Nguyen",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    companyId: "1",
    companyName: "Acme Corp",
    position: "Giám đốc điều hành",
    status: "active" as any,
    tags: ["doanh-nghiệp", "tiềm-năng-cao"],
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-03-20"),
    lastContactedAt: new Date("2024-03-18"),
  },
  {
    id: "2",
    firstName: "Bình",
    lastName: "Trần",
    email: "jane.smith@techco.com",
    phone: "+1 (555) 234-5678",
    companyId: "2",
    companyName: "TechCo Industries",
    position: "Giám đốc công nghệ",
    status: "active" as any,
    tags: ["công-nghệ", "người-ra-quyết-định"],
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-03-22"),
  },
];

export const mockCompanies: Company[] = [
  {
    id: "1",
    name: "Acme Corp",
    industry: "Công nghệ",
    size: "1000-5000",
    website: "https://acmecorp.com",
    email: "contact@acmecorp.com",
    phone: "+1 (555) 100-2000",
    status: "active" as any,
    tags: ["doanh-nghiệp", "đối-tác"],
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-03-20"),
  },
  {
    id: "2",
    name: "TechCo Industries",
    industry: "Phần mềm",
    size: "500-1000",
    website: "https://techco.com",
    status: "active" as any,
    tags: ["công-nghệ", "dịch-vụ"],
    createdAt: new Date("2024-01-25"),
    updatedAt: new Date("2024-03-22"),
  },
];

export const mockDeals: Deal[] = [
  {
    id: "1",
    title: "Gói bản quyền phần mềm doanh nghiệp",
    value: 150000,
    currency: "USD",
    stage: "negotiation" as any,
    probability: 75,
    companyId: "1",
    ownerId: "user-1",
    expectedCloseDate: new Date("2024-04-30"),
    status: "open" as any,
    tags: ["doanh-nghiệp", "giá-trị-cao"],
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-03-20"),
  },
  {
    id: "2",
    title: "Gói dịch vụ tư vấn",
    value: 50000,
    currency: "USD",
    stage: "proposal" as any,
    probability: 60,
    companyId: "2",
    ownerId: "user-1",
    expectedCloseDate: new Date("2024-04-15"),
    status: "open" as any,
    tags: ["dịch-vụ", "tái-diễn"],
    createdAt: new Date("2024-02-15"),
    updatedAt: new Date("2024-03-22"),
  },
];

export const mockTasks: Task[] = [
  {
    id: "1",
    title: "Theo dõi trao đổi với An Nguyen",
    description: "Trao đổi điều khoản hợp đồng và mức giá",
    dueDate: new Date("2024-03-28"),
    priority: "high" as any,
    status: "todo" as any,
    assignedTo: "user-1",
    relatedToType: "contact",
    relatedToId: "1",
    tags: ["theo-dõi"],
    createdAt: new Date("2024-03-20"),
    updatedAt: new Date("2024-03-20"),
  },
  {
    id: "2",
    title: "Chuẩn bị đề xuất cho TechCo",
    description: "Bao gồm chi tiết giá và tiến độ triển khai",
    dueDate: new Date("2024-03-26"),
    priority: "urgent" as any,
    status: "in_progress" as any,
    assignedTo: "user-1",
    relatedToType: "deal",
    relatedToId: "2",
    tags: ["đề-xuất"],
    createdAt: new Date("2024-03-22"),
    updatedAt: new Date("2024-03-24"),
  },
];

export const mockDashboardStats: DashboardStats = {
  totalContacts: 247,
  totalCompanies: 89,
  activeDeals: 34,
  totalRevenue: 2450000,
  monthlyRevenue: 425000,
  dealsWonThisMonth: 12,
  tasksOverdue: 5,
  tasksDueToday: 8,
};

export const mockRevenueData: RevenueData[] = [
  { month: "T1", revenue: 320000 },
  { month: "T2", revenue: 380000 },
  { month: "T3", revenue: 425000 },
];

export const mockDealsByStage: DealsByStage[] = [
  { stage: "Tiềm năng", count: 12, value: 450000 },
  { stage: "Đánh giá", count: 8, value: 320000 },
  { stage: "Đề xuất", count: 6, value: 580000 },
  { stage: "Đàm phán", count: 5, value: 750000 },
];
