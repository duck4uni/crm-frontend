import { apiClient } from "@/lib/api-client";
import {
    GetUserTagsResponse,
    GetUserTagResponse,
    CreateUserTagsResponse,
    UpdateUserTagResponse,
    DeleteUserTagResponse,
    CreateUserTagPayload,
    UpdateUserTagPayload,
    PaginatedParams,
} from "@/types/api";

const USER_TAGS_ENDPOINT = "/api/v1.0/user_tags";

function buildEqualsFilter(field: string, value: string): string {
    return `${field}==${value}`;
}

export const userTagsService = {
    async getUserTags(params?: PaginatedParams): Promise<GetUserTagsResponse> {
        return apiClient.get<GetUserTagsResponse>(USER_TAGS_ENDPOINT, params);
    },

    async getUserTagsByUserId(
        userId: string,
        params?: Omit<PaginatedParams, "filters">,
    ): Promise<GetUserTagsResponse> {
        return apiClient.get<GetUserTagsResponse>(USER_TAGS_ENDPOINT, {
            ...params,
            filters: buildEqualsFilter("user_id", userId),
        });
    },

    async getUserTagsByTagId(
        tagId: string,
        params?: Omit<PaginatedParams, "filters">,
    ): Promise<GetUserTagsResponse> {
        return apiClient.get<GetUserTagsResponse>(USER_TAGS_ENDPOINT, {
            ...params,
            filters: buildEqualsFilter("tag_id", tagId),
        });
    },

    async getUserTag(id: string): Promise<GetUserTagResponse> {
        return apiClient.get<GetUserTagResponse>(`${USER_TAGS_ENDPOINT}/${id}`);
    },

    async createUserTags(payload: CreateUserTagPayload[]): Promise<CreateUserTagsResponse> {
        return apiClient.post<CreateUserTagsResponse>(USER_TAGS_ENDPOINT, payload);
    },

    async updateUserTag(id: string, payload: UpdateUserTagPayload): Promise<UpdateUserTagResponse> {
        return apiClient.put<UpdateUserTagResponse>(`${USER_TAGS_ENDPOINT}/${id}`, payload);
    },

    async deleteUserTag(id: string): Promise<DeleteUserTagResponse> {
        return apiClient.delete<DeleteUserTagResponse>(`${USER_TAGS_ENDPOINT}/${id}`);
    },
};
