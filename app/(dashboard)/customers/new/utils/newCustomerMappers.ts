import { CreateCustomerPayload } from "@/types/api";
import { Customer } from "@/types/customer";
import { formatDateToApi, normalizeLoose, normalizeWhitespace } from "@/lib/utils";

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

export function mapFormToCreatePayload(data: Partial<Customer>): CreateCustomerPayload {
    const firstName = normalizeWhitespace(String(data.first_name || ""));
    const lastName = normalizeWhitespace(String(data.last_name || ""));
    const fullName = normalizeWhitespace(`${lastName} ${firstName}`);

    return {
        first_name: firstName,
        last_name: lastName,
        description: normalizeWhitespace(data.description || "") || `Khach hang ${fullName || "moi"}`,
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
        created_at: new Date().toISOString(),
        is_active: data.is_active ?? mapStatusToIsActive(data.status),
    };
}
