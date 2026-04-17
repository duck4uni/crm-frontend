import {
    CustomerApiRow,
    CustomerAssignedUserApiRow,
} from "@/types/api";
import {
    buildAssigneeRolesByUserId,
    type AssigneeRole,
} from "@/lib/assignee-utils";
import { toErrorMessage } from "@/lib/utils";

export interface CustomerLookupItem {
    id: string;
    customerName: string;
    phone?: string;
    assigneeIds: string[];
    leaderAssigneeName: string;
    workerAssigneeName: string;
}

export interface GroupMemberItem extends CustomerLookupItem {
    customerTagId: string;
}

export interface UserOption {
    id: string;
    label: string;
    role: "SITE LEADER" | "SITE WORKER";
}

export const CUSTOMER_PAGE_SIZE = "1000";
export const LINK_PAGE_SIZE = "5000";
export const LEADER_ROLE_NAME = "SITE LEADER";
export const WORKER_ROLE_NAME = "SITE WORKER";
export { buildAssigneeRolesByUserId, toErrorMessage };
export type { AssigneeRole };

export function toCustomerName(row: CustomerApiRow): string {
    return row.full_name || `${row.last_name || ""} ${row.first_name || ""}`.trim() || row.email || row.id;
}

export function mapAssignedUsersByCustomerId(
    rows: CustomerAssignedUserApiRow[],
): Record<string, Array<{ id: string; full_name: string }>> {
    return rows.reduce<Record<string, Array<{ id: string; full_name: string }>>>((acc, row) => {
        const customerId = typeof row.customer_id === "string" ? row.customer_id.trim() : "";
        const assignedUserId = typeof row.assigned_user_id === "string" ? row.assigned_user_id.trim() : "";
        if (!customerId || !assignedUserId) {
            return acc;
        }

        if (!acc[customerId]) {
            acc[customerId] = [];
        }

        if (!acc[customerId].some((item) => item.id === assignedUserId)) {
            acc[customerId].push({
                id: assignedUserId,
                full_name: row.assigned_user?.full_name?.trim() || assignedUserId,
            });
        }

        return acc;
    }, {});
}

export function resolveAssignedUsersForCustomer(
    row: CustomerApiRow,
    assignedUsersByCustomerId: Record<string, Array<{ id: string; full_name: string }>>,
): Array<{ id: string; full_name: string }> {
    const fromAssignmentApi = assignedUsersByCustomerId[row.id] || [];
    if (fromAssignmentApi.length > 0) {
        return fromAssignmentApi;
    }

    const seen = new Set<string>();
    return (row.assigned_users || []).reduce<Array<{ id: string; full_name: string }>>((acc, user) => {
        const id = typeof user?.id === "string" ? user.id.trim() : "";
        if (!id || seen.has(id)) {
            return acc;
        }

        seen.add(id);
        acc.push({
            id,
            full_name: typeof user.full_name === "string" ? user.full_name.trim() || id : id,
        });
        return acc;
    }, []);
}

export function toAssigneeDisplayNameByRole(
    assignedUsers: Array<{ id: string; full_name: string }>,
    assigneeRolesByUserId: Record<string, Set<AssigneeRole>>,
    role: AssigneeRole,
): string {
    const names = assignedUsers
        .filter((user) => assigneeRolesByUserId[user.id]?.has(role))
        .map((user) => user.full_name || user.id)
        .filter(Boolean);

    return names.length > 0 ? names.join("\n") : "-";
}

export function splitAssigneeLines(value?: string): string[] {
    if (!value || value === "-") {
        return ["-"];
    }

    const lines = value
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);

    return lines.length > 0 ? lines : ["-"];
}
