import {
    AdminUserApiRow,
    CustomerApiRow,
    JobApiRow,
    StatusApiRow,
} from "@/types/api";
import { getStatusVariantFromName, type StatusVariant } from "@/lib/utils";

const WORKER_PERMISSION_NAME = "SITE WORKER";

export const toDateTimeLocal = (value?: string | null): string => {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const pad = (part: number) => String(part).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const normalizeJobStatuses = (statuses: StatusApiRow[]): StatusApiRow[] => {
    const filteredStatuses = statuses.filter((status) => {
        const type = (status.type ?? "").toLowerCase();
        const code = (status.code ?? "").toLowerCase();
        return type.includes("job") || code.includes("job");
    });

    return filteredStatuses.length > 0 ? filteredStatuses : statuses;
};

export const getStatusVariant = (
    statusCode?: string | null,
    statusName?: string | null,
): StatusVariant => {
    if (statusCode) {
        const normalizedCode = statusCode.toLowerCase();

        if (normalizedCode.includes("done") || normalizedCode.includes("success") || normalizedCode.includes("completed")) {
            return "success";
        }

        if (normalizedCode.includes("cancel") || normalizedCode.includes("reject") || normalizedCode.includes("failed")) {
            return "danger";
        }

        if (normalizedCode.includes("progress") || normalizedCode.includes("doing") || normalizedCode.includes("processing")) {
            return "info";
        }

        if (normalizedCode.includes("pending") || normalizedCode.includes("todo") || normalizedCode.includes("new")) {
            return "warning";
        }
    }

    if (statusName) {
        return getStatusVariantFromName(statusName);
    }

    return "default";
};

export const buildCustomerLabel = (customer: CustomerApiRow) => {
    const fullName = customer.full_name?.trim();
    if (fullName) {
        return fullName;
    }

    const displayName = `${customer.last_name ?? ""} ${customer.first_name ?? ""}`.trim();
    return displayName || customer.email || customer.id;
};

export const hasWorkerPermission = (user: AdminUserApiRow): boolean => {
    return (user.user_permisions || []).some(
        (permission) => permission.permision?.name?.trim().toUpperCase() === WORKER_PERMISSION_NAME,
    );
};

export const getFormTimeFromApi = (jobTime: JobApiRow["job_time"]): { start: string; end: string } => {
    if (Array.isArray(jobTime)) {
        const firstRange = jobTime[0];
        return {
            start: firstRange?.start ?? "",
            end: firstRange?.end ?? "",
        };
    }

    const singleRange = jobTime ?? {};
    return {
        start: singleRange.start ?? "",
        end: singleRange.end ?? "",
    };
};
