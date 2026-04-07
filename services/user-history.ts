import { apiClient } from "@/lib/api-client";
import {
    GetUserHistoriesResponse,
    GetUserHistoryResponse,
    CreateUserHistoriesResponse,
    UpdateUserHistoryResponse,
    DeleteUserHistoryResponse,
    BulkUpdateUserHistoryResponse,
    CreateUserHistoryPayload,
    UpdateUserHistoryPayload,
    PaginatedParams,
} from "@/types/api";

const USER_HISTORY_ENDPOINT = "/api/v1.0/user_history";

export const userHistoryService = {
    async getUserHistories(params?: PaginatedParams): Promise<GetUserHistoriesResponse> {
        return apiClient.get<GetUserHistoriesResponse>(USER_HISTORY_ENDPOINT, params);
    },

    async getUserHistory(id: string): Promise<GetUserHistoryResponse> {
        return apiClient.get<GetUserHistoryResponse>(`${USER_HISTORY_ENDPOINT}/${id}`);
    },

    async createUserHistories(payload: CreateUserHistoryPayload[]): Promise<CreateUserHistoriesResponse> {
        return apiClient.post<CreateUserHistoriesResponse>(USER_HISTORY_ENDPOINT, payload);
    },

    async updateUserHistory(id: string, payload: UpdateUserHistoryPayload): Promise<UpdateUserHistoryResponse> {
        return apiClient.put<UpdateUserHistoryResponse>(`${USER_HISTORY_ENDPOINT}/${id}`, payload);
    },

    async deleteUserHistory(id: string): Promise<DeleteUserHistoryResponse> {
        return apiClient.delete<DeleteUserHistoryResponse>(`${USER_HISTORY_ENDPOINT}/${id}`);
    },

    async bulkUpdateUserHistories(filters: string, payload: UpdateUserHistoryPayload): Promise<BulkUpdateUserHistoryResponse> {
        const query = new URLSearchParams({ filters }).toString();
        return apiClient.put<BulkUpdateUserHistoryResponse>(`${USER_HISTORY_ENDPOINT}?${query}`, payload);
    },
};
