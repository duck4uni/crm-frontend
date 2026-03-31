// Permission Model Types - Based on Backend Models

export interface Permission {
    id: string;
    name: string;
    code: string;
    description: string;
    group_code: PermissionGroup;
}

export enum PermissionGroup {
    USER = "user",
    CUSTOMER = "customer",
    DEAL = "deal",
    TASK = "task",
    REPORT = "report",
    SETTING = "setting",
}

// UserPermission - Junction table
export interface UserPermission {
    id: string;
    user_id: string;
    permision_id: string;
    updated_at: Date;
    updated_by?: string;
}
