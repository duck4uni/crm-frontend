import { PermissionApiRow } from "@/types/api";
import { normalizeWhitespace } from "@/lib/utils";

export interface PermissionOption {
    id: string;
    name: string;
    code: string;
    group_code: string;
}

export const PAGE_SIZE = "500";
export const ALLOWED_ROLE_CODES = ["SITE_WORKER", "SITE_LEADER", "SITE_OWNER"];

export function mapPermissionOptions(rows: PermissionApiRow[]): PermissionOption[] {
    return rows
        .filter((permission) => ALLOWED_ROLE_CODES.includes(permission.code))
        .map((permission) => ({
            id: permission.id,
            name: permission.name,
            code: permission.code,
            group_code: permission.group_code,
        }));
}
