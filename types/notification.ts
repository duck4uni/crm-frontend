// Notification Model Types - Based on Backend Models

export interface Notification {
    id: string;
    belongs_to_user_id: string;
    title: string;
    content: string;
    category: NotificationCategory;
    sub_category?: string;
    has_user_read: boolean;
    has_noti_sent: boolean;
    sent_time?: Date;
    expired_at?: Date;
    created_at: Date;
    updated_at: Date;
}

export enum NotificationCategory {
    SYSTEM = "system",
    TASK = "task",
    DEAL = "deal",
    CUSTOMER = "customer",
    REMINDER = "reminder",
    EXAM = "exam",
}

export enum NotificationStatus {
    ALL = "all",
    READ = "read",
    UNREAD = "unread",
    SENT = "sent",
    UNSENT = "unsent",
}
