import {
    AdminUserApiRow,
    CustomerApiRow,
    CustomerAssignedUserApiRow,
    JobApiRow,
    UpdateCustomerPayload,
} from "@/types/api";
import { Customer, CustomerStatus } from "@/types/customer";
import {
    buildAllowedAssigneeIdSet,
    buildAssigneeRolesByUserId,
    type AssigneeRole,
} from "@/lib/assignee-utils";
import {
    formatDateToApi,
    getStatusVariantFromName,
    normalizeLoose,
    normalizeWhitespace,
} from "@/lib/utils";

export { buildAllowedAssigneeIdSet, buildAssigneeRolesByUserId };
export type { AssigneeRole };
export type AssignedUser = { id: string; full_name: string };

export function filterAssignedUsersByAllowedIds(
    users: AssignedUser[],
    allowedAssigneeIds: Set<string>,
): AssignedUser[] {
    if (allowedAssigneeIds.size === 0) {
        return [];
    }

    return users.filter((user) => allowedAssigneeIds.has(user.id));
}

function mapCustomerTypeToApi(type?: string): string {
    const normalized = normalizeLoose(type || "");

    if (!normalized || normalized === "individual" || normalized === "ca nhan") {
        return "Cá nhân";
    }

    if (normalized === "company" || normalized === "doanh nghiep") {
        return "Doanh nghiệp";
    }

    return (type || "Cá nhân").trim();
}

function mapCustomerGenderToApi(gender?: Customer["gender"]): string | undefined {
    if (gender === "Male") {
        return "Nam";
    }

    if (gender === "Female") {
        return "Nữ";
    }

    if (gender === "Other") {
        return "Khác";
    }

    return undefined;
}

function mapApiGenderToCustomer(gender?: string | null): Customer["gender"] {
    const normalized = (gender || "").toLowerCase();

    if (["male", "nam"].includes(normalized)) {
        return "Male";
    }

    if (["female", "nu", "nữ"].includes(normalized)) {
        return "Female";
    }

    return "Other";
}

function mapStatusToIsActive(status?: Customer["status"]): boolean | undefined {
    if (!status) {
        return undefined;
    }

    return status !== "not_contacted";
}

export function resolveAssignedUserIds(data: Partial<Customer>): string[] {
    const idsFromField = Array.isArray(data.assigned_user_ids) ? data.assigned_user_ids : [];
    const idsFromUsers = Array.isArray(data.assigned_users)
        ? data.assigned_users.map((user) => user?.id || "")
        : [];
    const singleId = typeof data.assigned_user_id === "string" ? data.assigned_user_id : "";

    return Array.from(
        new Set(
            [...idsFromField, ...idsFromUsers, singleId]
                .map((id) => (typeof id === "string" ? id.trim() : ""))
                .filter(Boolean),
        ),
    );
}

export function mapFormToUpdatePayload(data: Partial<Customer>): UpdateCustomerPayload {
    const firstName = normalizeWhitespace(String(data.first_name || ""));
    const lastName = normalizeWhitespace(String(data.last_name || ""));

    return {
        first_name: firstName,
        last_name: lastName,
        description: normalizeWhitespace(data.description || "") || undefined,
        type: mapCustomerTypeToApi(data.type),
        email: normalizeWhitespace(data.email || "") || undefined,
        phone: (data.phone || "").trim() || undefined,
        address: normalizeWhitespace(data.address || "") || undefined,
        website: normalizeWhitespace(data.website || "") || undefined,
        gender: mapCustomerGenderToApi(data.gender),
        day_of_birth: formatDateToApi(data.day_of_birth),
        note: normalizeWhitespace(data.note || "") || undefined,
        company_name: data.company_name || undefined,
        company_establish_date: formatDateToApi(data.company_establish_date),
        tax_code: data.tax_code || undefined,
        major: data.major || undefined,
        is_active: data.is_active ?? mapStatusToIsActive(data.status),
    };
}

function toAssignedUsersFromApiRows(customerId: string, rows: CustomerAssignedUserApiRow[]): AssignedUser[] {
    const seen = new Set<string>();

    return rows.reduce<AssignedUser[]>((acc, row) => {
        if (row.customer_id !== customerId) {
            return acc;
        }

        const assignedUserId = typeof row.assigned_user_id === "string" ? row.assigned_user_id.trim() : "";
        if (!assignedUserId || seen.has(assignedUserId)) {
            return acc;
        }

        seen.add(assignedUserId);
        acc.push({
            id: assignedUserId,
            full_name: row.assigned_user?.full_name?.trim() || assignedUserId,
        });

        return acc;
    }, []);
}

export function resolveAssignedUsers(
    row: CustomerApiRow,
    assignedUserRows: CustomerAssignedUserApiRow[],
): AssignedUser[] {
    const fromAssignedUserApi = toAssignedUsersFromApiRows(row.id, assignedUserRows);
    if (fromAssignedUserApi.length > 0) {
        return fromAssignedUserApi;
    }

    const seen = new Set<string>();
    return (row.assigned_users || []).reduce<AssignedUser[]>((acc, user) => {
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

function formatAssignedUsersByRole(
    assignedUsers: AssignedUser[],
    assigneeRolesByUserId: Record<string, Set<AssigneeRole>>,
    role: AssigneeRole,
): string {
    const names = assignedUsers
        .filter((user) => assigneeRolesByUserId[user.id]?.has(role))
        .map((user) => user.full_name || user.id)
        .filter(Boolean);

    return names.length > 0 ? names.join(", ") : "";
}

export function mapApiRowToCustomerDetail(
    row: CustomerApiRow,
    assignedUsers: AssignedUser[],
    assigneeRolesByUserId: Record<string, Set<AssigneeRole>>,
    groupNames: string[],
): Customer {
    const customerName =
        row.full_name || `${row.last_name || ""} ${row.first_name || ""}`.trim() || row.email || "Khach hang";

    const assigneeName = assignedUsers.map((user) => user.full_name || user.id).filter(Boolean).join(", ");
    const leaderAssignee = formatAssignedUsersByRole(assignedUsers, assigneeRolesByUserId, "leader");
    const workerAssignee = formatAssignedUsersByRole(assignedUsers, assigneeRolesByUserId, "worker");

    return {
        id: row.id,
        orderNumber: 1,
        customerName,
        email: row.email || undefined,
        phone: row.phone || "",
        address: row.address || "",
        salutation: row.gender?.toLowerCase() === "female" ? "Chị" : "Anh",
        mobilePhone: row.phone || "",
        source: row.website || "",
        assignee: assigneeName,
        leader_assignee: leaderAssignee,
        worker_assignee: workerAssignee,
        relationship: row.note || "",
        lastContactDate: row.updated_at ? new Date(row.updated_at) : undefined,
        createdDate: row.created_at ? new Date(row.created_at) : new Date(),
        customerSource: row.type || "",
        gender: mapApiGenderToCustomer(row.gender),
        status: row.is_active === false ? CustomerStatus.NOT_CONTACTED : CustomerStatus.REGISTERED,
        avatar: undefined,
        groups: groupNames,
        first_name: row.first_name,
        last_name: row.last_name,
        full_name: row.full_name || undefined,
        assigned_user_id: assignedUsers[0]?.id || undefined,
        assigned_users: assignedUsers,
        customer_source_id: row.customer_source_id || undefined,
        type: row.type || undefined,
        company_name: row.company_name || undefined,
        company_establish_date: row.company_establish_date ? new Date(row.company_establish_date) : undefined,
        description: row.description || undefined,
        day_of_birth: row.day_of_birth ? new Date(row.day_of_birth) : undefined,
        major: row.major || undefined,
        tax_code: row.tax_code || undefined,
        note: row.note || undefined,
        website: row.website || undefined,
        is_active: row.is_active,
    };
}

export function getJobDateValue(job: JobApiRow): number {
    const date = job.created_at || job.updated_at;
    return date ? new Date(date).getTime() : 0;
}

export function getRelatedCustomerId(job: JobApiRow): string | null {
    return job.customer?.id || job.customer_uuid || null;
}

export function getJobTimeRange(jobTime: JobApiRow["job_time"]): { start?: string; end?: string } {
    if (Array.isArray(jobTime)) {
        const firstRange = jobTime[0] || {};
        return {
            start: firstRange.start,
            end: firstRange.end,
        };
    }

    return {
        start: jobTime?.start,
        end: jobTime?.end,
    };
}

export function getJobPerformerLabel(job: JobApiRow): string {
    return job.performer?.full_name || job.performer?.email || job.performer_uuid || "Chưa phân công";
}

export function getJobStatusVariant(
    statusName?: string | null,
): "default" | "success" | "warning" | "danger" | "info" {
    return getStatusVariantFromName(statusName);
}
