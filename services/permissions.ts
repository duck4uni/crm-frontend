import { apiClient } from "@/lib/api-client";
import {
    GetPermissionsResponse,
    GetPermissionResponse,
    CreatePermissionsResponse,
    UpdatePermissionResponse,
    CreatePermissionPayload,
    UpdatePermissionPayload,
    PaginatedParams,
} from "@/types/api";

const PERMISSIONS_ENDPOINT = "/api/v1.0/permisions";

export const permissionsService = {
    async getPermissions(params?: PaginatedParams): Promise<GetPermissionsResponse> {
        return apiClient.get<GetPermissionsResponse>(PERMISSIONS_ENDPOINT, params);
    },

    async getPermission(id: string): Promise<GetPermissionResponse> {
        return apiClient.get<GetPermissionResponse>(`${PERMISSIONS_ENDPOINT}/${id}`);
    },

    async createPermissions(payload: CreatePermissionPayload[]): Promise<CreatePermissionsResponse> {
        return apiClient.post<CreatePermissionsResponse>(PERMISSIONS_ENDPOINT, payload);
    },

    async updatePermission(id: string, payload: UpdatePermissionPayload): Promise<UpdatePermissionResponse> {
        return apiClient.put<UpdatePermissionResponse>(`${PERMISSIONS_ENDPOINT}/${id}`, payload);
    },
};
