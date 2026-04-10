import { apiClient } from "@/lib/api-client";
import {
  CreateCustomerTagPayload,
  CreateCustomerTagsResponse,
  DeleteCustomerTagResponse,
  GetCustomerTagResponse,
  GetCustomerTagsResponse,
  PaginatedParams,
  UpdateCustomerTagPayload,
  UpdateCustomerTagResponse,
} from "@/types/api";

const CUSTOMER_TAGS_ENDPOINT = "/api/v1.0/customer_tags";

function buildEqualsFilter(field: string, value: string): string {
  return `${field}==${value}`;
}

export const customerTagsService = {
  async getCustomerTags(params?: PaginatedParams): Promise<GetCustomerTagsResponse> {
    return apiClient.get<GetCustomerTagsResponse>(CUSTOMER_TAGS_ENDPOINT, params);
  },

  async getCustomerTagsByCustomerId(
    customerId: string,
    params?: Omit<PaginatedParams, "filters">,
  ): Promise<GetCustomerTagsResponse> {
    return apiClient.get<GetCustomerTagsResponse>(CUSTOMER_TAGS_ENDPOINT, {
      ...params,
      filters: buildEqualsFilter("customer_id", customerId),
    });
  },

  async getCustomerTagsByTagId(
    tagId: string,
    params?: Omit<PaginatedParams, "filters">,
  ): Promise<GetCustomerTagsResponse> {
    return apiClient.get<GetCustomerTagsResponse>(CUSTOMER_TAGS_ENDPOINT, {
      ...params,
      filters: buildEqualsFilter("tag_id", tagId),
    });
  },

  async getCustomerTag(id: string): Promise<GetCustomerTagResponse> {
    return apiClient.get<GetCustomerTagResponse>(`${CUSTOMER_TAGS_ENDPOINT}/${id}`);
  },

  async createCustomerTags(payload: CreateCustomerTagPayload[]): Promise<CreateCustomerTagsResponse> {
    return apiClient.post<CreateCustomerTagsResponse>(CUSTOMER_TAGS_ENDPOINT, payload);
  },

  async updateCustomerTag(id: string, payload: UpdateCustomerTagPayload): Promise<UpdateCustomerTagResponse> {
    return apiClient.put<UpdateCustomerTagResponse>(`${CUSTOMER_TAGS_ENDPOINT}/${id}`, payload);
  },

  async deleteCustomerTag(id: string): Promise<DeleteCustomerTagResponse> {
    return apiClient.delete<DeleteCustomerTagResponse>(`${CUSTOMER_TAGS_ENDPOINT}/${id}`);
  },
};
