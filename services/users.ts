import { apiClient } from "@/lib/api-client";
import { GetMyInfoResponse } from "@/types/api";

const USERS_MY_INFO_ENDPOINT = "/api/v1.0/users/getMyInfo";

export const usersService = {
    async getMyInfo(): Promise<GetMyInfoResponse> {
        return apiClient.get<GetMyInfoResponse>(USERS_MY_INFO_ENDPOINT);
    },
};
