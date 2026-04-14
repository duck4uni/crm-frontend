import { apiClient } from "@/lib/api-client";
import {
  DeleteCustomerAssignedUserResponse,
  GetCustomerAssignedUserResponse,
  GetCustomerAssignedUsersResponse,
  PaginatedParams,
  SetCustomerAssignedUsersPayload,
  SetCustomerAssignedUsersResponse,
  UpdateCustomerAssignedUserPayload,
  UpdateCustomerAssignedUserResponse,
} from "@/types/api";

const CUSTOMER_ASSIGNED_USERS_ENDPOINT = "/api/v1.0/customer_assigned_user";

function buildEqualsFilter(field: string, value: string): string {
  return `${field}==${value}`;
}

export const customerAssignedUsersService = {
  async getCustomerAssignedUsers(params?: PaginatedParams): Promise<GetCustomerAssignedUsersResponse> {
    return apiClient.get<GetCustomerAssignedUsersResponse>(CUSTOMER_ASSIGNED_USERS_ENDPOINT, params);
  },

  async getCustomerAssignedUsersByCustomerId(
    customerId: string,
    params?: Omit<PaginatedParams, "filters">,
  ): Promise<GetCustomerAssignedUsersResponse> {
    return apiClient.get<GetCustomerAssignedUsersResponse>(CUSTOMER_ASSIGNED_USERS_ENDPOINT, {
      ...params,
      filters: buildEqualsFilter("customer_id", customerId),
    });
  },

  async getCustomerAssignedUser(id: string): Promise<GetCustomerAssignedUserResponse> {
    return apiClient.get<GetCustomerAssignedUserResponse>(`${CUSTOMER_ASSIGNED_USERS_ENDPOINT}/${id}`);
  },

  async setCustomerAssignedUsers(
    payload: SetCustomerAssignedUsersPayload,
  ): Promise<SetCustomerAssignedUsersResponse> {
    return apiClient.post<SetCustomerAssignedUsersResponse>(CUSTOMER_ASSIGNED_USERS_ENDPOINT, payload);
  },

  async updateCustomerAssignedUser(
    id: string,
    payload: UpdateCustomerAssignedUserPayload,
  ): Promise<UpdateCustomerAssignedUserResponse> {
    return apiClient.put<UpdateCustomerAssignedUserResponse>(`${CUSTOMER_ASSIGNED_USERS_ENDPOINT}/${id}`, payload);
  },

  async deleteCustomerAssignedUser(id: string): Promise<DeleteCustomerAssignedUserResponse> {
    return apiClient.delete<DeleteCustomerAssignedUserResponse>(`${CUSTOMER_ASSIGNED_USERS_ENDPOINT}/${id}`);
  },
};
