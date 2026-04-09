import { apiClient } from "@/lib/api-client";
import {
  CreateCustomerPayload,
  CreateCustomerResponse,
  DeleteCustomerResponse,
  ExportCustomersPayload,
  GetCustomerListResponse,
  GetCustomerResponse,
  ImportCustomersResponse,
  PaginatedParams,
  UpdateCustomerPayload,
  UpdateCustomerResponse,
} from "@/types/api";

const CUSTOMERS_ENDPOINT = "/api/v1.0/customers";
const CUSTOMERS_IMPORT_ENDPOINT = "/api/v1.0/customers/import";
const CUSTOMERS_EXPORT_ENDPOINT = "/api/v1.0/customers/export";

export const customersService = {
  async getCustomers(params?: PaginatedParams): Promise<GetCustomerListResponse> {
    return apiClient.get<GetCustomerListResponse>(CUSTOMERS_ENDPOINT, params);
  },

  async getCustomer(id: string): Promise<GetCustomerResponse> {
    return apiClient.get<GetCustomerResponse>(`${CUSTOMERS_ENDPOINT}/${id}`);
  },

  async createCustomer(payload: CreateCustomerPayload): Promise<CreateCustomerResponse> {
    return apiClient.post<CreateCustomerResponse>(CUSTOMERS_ENDPOINT, payload);
  },

  async updateCustomer(id: string, payload: UpdateCustomerPayload): Promise<UpdateCustomerResponse> {
    return apiClient.put<UpdateCustomerResponse>(`${CUSTOMERS_ENDPOINT}/${id}`, payload);
  },

  async deleteCustomer(id: string): Promise<DeleteCustomerResponse> {
    return apiClient.delete<DeleteCustomerResponse>(`${CUSTOMERS_ENDPOINT}/${id}`);
  },

  async importCustomers(file: File): Promise<ImportCustomersResponse> {
    return apiClient.upload<ImportCustomersResponse>(CUSTOMERS_IMPORT_ENDPOINT, file);
  },

  async exportCustomers(payload?: ExportCustomersPayload): Promise<Blob> {
    return apiClient.downloadBlob(CUSTOMERS_EXPORT_ENDPOINT, payload);
  },
};
