import { useCallback, useEffect, useMemo, useState } from "react";
import {
    addNotificationsRefreshListener,
    emitNotificationsRefresh,
} from "@/lib/notifications-realtime";
import { useStableToastRef } from "@/hooks/useStableToastRef";
import { notificationsService } from "@/services/notifications";
import { Notification, NotificationStatus } from "@/types/notification";

export function useNotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState<NotificationStatus>(NotificationStatus.ALL);
    const [isMarkAllPending, setIsMarkAllPending] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
    const toastRef = useStableToastRef();

    const loadNotifications = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage(null);

        try {
            const data = await notificationsService.getMyNotifications();
            setNotifications(data);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Không thể tải danh sách thông báo.";

            setErrorMessage(message);
            toastRef.current.error("Tải thông báo thất bại", message);
        } finally {
            setIsLoading(false);
        }
    }, [toastRef]);

    useEffect(() => {
        void loadNotifications();
    }, [loadNotifications]);

    useEffect(() => {
        return addNotificationsRefreshListener(() => {
            void loadNotifications();
        });
    }, [loadNotifications]);

    const filterCounts = useMemo(() => {
        return {
            [NotificationStatus.ALL]: notifications.length,
            [NotificationStatus.UNREAD]: notifications.filter((n) => !n.has_user_read).length,
            [NotificationStatus.READ]: notifications.filter((n) => n.has_user_read).length,
        };
    }, [notifications]);

    const filteredNotifications = useMemo(() => {
        let filtered = notifications;

        if (activeFilter === NotificationStatus.UNREAD) {
            filtered = filtered.filter((n) => !n.has_user_read);
        } else if (activeFilter === NotificationStatus.READ) {
            filtered = filtered.filter((n) => n.has_user_read);
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (n) =>
                    n.title.toLowerCase().includes(query) ||
                    n.content.toLowerCase().includes(query),
            );
        }

        return filtered;
    }, [notifications, activeFilter, searchQuery]);

    const handleMarkAsRead = useCallback(
        async (notification: Notification, shouldShowSuccessToast = true): Promise<Notification> => {
            if (notification.has_user_read) {
                return notification;
            }

            try {
                const updatedNotification = await notificationsService.markAsRead(notification.id);

                setNotifications((prev) =>
                    prev.map((n) =>
                        n.id === notification.id ? updatedNotification : n,
                    ),
                );
                setSelectedNotification((prev) =>
                    prev?.id === notification.id ? updatedNotification : prev,
                );

                if (shouldShowSuccessToast) {
                    toastRef.current.success("Đã đọc", `Thông báo "${notification.title}" đã được đánh dấu đã đọc.`);
                }

                emitNotificationsRefresh({ source: "manual" });

                return updatedNotification;
            } catch (error) {
                const message = error instanceof Error ? error.message : "Không thể cập nhật trạng thái đã đọc.";
                toastRef.current.error("Cập nhật thất bại", message);

                return notification;
            }
        },
        [toastRef],
    );

    const handleNotificationClick = useCallback(
        async (notification: Notification) => {
            const notificationToShow = notification.has_user_read
                ? notification
                : await handleMarkAsRead(notification);

            setSelectedNotification(notificationToShow);
            setIsDetailModalOpen(true);
        },
        [handleMarkAsRead],
    );

    const handleMarkAllAsRead = useCallback(async () => {
        if (isMarkAllPending || filterCounts[NotificationStatus.UNREAD] === 0) {
            return;
        }

        setIsMarkAllPending(true);

        try {
            await notificationsService.markAllAsReadForCurrentUser();
            setNotifications((prev) =>
                prev.map((n) => (n.has_user_read ? n : { ...n, has_user_read: true, updated_at: new Date() })),
            );
            setSelectedNotification((prev) =>
                prev ? { ...prev, has_user_read: true, updated_at: new Date() } : prev,
            );
            toastRef.current.success("Thành công", "Đã đánh dấu tất cả thông báo là đã đọc.");
            emitNotificationsRefresh({ source: "manual" });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Không thể đánh dấu tất cả thông báo là đã đọc.";
            toastRef.current.error("Cập nhật thất bại", message);
        } finally {
            setIsMarkAllPending(false);
        }
    }, [filterCounts, isMarkAllPending, toastRef]);

    const handleDeleteNotification = useCallback((notification: Notification) => {
        setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
        setIsDetailModalOpen(false);
        toastRef.current.success("Xóa thành công", `Thông báo "${notification.title}" đã bị xóa.`);
        emitNotificationsRefresh({ source: "manual" });
    }, [toastRef]);

    const handleCreateNotification = useCallback(async (data: Partial<Notification>) => {
        try {
            const created = await notificationsService.createNotifications([{
                title: data.title || "",
                content: data.content || "",
                category: data.category,
                sub_category: data.sub_category,
                belongs_to_user_id: data.belongs_to_user_id || null,
            }]);
            setNotifications((prev) => [...created, ...prev]);
            setIsFormModalOpen(false);
            toastRef.current.success("Tạo thành công", `Thông báo "${data.title}" đã được tạo.`);
            emitNotificationsRefresh({ source: "manual" });
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Không thể tạo thông báo.";
            toastRef.current.error("Tạo thất bại", msg);
        }
    }, [toastRef]);

    return {
        searchQuery,
        setSearchQuery,
        activeFilter,
        setActiveFilter,
        isMarkAllPending,
        isLoading,
        errorMessage,
        isDetailModalOpen,
        setIsDetailModalOpen,
        isFormModalOpen,
        setIsFormModalOpen,
        selectedNotification,
        filterCounts,
        filteredNotifications,
        loadNotifications,
        handleNotificationClick,
        handleMarkAllAsRead,
        handleDeleteNotification,
        handleCreateNotification,
    };
}
