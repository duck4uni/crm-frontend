"use client";

import { useState, useMemo } from "react";
import { Notification, NotificationCategory, NotificationStatus } from "@/types/notification";
import { mockNotifications } from "@/mock-data/notifications";
import { NotificationFilters } from "./NotificationFilters";
import { NotificationSearch } from "./NotificationSearch";
import { NotificationTable } from "./NotificationTable";
import { NotificationDetailModal } from "../forms/NotificationDetailModal";
import { NotificationFormModal } from "../forms/NotificationFormModal";
import { useToast } from "@/components/ui/ToastProvider";

export function NotificationListView() {
    const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState<NotificationStatus>(NotificationStatus.ALL);
    const [selectedCategory, setSelectedCategory] = useState("");
    const toast = useToast();

    // Modal states
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

    // Filter counts
    const filterCounts = useMemo(() => {
        return {
            [NotificationStatus.ALL]: notifications.length,
            [NotificationStatus.UNREAD]: notifications.filter((n) => !n.has_user_read).length,
            [NotificationStatus.READ]: notifications.filter((n) => n.has_user_read).length,
            [NotificationStatus.SENT]: notifications.filter((n) => n.has_noti_sent).length,
            [NotificationStatus.UNSENT]: notifications.filter((n) => !n.has_noti_sent).length,
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
        } else if (activeFilter === NotificationStatus.SENT) {
            filtered = filtered.filter((n) => n.has_noti_sent);
        } else if (activeFilter === NotificationStatus.UNSENT) {
            filtered = filtered.filter((n) => !n.has_noti_sent);
        }

        // Category filter
        if (selectedCategory) {
            filtered = filtered.filter((n) => n.category === selectedCategory);
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
    }, [notifications, activeFilter, selectedCategory, searchQuery]);

    const handleNotificationClick = (notification: Notification) => {
        setSelectedNotification(notification);
        setIsDetailModalOpen(true);
    };

    const handleMarkAsRead = (notification: Notification) => {
        setNotifications((prev) =>
            prev.map((n) =>
                n.id === notification.id ? { ...n, has_user_read: true, updated_at: new Date() } : n
            )
        );
        toast.success("Đã đọc", `Thông báo "${notification.title}" đã được đánh dấu đã đọc.`);
    };

    const handleDeleteNotification = (notification: Notification) => {
        setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
        setIsDetailModalOpen(false);
        toast.success("Xóa thành công", `Thông báo "${notification.title}" đã bị xóa.`);
    };

    const handleAddNotification = () => {
        setIsFormModalOpen(true);
    };

    const handleSaveNotification = (data: Partial<Notification>) => {
        const newNotification: Notification = {
            id: `n${Date.now()}`,
            belongs_to_user_id: data.belongs_to_user_id || "u1",
            title: data.title || "",
            content: data.content || "",
            category: data.category || NotificationCategory.SYSTEM,
            sub_category: data.sub_category,
            has_user_read: false,
            has_noti_sent: false,
            created_at: new Date(),
            updated_at: new Date(),
        };
        setNotifications((prev) => [newNotification, ...prev]);
        toast.success("Tạo thành công", `Thông báo "${data.title}" đã được tạo.`);
    };

    return (
        <div className="space-y-6">
            <NotificationFilters
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                counts={filterCounts}
            />

            <NotificationSearch
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                onAddNotification={handleAddNotification}
            />

            <NotificationTable
                notifications={filteredNotifications}
                onNotificationClick={handleNotificationClick}
                onMarkAsRead={handleMarkAsRead}
            />

            <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Tổng số: {filteredNotifications.length} thông báo</span>
                    <span>Chưa đọc: {filterCounts[NotificationStatus.UNREAD]}</span>
                </div>
            </div>

            <NotificationDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                notification={selectedNotification}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDeleteNotification}
            />

            <NotificationFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSave={handleSaveNotification}
            />
        </div>
    );
}
