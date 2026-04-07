import { apiClient } from "@/lib/api-client";
import {
    GetFilesResponse,
    UploadFileResponse,
    DeleteFileResponse,
} from "@/types/api";

const FILES_ENDPOINT = "/api/v1.0/files";

export const filesService = {
    async getFiles(): Promise<GetFilesResponse> {
        return apiClient.get<GetFilesResponse>(FILES_ENDPOINT);
    },

    async uploadFile(file: File): Promise<UploadFileResponse> {
        return apiClient.upload<UploadFileResponse>(FILES_ENDPOINT, file);
    },

    async deleteFile(filePath: string): Promise<DeleteFileResponse> {
        return apiClient.delete<DeleteFileResponse>(FILES_ENDPOINT, { filePath });
    },
};
