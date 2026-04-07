import { getCurrentUserSession, setCurrentUserSession } from "@/lib/auth-session";
import { apiClient } from "@/lib/api-client";
import { usersService } from "@/services/users";
import {
    GetNotificationsResponse,
    MarkAllNotificationsAsReadResponse,
    MarkNotificationAsReadResponse,
    NotificationApiRow,
    CreateNotificationPayload,
    CreateNotificationsResponse,
} from "@/types/api";
import { Notification, NotificationCategory } from "@/types/notification";

const NOTIFICATIONS_ENDPOINT = "/api/v1.0/notifications";

function parseDate(date: string | null): Date | undefined {
    if (!date) {
        return undefined;
    }

    return new Date(date);
}

function normalizeCategory(category: string): NotificationCategory {
    const normalizedCategory = category.toLowerCase();

    if (
        normalizedCategory === NotificationCategory.SYSTEM ||
        normalizedCategory === NotificationCategory.TASK ||
        normalizedCategory === NotificationCategory.DEAL ||
        normalizedCategory === NotificationCategory.CUSTOMER ||
        normalizedCategory === NotificationCategory.REMINDER ||
        normalizedCategory === NotificationCategory.EXAM
    ) {
        return normalizedCategory;
    }

    return NotificationCategory.SYSTEM;
}

function mapNotificationRow(row: NotificationApiRow): Notification {
    const createdAt = parseDate(row.created_at) || new Date();

    return {
        id: row.id,
        title: row.title,
        content: row.content,
        category: normalizeCategory(row.category),
        sub_category: row.sub_category || undefined,
        belongs_to_user_id: row.belongs_to_user_id,
        has_user_read: row.has_user_read,
        has_noti_sent: row.has_noti_sent,
        sent_time: parseDate(row.sent_time),
        expired_at: parseDate(row.expired_at),
        created_at: createdAt,
        updated_at: parseDate(row.updated_at) || createdAt,
    };
}

async function getCurrentUserId(): Promise<string> {
    const cachedUser = getCurrentUserSession();

    if (cachedUser?.id) {
        return cachedUser.id;
    }

    const myInfoResponse = await usersService.getMyInfo();

    if (!myInfoResponse.responseData?.id) {
        throw new Error("Không thể lấy thông tin người dùng hiện tại.");
    }

    setCurrentUserSession(myInfoResponse.responseData);
    return myInfoResponse.responseData.id;
}

export const notificationsService = {
    async getMyNotifications(): Promise<Notification[]> {
        const userId = await getCurrentUserId();

        const response = await apiClient.get<GetNotificationsResponse>(
            NOTIFICATIONS_ENDPOINT,
            {
                filters: `belongs_to_user_id==${userId}`,
            },
        );

        const rows = response.responseData?.rows ?? [];

        return rows
            .map(mapNotificationRow)
            .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
    },

    async markAllAsReadForCurrentUser(): Promise<number[]> {
        const userId = await getCurrentUserId();
        const query = new URLSearchParams({
            filters: `belongs_to_user_id==${userId}`,
        }).toString();

        const response = await apiClient.put<MarkAllNotificationsAsReadResponse>(
            `${NOTIFICATIONS_ENDPOINT}/markAsRead?${query}`,
        );

        return response.responseData ?? [];
    },

    async markAsRead(notificationId: string): Promise<Notification> {
        const response = await apiClient.put<MarkNotificationAsReadResponse>(
            `${NOTIFICATIONS_ENDPOINT}/markAsRead/${notificationId}`,
        );

        if (!response.responseData) {
            throw new Error("Không nhận được dữ liệu thông báo sau khi cập nhật trạng thái đã đọc.");
        }

        return mapNotificationRow(response.responseData);
    },

    async createNotifications(payload: CreateNotificationPayload[]): Promise<Notification[]> {
        const response = await apiClient.post<CreateNotificationsResponse>(
            NOTIFICATIONS_ENDPOINT,
            payload,
        );

        const rows = response.responseData ?? [];
        return rows.map(mapNotificationRow);
    },
};
