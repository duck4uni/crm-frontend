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
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    companyId: "1",
    companyName: "Acme Corp",
    position: "CEO",
    status: "active" as any,
    tags: ["enterprise", "hot-lead"],
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-03-20"),
    lastContactedAt: new Date("2024-03-18"),
  },
  {
    id: "2",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@techco.com",
    phone: "+1 (555) 234-5678",
    companyId: "2",
    companyName: "TechCo Industries",
    position: "CTO",
    status: "active" as any,
    tags: ["technology", "decision-maker"],
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-03-22"),
  },
];

export const mockCompanies: Company[] = [
  {
    id: "1",
    name: "Acme Corp",
    industry: "Technology",
    size: "1000-5000",
    website: "https://acmecorp.com",
    email: "contact@acmecorp.com",
    phone: "+1 (555) 100-2000",
    status: "active" as any,
    tags: ["enterprise", "partner"],
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-03-20"),
  },
  {
    id: "2",
    name: "TechCo Industries",
    industry: "Software",
    size: "500-1000",
    website: "https://techco.com",
    status: "active" as any,
    tags: ["technology", "saas"],
    createdAt: new Date("2024-01-25"),
    updatedAt: new Date("2024-03-22"),
  },
];

export const mockDeals: Deal[] = [
  {
    id: "1",
    title: "Enterprise Software License",
    value: 150000,
    currency: "USD",
    stage: "negotiation" as any,
    probability: 75,
    companyId: "1",
    ownerId: "user-1",
    expectedCloseDate: new Date("2024-04-30"),
    status: "open" as any,
    tags: ["enterprise", "high-value"],
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-03-20"),
  },
  {
    id: "2",
    title: "Consulting Services Package",
    value: 50000,
    currency: "USD",
    stage: "proposal" as any,
    probability: 60,
    companyId: "2",
    ownerId: "user-1",
    expectedCloseDate: new Date("2024-04-15"),
    status: "open" as any,
    tags: ["services", "recurring"],
    createdAt: new Date("2024-02-15"),
    updatedAt: new Date("2024-03-22"),
  },
];

export const mockTasks: Task[] = [
  {
    id: "1",
    title: "Follow up with John Doe",
    description: "Discuss contract terms and pricing",
    dueDate: new Date("2024-03-28"),
    priority: "high" as any,
    status: "todo" as any,
    assignedTo: "user-1",
    relatedToType: "contact",
    relatedToId: "1",
    tags: ["follow-up"],
    createdAt: new Date("2024-03-20"),
    updatedAt: new Date("2024-03-20"),
  },
  {
    id: "2",
    title: "Prepare proposal for TechCo",
    description: "Include pricing breakdown and timeline",
    dueDate: new Date("2024-03-26"),
    priority: "urgent" as any,
    status: "in_progress" as any,
    assignedTo: "user-1",
    relatedToType: "deal",
    relatedToId: "2",
    tags: ["proposal"],
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
  { month: "Jan", revenue: 320000 },
  { month: "Feb", revenue: 380000 },
  { month: "Mar", revenue: 425000 },
];

export const mockDealsByStage: DealsByStage[] = [
  { stage: "Prospecting", count: 12, value: 450000 },
  { stage: "Qualification", count: 8, value: 320000 },
  { stage: "Proposal", count: 6, value: 580000 },
  { stage: "Negotiation", count: 5, value: 750000 },
];
