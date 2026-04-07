import { apiClient } from "@/lib/api-client";
import { GetLogsResponse } from "@/types/api";

const LOGS_ENDPOINT = "/logs/getAllWithinTimeRange";

export const logsService = {
    async getLogs(fromDate?: string, toDate?: string): Promise<GetLogsResponse> {
        const params: Record<string, string> = {};
        if (fromDate) params.fromDate = fromDate;
        if (toDate) params.toDate = toDate;
        return apiClient.get<GetLogsResponse>(LOGS_ENDPOINT, params);
    },
};
