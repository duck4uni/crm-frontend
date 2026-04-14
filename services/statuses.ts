import { apiClient } from "@/lib/api-client";
import {
    GetStatusesResponse,
    GetStatusResponse,
    PaginatedParams,
} from "@/types/api";

const STATUSES_ENDPOINT = "/api/v1.0/status";

export const statusesService = {
    async getStatuses(params?: PaginatedParams): Promise<GetStatusesResponse> {
        return apiClient.get<GetStatusesResponse>(STATUSES_ENDPOINT, params);
    },

    async getStatus(id: string): Promise<GetStatusResponse> {
        return apiClient.get<GetStatusResponse>(`${STATUSES_ENDPOINT}/${id}`);
    },
};
