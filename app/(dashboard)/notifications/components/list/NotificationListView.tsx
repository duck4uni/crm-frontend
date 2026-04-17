"use client";

import { Notification, NotificationStatus } from "@/types/notification";
import { NotificationFilters } from "./NotificationFilters";
import { NotificationSearch } from "./NotificationSearch";
import { NotificationTable } from "./NotificationTable";
import { ListPageLayout } from "@/components/ui/ListPageLayout";
import { NotificationDetailModal } from "../forms/NotificationDetailModal";
import { NotificationFormModal } from "../forms/NotificationFormModal";
import { useNotificationsPage } from "../../hooks/useNotificationsPage";

export function NotificationListView() {
    const {
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
    } = useNotificationsPage();

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
