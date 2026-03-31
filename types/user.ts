// User Management Types - Based on Backend Models

export interface UserProfile {
    id: string;
    email: string;
    full_name: string;
    phone?: string;
    avatar?: string;
    birthday?: Date;
    is_active: boolean;
    is_delete: boolean;
    created_at: Date;
    created_by?: string;
    updated_at: Date;
    updated_by?: string;
}

export enum UserStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    DELETED = "deleted",
}

// UserAuth Model
export interface UserAuth {
    id: string;
    user_id: string;
    auth_method: AuthMethod;
    is_primary: boolean;
    created_at: Date;
    created_by?: string;
    updated_at: Date;
    updated_by?: string;
}

export enum AuthMethod {
    EMAIL = "email",
    GOOGLE = "google",
    FACEBOOK = "facebook",
    PHONE = "phone",
}

// UserSession Model
export interface UserSession {
    id: string;
    user_id: string;
    session_token: string;
    ip_address: string;
    created_at: Date;
    expire: Date;
}

// UserHistory Model
export interface UserHistory {
    id: string;
    user_id: string;
    title: string;
    note: string;
    created_at: Date;
    created_by?: string;
    updated_at: Date;
    updated_by?: string;
}
