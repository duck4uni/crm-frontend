import { apiClient } from "@/lib/api-client";
import { Deal } from "@/types";
import { PaginatedResponse, DealsFilters } from "@/types/api";

export const dealsService = {
  async getDeals(filters?: DealsFilters): Promise<PaginatedResponse<Deal>> {
    return apiClient.get<PaginatedResponse<Deal>>("/deals", filters);
  },

  async getDeal(id: string): Promise<Deal> {
    return apiClient.get<Deal>(`/deals/${id}`);
  },

  async createDeal(data: Partial<Deal>): Promise<Deal> {
    return apiClient.post<Deal>("/deals", data);
  },

  async updateDeal(id: string, data: Partial<Deal>): Promise<Deal> {
    return apiClient.put<Deal>(`/deals/${id}`, data);
  },

  async deleteDeal(id: string): Promise<void> {
    return apiClient.delete<void>(`/deals/${id}`);
  },
};
