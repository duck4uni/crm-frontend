import { apiClient } from "@/lib/api-client";
import {
  DashboardStats,
  RevenueData,
  DealsByStage,
  TopPerformer,
} from "@/types/dashboard";

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    return apiClient.get<DashboardStats>("/dashboard/stats");
  },

  async getRevenueData(): Promise<RevenueData[]> {
    return apiClient.get<RevenueData[]>("/dashboard/revenue");
  },

  async getDealsByStage(): Promise<DealsByStage[]> {
    return apiClient.get<DealsByStage[]>("/dashboard/deals-by-stage");
  },

  async getTopPerformers(): Promise<TopPerformer[]> {
    return apiClient.get<TopPerformer[]>("/dashboard/top-performers");
  },
};
