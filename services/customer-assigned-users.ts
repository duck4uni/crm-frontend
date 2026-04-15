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

function normalizeUniqueIds(ids: string[]): string[] {
  return Array.from(
    new Set(
      ids
        .map((id) => (typeof id === "string" ? id.trim() : ""))
        .filter(Boolean),
    ),
  );
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

  async syncCustomerAssignedUsers(customerId: string, assignedUserIds: string[]): Promise<void> {
    const normalizedAssignedUserIds = normalizeUniqueIds(assignedUserIds);
    const existingResponse = await this.getCustomerAssignedUsersByCustomerId(customerId, {
      currentPage: "1",
      pageSize: "5000",
    });

    const existingRows = existingResponse.responseData?.rows || [];
    const desiredUserIdSet = new Set(normalizedAssignedUserIds);
    const seenAssignedUserIds = new Set<string>();
    const rowsToDelete = existingRows.filter((row) => {
      const assignedUserId = typeof row.assigned_user_id === "string" ? row.assigned_user_id.trim() : "";
      if (!assignedUserId) {
        return true;
      }

      if (!desiredUserIdSet.has(assignedUserId)) {
        return true;
      }

      if (seenAssignedUserIds.has(assignedUserId)) {
        return true;
      }

      seenAssignedUserIds.add(assignedUserId);
      return false;
    });

    if (rowsToDelete.length > 0) {
      await Promise.all(rowsToDelete.map((row) => this.deleteCustomerAssignedUser(row.id)));
    }

    const usersToCreate = normalizedAssignedUserIds.filter((id) => !seenAssignedUserIds.has(id));
    if (usersToCreate.length > 0) {
      await this.setCustomerAssignedUsers({
        customer_id: customerId,
        assigned_user_ids: usersToCreate,
      });
    }
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
