"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FiBell, FiCheck, FiCheckCircle } from "react-icons/fi";
import {
    MdOutlineNotificationsActive,
    MdOutlineTask,
    MdOutlineHandshake,
    MdOutlinePeopleAlt,
    MdOutlineMenuBook,
    MdOutlineAlarm,
    MdOutlineSettings,
} from "react-icons/md";
import { Notification, NotificationCategory } from "@/types/notification";
import { notificationsService } from "@/services/notifications";
import { useToast } from "@/components/ui/ToastProvider";
import {
    addNotificationsRefreshListener,
    emitNotificationsRefresh,
} from "@/lib/notifications-realtime";

function getCategoryConfig(category: NotificationCategory) {
    switch (category) {
        case NotificationCategory.DEAL:
            return { icon: MdOutlineHandshake, bg: "bg-blue-100", color: "text-blue-600", label: "Thương vụ" };
        case NotificationCategory.TASK:
            return { icon: MdOutlineTask, bg: "bg-yellow-100", color: "text-yellow-600", label: "Công việc" };
        case NotificationCategory.CUSTOMER:
            return { icon: MdOutlinePeopleAlt, bg: "bg-green-100", color: "text-green-600", label: "Khách hàng" };
        case NotificationCategory.EXAM:
            return { icon: MdOutlineMenuBook, bg: "bg-indigo-100", color: "text-indigo-600", label: "Thi cử" };
        case NotificationCategory.REMINDER:
            return { icon: MdOutlineAlarm, bg: "bg-purple-100", color: "text-purple-600", label: "Nhắc nhở" };
        case NotificationCategory.SYSTEM:
        default:
            return { icon: MdOutlineSettings, bg: "bg-gray-100", color: "text-gray-600", label: "Hệ thống" };
    }
}

function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return new Date(date).toLocaleDateString("vi-VN");
}

const PREVIEW_LIMIT = 6;

export function NotificationDropdown() {
    const router = useRouter();
    const toast = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isMarkAllPending, setIsMarkAllPending] = useState(false);
    const [markingNotificationIds, setMarkingNotificationIds] = useState<Set<string>>(new Set());
    const containerRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter((n) => !n.has_user_read).length;
    const previewList = notifications.slice(0, PREVIEW_LIMIT);

    const loadNotifications = useCallback(async () => {
        try {
            const data = await notificationsService.getMyNotifications();
            setNotifications(data);
        } catch (error) {
            console.error("Load notification dropdown failed:", error);
        }
    }, []);

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        if (isOpen) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    useEffect(() => {
        void loadNotifications();
    }, [loadNotifications]);

    useEffect(() => {
        return addNotificationsRefreshListener(() => {
            void loadNotifications();
        });
    }, [loadNotifications]);

    async function markAsRead(notification: Notification) {
        const id = notification.id;

        if (markingNotificationIds.has(id)) {
            return;
        }

        setMarkingNotificationIds((prev) => new Set(prev).add(id));

        try {
            const updatedNotification = await notificationsService.markAsRead(id);

            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? updatedNotification : n))
            );
            toast.success("Đã xem thông báo", `Thông báo "${notification.title}" đã được đánh dấu đã xem.`);
            emitNotificationsRefresh({ source: "manual" });
        } catch (error) {
            console.error("Mark notification as read failed:", error);
            toast.error("Cập nhật thất bại", "Không thể đánh dấu thông báo là đã xem.");
        } finally {
            setMarkingNotificationIds((prev) => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }
    }

    async function markAllAsRead() {
        if (isMarkAllPending || unreadCount === 0) {
            return;
        }

        setIsMarkAllPending(true);

        try {
            await notificationsService.markAllAsReadForCurrentUser();
            setNotifications((prev) =>
                prev.map((n) => (n.has_user_read ? n : { ...n, has_user_read: true, updated_at: new Date() }))
            );
            toast.success("Thành công", "Đã đánh dấu tất cả thông báo là đã xem.");
            emitNotificationsRefresh({ source: "manual" });
        } catch (error) {
            console.error("Mark all notifications as read failed:", error);
            toast.error("Cập nhật thất bại", "Không thể đánh dấu tất cả thông báo là đã xem.");
        } finally {
            setIsMarkAllPending(false);
        }
    }

    function handleViewAll() {
        setIsOpen(false);
        router.push("/notifications");
    }

    function handleItemClick(notification: Notification) {
        if (!notification.has_user_read) {
            void markAsRead(notification);
        }
    }

    return (
        <div ref={containerRef} className="relative">
            {/* Bell button */}
            <button
                onClick={() => setIsOpen((prev) => !prev)}
                className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Thông báo"
            >
                <FiBell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown panel */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-[420px] bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                    {/* Header */}
                    <div className="px-4 pt-4 pb-3 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <MdOutlineNotificationsActive className="w-5 h-5 text-primary-600 flex-shrink-0" />
                                <span className="font-semibold text-gray-900 text-base">Thông báo</span>
                                {unreadCount > 0 && (
                                    <span className="whitespace-nowrap text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full">
                                        {unreadCount} chưa đọc
                                    </span>
                                )}
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={() => void markAllAsRead()}
                                    disabled={isMarkAllPending}
                                    className="whitespace-nowrap flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium ml-3 flex-shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    <FiCheckCircle className="w-3.5 h-3.5" />
                                    {isMarkAllPending ? "Đang xử lý..." : "Đánh dấu tất cả đã đọc"}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Notification list */}
                    <div className="max-h-[420px] overflow-y-auto">
                        {previewList.length === 0 ? (
                            <div className="py-12 text-center text-gray-400 text-sm">
                                Không có thông báo nào
                            </div>
                        ) : (
                            previewList.map((notification) => {
                                const cfg = getCategoryConfig(notification.category);
                                const Icon = cfg.icon;
                                return (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleItemClick(notification)}
                                        className={`flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors border-b border-gray-50 last:border-b-0 ${!notification.has_user_read
                                            ? "bg-blue-50/50 hover:bg-blue-50"
                                            : "hover:bg-gray-50"
                                            }`}
                                    >
                                        {/* Category icon */}
                                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${cfg.bg}`}>
                                            <Icon style={{ width: 20, height: 20 }} className={cfg.color} />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <p className={`text-sm leading-snug flex-1 min-w-0 ${!notification.has_user_read
                                                    ? "font-semibold text-gray-900"
                                                    : "font-medium text-gray-700"
                                                    }`}>
                                                    {notification.title}
                                                </p>
                                                {!notification.has_user_read && (
                                                    <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full" />
                                                )}
                                                {!notification.has_user_read && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            void markAsRead(notification);
                                                        }}
                                                        disabled={markingNotificationIds.has(notification.id)}
                                                        className="flex-shrink-0 p-1 text-gray-300 hover:text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                                        title="Đánh dấu đã đọc"
                                                    >
                                                        <FiCheck className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                                                {notification.content}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.color}`}>
                                                    {cfg.label}
                                                </span>
                                                <span className="text-[11px] text-gray-400">
                                                    {formatTimeAgo(notification.created_at)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
                        <button
                            onClick={handleViewAll}
                            className="w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                        >
                            Xem tất cả thông báo ({notifications.length})
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
