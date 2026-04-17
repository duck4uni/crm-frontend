import { JobApiRow, UpdateUserPayload, UserApiRow } from "@/types/api";
import { UserProfile } from "@/types/user";
import {
    formatDateToApi,
    getStatusVariantFromName,
    normalizeWhitespace,
} from "@/lib/utils";

export function mapApiRowToProfile(row: UserApiRow): UserProfile {
    return {
        id: row.id,
        email: row.email,
        full_name: row.full_name,
        phone: row.phone || undefined,
        avatar: row.avatar || undefined,
        birthday: row.birthday ? new Date(row.birthday) : undefined,
        is_active: row.is_active,
        is_delete: row.is_delete,
        created_at: row.created_at ? new Date(row.created_at) : new Date(),
        created_by: row.created_by || undefined,
        updated_at: row.updated_at ? new Date(row.updated_at) : new Date(),
        updated_by: row.updated_by || undefined,
    };
}

export function buildUpdatePayload(nextData: Partial<UserProfile>, currentUser: UserProfile): UpdateUserPayload {
    const payload: UpdateUserPayload = {};

    const fullName = normalizeWhitespace(nextData.full_name);
    const email = normalizeWhitespace(nextData.email).toLowerCase();
    const phone = normalizeWhitespace(nextData.phone);
    const avatar = normalizeWhitespace(nextData.avatar);

    if (fullName && fullName !== currentUser.full_name) {
        payload.full_name = fullName;
    }

    if (email && email !== currentUser.email) {
        payload.email = email;
    }

    if (phone && phone !== (currentUser.phone || "")) {
        payload.phone = phone;
    }

    if (avatar && avatar !== (currentUser.avatar || "")) {
        payload.avatar = avatar;
    }

    if (typeof nextData.is_active === "boolean" && nextData.is_active !== currentUser.is_active) {
        payload.is_active = nextData.is_active;
    }

    const nextBirthday = formatDateToApi(nextData.birthday);
    const currentBirthday = formatDateToApi(currentUser.birthday);
    if (nextBirthday && nextBirthday !== currentBirthday) {
        payload.birthday = nextBirthday;
    }

    return payload;
}

export function getJobDateValue(job: JobApiRow): number {
    const date = job.created_at || job.updated_at;
    return date ? new Date(date).getTime() : 0;
}

function normalizeComparable(value?: string | null): string {
    return (value || "").trim().toLowerCase();
}

function getRelatedPerformerIds(job: JobApiRow): string[] {
    const jobWithLegacyFields = job as JobApiRow & {
        performer_id?: string | null;
        user_id?: string | null;
        assigned_user_id?: string | null;
    };

    const performerWithLegacyFields = (job.performer || null) as
        | (NonNullable<JobApiRow["performer"]> & {
            uuid?: string | null;
            user_id?: string | null;
        })
        | null;

    const candidates = [
        performerWithLegacyFields?.id,
        performerWithLegacyFields?.uuid,
        performerWithLegacyFields?.user_id,
        job.performer_uuid,
        jobWithLegacyFields.performer_id,
        jobWithLegacyFields.user_id,
        jobWithLegacyFields.assigned_user_id,
        job.created_by,
    ];

    return candidates.filter((value): value is string => Boolean(value && value.trim()));
}

export function isJobRelatedToUser(job: JobApiRow, user: UserProfile): boolean {
    const normalizedUserId = normalizeComparable(user.id);
    const normalizedUserEmail = normalizeComparable(user.email);
    const normalizedUserName = normalizeComparable(user.full_name);

    if (!normalizedUserId && !normalizedUserEmail && !normalizedUserName) {
        return false;
    }

    const relatedIds = getRelatedPerformerIds(job).map((value) => normalizeComparable(value));
    if (normalizedUserId && relatedIds.includes(normalizedUserId)) {
        return true;
    }

    const performerEmail = normalizeComparable(job.performer?.email);
    if (normalizedUserEmail && performerEmail && normalizedUserEmail === performerEmail) {
        return true;
    }

    const performerName = normalizeComparable(job.performer?.full_name);
    return Boolean(normalizedUserName && performerName && normalizedUserName === performerName);
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

export function getJobCustomerLabel(job: JobApiRow): string {
    if (job.customer?.full_name) {
        return job.customer.full_name;
    }

    const fallbackName = `${job.customer?.last_name || ""} ${job.customer?.first_name || ""}`.trim();
    if (fallbackName) {
        return fallbackName;
    }

    return job.customer?.email || job.customer_uuid || "Không gắn khách hàng";
}

export function getJobStatusVariant(
    statusName?: string | null,
): "default" | "success" | "warning" | "danger" | "info" {
    return getStatusVariantFromName(statusName);
}
