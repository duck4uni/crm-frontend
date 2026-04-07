import { apiClient } from "@/lib/api-client";
import {
    GetTagsResponse,
    GetTagResponse,
    CreateTagResponse,
    UpdateTagResponse,
    DeleteTagResponse,
    CreateTagPayload,
    UpdateTagPayload,
    PaginatedParams,
} from "@/types/api";

const TAGS_ENDPOINT = "/api/v1.0/tags";

export const tagsService = {
    async getTags(params?: PaginatedParams): Promise<GetTagsResponse> {
        return apiClient.get<GetTagsResponse>(TAGS_ENDPOINT, params);
    },

    async getTag(id: string): Promise<GetTagResponse> {
        return apiClient.get<GetTagResponse>(`${TAGS_ENDPOINT}/${id}`);
    },

    async createTag(payload: CreateTagPayload): Promise<CreateTagResponse> {
        return apiClient.post<CreateTagResponse>(TAGS_ENDPOINT, payload);
    },

    async updateTag(id: string, payload: UpdateTagPayload): Promise<UpdateTagResponse> {
        return apiClient.put<UpdateTagResponse>(`${TAGS_ENDPOINT}/${id}`, payload);
    },

    async deleteTag(id: string): Promise<DeleteTagResponse> {
        return apiClient.delete<DeleteTagResponse>(`${TAGS_ENDPOINT}/${id}`);
    },
};
