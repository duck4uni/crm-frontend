import { AdminUserApiRow } from "@/types/api";
import { UserProfile } from "@/types/user";

export function mapApiRowToProfile(row: AdminUserApiRow): UserProfile {
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
