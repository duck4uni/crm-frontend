import { apiClient } from "@/lib/api-client";
import { Company } from "@/types";
import { PaginatedResponse, CompaniesFilters } from "@/types/api";

export const companiesService = {
  async getCompanies(
    filters?: CompaniesFilters,
  ): Promise<PaginatedResponse<Company>> {
    return apiClient.get<PaginatedResponse<Company>>("/companies", filters);
  },

  async getCompany(id: string): Promise<Company> {
    return apiClient.get<Company>(`/companies/${id}`);
  },

  async createCompany(data: Partial<Company>): Promise<Company> {
    return apiClient.post<Company>("/companies", data);
  },

  async updateCompany(id: string, data: Partial<Company>): Promise<Company> {
    return apiClient.put<Company>(`/companies/${id}`, data);
  },

  async deleteCompany(id: string): Promise<void> {
    return apiClient.delete<void>(`/companies/${id}`);
  },
};
