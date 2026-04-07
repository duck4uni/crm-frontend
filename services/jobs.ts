import { apiClient } from "@/lib/api-client";
import {
    GetJobsResponse,
    GetJobResponse,
    CreateJobsResponse,
    UpdateJobResponse,
    DeleteJobResponse,
    BulkUpdateJobResponse,
    BulkDeleteJobResponse,
    CreateJobPayload,
    UpdateJobPayload,
    PaginatedParams,
} from "@/types/api";

const JOBS_ENDPOINT = "/api/v1.0/job";

export const jobsService = {
    async getJobs(params?: PaginatedParams): Promise<GetJobsResponse> {
        return apiClient.get<GetJobsResponse>(JOBS_ENDPOINT, params);
    },

    async getJob(id: string): Promise<GetJobResponse> {
        return apiClient.get<GetJobResponse>(`${JOBS_ENDPOINT}/${id}`);
    },

    async createJobs(payload: CreateJobPayload[]): Promise<CreateJobsResponse> {
        return apiClient.post<CreateJobsResponse>(JOBS_ENDPOINT, payload);
    },

    async updateJob(id: string, payload: UpdateJobPayload): Promise<UpdateJobResponse> {
        return apiClient.put<UpdateJobResponse>(`${JOBS_ENDPOINT}/${id}`, payload);
    },

    async deleteJob(id: string): Promise<DeleteJobResponse> {
        return apiClient.delete<DeleteJobResponse>(`${JOBS_ENDPOINT}/${id}`);
    },

    async bulkUpdateJobs(filters: string, payload: UpdateJobPayload): Promise<BulkUpdateJobResponse> {
        const query = new URLSearchParams({ filters }).toString();
        return apiClient.put<BulkUpdateJobResponse>(`${JOBS_ENDPOINT}?${query}`, payload);
    },

    async bulkDeleteJobs(filters: string): Promise<BulkDeleteJobResponse> {
        return apiClient.delete<BulkDeleteJobResponse>(`${JOBS_ENDPOINT}?filters=${encodeURIComponent(filters)}`);
    },
};
