"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Notification, NotificationStatus } from "@/types/notification";
import { NotificationFilters } from "./NotificationFilters";
import { NotificationSearch } from "./NotificationSearch";
import { NotificationTable } from "./NotificationTable";
import { ListPageLayout } from "@/components/ui/ListPageLayout";
import { NotificationDetailModal } from "../forms/NotificationDetailModal";
import { NotificationFormModal } from "../forms/NotificationFormModal";
import { useToast } from "@/components/ui/ToastProvider";
import {
    addNotificationsRefreshListener,
    emitNotificationsRefresh,
} from "@/lib/notifications-realtime";
import { notificationsService } from "@/services/notifications";

export function NotificationListView() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState<NotificationStatus>(NotificationStatus.ALL);
    const [isMarkAllPending, setIsMarkAllPending] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const toast = useToast();

    // Modal states
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

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
            toast.error("Tải thông báo thất bại", message);
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        loadNotifications();
    }, [loadNotifications]);

    useEffect(() => {
        return addNotificationsRefreshListener(() => {
            void loadNotifications();
        });
    }, [loadNotifications]);

    // Filter counts
    const filterCounts = useMemo(() => {
        return {
            [NotificationStatus.ALL]: notifications.length,
            [NotificationStatus.UNREAD]: notifications.filter((n) => !n.has_user_read).length,
            [NotificationStatus.READ]: notifications.filter((n) => n.has_user_read).length,
        };
    }, [notifications]);

    // Filtered notifications
    const filteredNotifications = useMemo(() => {
        let filtered = notifications;

        // Status filter
        if (activeFilter === NotificationStatus.UNREAD) {
            filtered = filtered.filter((n) => !n.has_user_read);
        } else if (activeFilter === NotificationStatus.READ) {
            filtered = filtered.filter((n) => n.has_user_read);
        }

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (n) =>
                    n.title.toLowerCase().includes(query) ||
                    n.content.toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [notifications, activeFilter, searchQuery]);

    const handleMarkAsRead = async (notification: Notification, shouldShowSuccessToast = true): Promise<Notification> => {
        if (notification.has_user_read) {
            return notification;
        }

        try {
            const updatedNotification = await notificationsService.markAsRead(notification.id);

            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === notification.id ? updatedNotification : n
                )
            );
            setSelectedNotification((prev) =>
                prev?.id === notification.id ? updatedNotification : prev
            );

            if (shouldShowSuccessToast) {
                toast.success("Đã đọc", `Thông báo "${notification.title}" đã được đánh dấu đã đọc.`);
            }

            emitNotificationsRefresh({ source: "manual" });

            return updatedNotification;
        } catch (error) {
            const message = error instanceof Error ? error.message : "Không thể cập nhật trạng thái đã đọc.";
            toast.error("Cập nhật thất bại", message);

            return notification;
        }
    };

    const handleNotificationClick = async (notification: Notification) => {
        const notificationToShow = notification.has_user_read
            ? notification
            : await handleMarkAsRead(notification);

        setSelectedNotification(notificationToShow);
        setIsDetailModalOpen(true);
    };

    const handleMarkAllAsRead = async () => {
        if (isMarkAllPending || filterCounts[NotificationStatus.UNREAD] === 0) {
            return;
        }

        setIsMarkAllPending(true);

        try {
            await notificationsService.markAllAsReadForCurrentUser();
            setNotifications((prev) =>
                prev.map((n) => (n.has_user_read ? n : { ...n, has_user_read: true, updated_at: new Date() }))
            );
            setSelectedNotification((prev) =>
                prev ? { ...prev, has_user_read: true, updated_at: new Date() } : prev
            );
            toast.success("Thành công", "Đã đánh dấu tất cả thông báo là đã đọc.");
            emitNotificationsRefresh({ source: "manual" });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Không thể đánh dấu tất cả thông báo là đã đọc.";
            toast.error("Cập nhật thất bại", message);
        } finally {
            setIsMarkAllPending(false);
        }
    };

    const handleDeleteNotification = (notification: Notification) => {
        setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
        setIsDetailModalOpen(false);
        toast.success("Xóa thành công", `Thông báo "${notification.title}" đã bị xóa.`);
        emitNotificationsRefresh({ source: "manual" });
    };

    const handleCreateNotification = async (data: Partial<Notification>) => {
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
            toast.success("Tạo thành công", `Thông báo "${data.title}" đã được tạo.`);
            emitNotificationsRefresh({ source: "manual" });
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Không thể tạo thông báo.";
            toast.error("Tạo thất bại", msg);
        }
    };

    return (
        <>
            <ListPageLayout
                items={filteredNotifications}
                isLoading={isLoading}
                loadingText="Đang tải danh sách thông báo..."
                errorNode={errorMessage ? (
                    <div className="bg-white border border-red-200 rounded-lg p-6 space-y-3">
                        <p className="text-sm text-red-600">{errorMessage}</p>
                        <button
                            type="button"
                            onClick={loadNotifications}
                            className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
                        >
                            Tải lại
                        </button>
                    </div>
                ) : undefined}
                resetPageKey={`${activeFilter}|${searchQuery}`}
                renderFilters={
                    <NotificationFilters
                        activeFilter={activeFilter}
                        onFilterChange={setActiveFilter}
                        counts={filterCounts}
                    />
                }
                renderSearch={
                    <NotificationSearch
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        unreadCount={filterCounts[NotificationStatus.UNREAD]}
                        isMarkAllPending={isMarkAllPending}
                        onMarkAllAsRead={handleMarkAllAsRead}
                    />
                }
                renderTable={(paged) => (
                    <NotificationTable
                        notifications={paged}
                        onNotificationClick={handleNotificationClick}
                    />
                )}
            />

            <NotificationDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                notification={selectedNotification}
                onDelete={handleDeleteNotification}
            />

            <NotificationFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSave={handleCreateNotification}
            />
        </>
    );
}
