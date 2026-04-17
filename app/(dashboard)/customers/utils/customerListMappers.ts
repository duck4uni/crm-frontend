import {
    CustomerApiRow,
    CustomerAssignedUserApiRow,
    CustomerTagApiRow,
    TagApiRow,
} from "@/types/api";
import { Customer, CustomerStatus } from "@/types/customer";
import {
    buildAllowedAssigneeIdSet,
    buildAssigneeRolesByUserId,
    type AssigneeRole,
} from "@/lib/assignee-utils";
import { normalizeWhitespace } from "@/lib/utils";
import { CustomerFilterOption } from "../types";

export { buildAllowedAssigneeIdSet, buildAssigneeRolesByUserId };

export const GROUP_FILTER_PAGE_SIZE = "5000";

export const DEFAULT_ALL_GROUP_FILTER: CustomerFilterOption = {
    id: "all",
    label: "Tất cả",
    bgColor: "bg-primary-500",
    textColor: "text-white",
    activeBgColor: "bg-primary-600",
    activeTextColor: "text-white",
};

const GROUP_FILTER_STYLES: Omit<CustomerFilterOption, "id" | "label">[] = [
    {
        bgColor: "bg-emerald-500",
        textColor: "text-white",
        activeBgColor: "bg-emerald-600",
        activeTextColor: "text-white",
    },
    {
        bgColor: "bg-orange-500",
        textColor: "text-white",
        activeBgColor: "bg-orange-600",
        activeTextColor: "text-white",
    },
    {
        bgColor: "bg-cyan-500",
        textColor: "text-white",
        activeBgColor: "bg-cyan-600",
        activeTextColor: "text-white",
    },
    {
        bgColor: "bg-rose-500",
        textColor: "text-white",
        activeBgColor: "bg-rose-600",
        activeTextColor: "text-white",
    },
    {
        bgColor: "bg-indigo-500",
        textColor: "text-white",
        activeBgColor: "bg-indigo-600",
        activeTextColor: "text-white",
    },
    {
        bgColor: "bg-amber-500",
        textColor: "text-white",
        activeBgColor: "bg-amber-600",
        activeTextColor: "text-white",
    },
    {
        bgColor: "bg-teal-500",
        textColor: "text-white",
        activeBgColor: "bg-teal-600",
        activeTextColor: "text-white",
    },
    {
        bgColor: "bg-slate-500",
        textColor: "text-white",
        activeBgColor: "bg-slate-600",
        activeTextColor: "text-white",
    },
];

function mapApiGenderToCustomer(gender?: string | null): Customer["gender"] {
    const normalizedGender = (gender || "").toLowerCase();

    if (["male", "nam"].includes(normalizedGender)) {
        return "Male";
    }

    if (["female", "nu", "nữ"].includes(normalizedGender)) {
        return "Female";
    }

    return "Other";
}

function mapIsActiveToStatus(isActive?: boolean): CustomerStatus {
    return isActive === false ? CustomerStatus.NOT_CONTACTED : CustomerStatus.REGISTERED;
}

function toAssignedUsersFromCustomer(
    row: CustomerApiRow,
    allowedAssigneeIds?: Set<string> | null,
): Array<{ id: string; full_name: string }> {
    const seen = new Set<string>();

    return (row.assigned_users || []).reduce<Array<{ id: string; full_name: string }>>((acc, user) => {
        const id = typeof user?.id === "string" ? user.id.trim() : "";
        if (!id || seen.has(id)) {
            return acc;
        }

        if (allowedAssigneeIds && !allowedAssigneeIds.has(id)) {
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

function formatAssigneeLabel(assignedUsers: Array<{ id: string; full_name: string }>): string {
    if (assignedUsers.length === 0) {
        return "";
    }

    return assignedUsers
        .map((user) => user.full_name?.trim() || user.id)
        .filter(Boolean)
        .join(", ");
}

function formatAssigneeLabelByRole(
    assignedUsers: Array<{ id: string; full_name: string }>,
    assigneeRolesByUserId: Record<string, Set<AssigneeRole>>,
    role: AssigneeRole,
): string {
    const names = assignedUsers
        .filter((user) => assigneeRolesByUserId[user.id]?.has(role))
        .map((user) => user.full_name?.trim() || user.id)
        .filter(Boolean);

    return names.length > 0 ? names.join("\n") : "";
}

export function mapAssignedUsersByCustomerId(
    rows: CustomerAssignedUserApiRow[],
    allowedAssigneeIds?: Set<string> | null,
): Record<string, Array<{ id: string; full_name: string }>> {
    return rows.reduce<Record<string, Array<{ id: string; full_name: string }>>>((acc, row) => {
        const customerId = typeof row.customer_id === "string" ? row.customer_id.trim() : "";
        const assignedUserId = typeof row.assigned_user_id === "string" ? row.assigned_user_id.trim() : "";
        if (!customerId || !assignedUserId) {
            return acc;
        }

        if (allowedAssigneeIds && !allowedAssigneeIds.has(assignedUserId)) {
            return acc;
        }

        if (!acc[customerId]) {
            acc[customerId] = [];
        }

        if (!acc[customerId].some((user) => user.id === assignedUserId)) {
            acc[customerId].push({
                id: assignedUserId,
                full_name: row.assigned_user?.full_name?.trim() || assignedUserId,
            });
        }

        return acc;
    }, {});
}

export function mapApiRowToCustomerWithAssignee(
    row: CustomerApiRow,
    index: number,
    assignedUsersByCustomerId: Record<string, Array<{ id: string; full_name: string }>>,
    groupNamesByCustomerId: Record<string, string[]>,
    assigneeRolesByUserId: Record<string, Set<AssigneeRole>>,
    allowedAssigneeIds?: Set<string> | null,
): Customer {
    const customerName =
        row.full_name ||
        `${row.last_name || ""} ${row.first_name || ""}`.trim() ||
        row.email ||
        "Khach hang";

    const assignedUsers =
        assignedUsersByCustomerId[row.id]?.length
            ? assignedUsersByCustomerId[row.id]
            : toAssignedUsersFromCustomer(row, allowedAssigneeIds);

    const leaderAssignee = formatAssigneeLabelByRole(assignedUsers, assigneeRolesByUserId, "leader");
    const workerAssignee = formatAssigneeLabelByRole(assignedUsers, assigneeRolesByUserId, "worker");

    return {
        id: row.id,
        orderNumber: index + 1,
        customerName,
        email: row.email || undefined,
        phone: row.phone || "",
        address: row.address || "",
        salutation: row.gender?.toLowerCase() === "female" ? "Chị" : "Anh",
        mobilePhone: row.phone || "",
        source: row.website || "",
        assignee: formatAssigneeLabel(assignedUsers),
        leader_assignee: leaderAssignee,
        worker_assignee: workerAssignee,
        relationship: row.note || "",
        lastContactDate: row.updated_at ? new Date(row.updated_at) : undefined,
        createdDate: row.created_at ? new Date(row.created_at) : new Date(),
        customerSource: row.type || "",
        gender: mapApiGenderToCustomer(row.gender),
        status: mapIsActiveToStatus(row.is_active),
        avatar: undefined,
        groups: groupNamesByCustomerId[row.id] || [],
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
        id_no: row.id_no || undefined,
        id_issued_by: row.id_issued_by || undefined,
        id_issued_date: row.id_issued_date ? new Date(row.id_issued_date) : undefined,
        id_issued_place: row.id_issued_place || undefined,
        tax_code: row.tax_code || undefined,
        note: row.note || undefined,
        website: row.website || undefined,
        is_active: row.is_active,
    };
}

export function mapTagRowsToFilters(tags: TagApiRow[]): CustomerFilterOption[] {
    const sortedTags = [...tags].sort((a, b) => a.name.localeCompare(b.name, "vi"));

    return [
        DEFAULT_ALL_GROUP_FILTER,
        ...sortedTags.map((tag, index) => {
            const style = GROUP_FILTER_STYLES[index % GROUP_FILTER_STYLES.length];
            return {
                id: tag.id,
                label: tag.name,
                ...style,
            };
        }),
    ];
}

export function mapCustomerTagRows(rows: CustomerTagApiRow[]): Record<string, Set<string>> {
    return rows.reduce<Record<string, Set<string>>>((acc, row) => {
        if (!acc[row.tag_id]) {
            acc[row.tag_id] = new Set<string>();
        }

        acc[row.tag_id].add(row.customer_id);
        return acc;
    }, {});
}

export function mapCustomerGroupNamesByCustomerId(
    rows: CustomerTagApiRow[],
    tagNameById: Record<string, string>,
): Record<string, string[]> {
    return rows.reduce<Record<string, string[]>>((acc, row) => {
        const groupName = tagNameById[row.tag_id];
        if (!groupName) {
            return acc;
        }

        if (!acc[row.customer_id]) {
            acc[row.customer_id] = [];
        }

        if (!acc[row.customer_id].includes(groupName)) {
            acc[row.customer_id].push(groupName);
        }

        return acc;
    }, {});
}

export function splitCustomerName(fullName: string): { firstName: string; lastName: string } {
    const normalized = normalizeWhitespace(fullName);

    if (!normalized) {
        return { firstName: "Khach", lastName: "Hang" };
    }

    const parts = normalized.split(" ");
    if (parts.length === 1) {
        return { firstName: parts[0], lastName: parts[0] };
    }

    const firstName = parts.pop() || "Khach";
    const lastName = parts.join(" ") || firstName;

    return { firstName, lastName };
}
