"use client";

import { NotificationListView } from "./components/list/NotificationListView";
import { Suspense } from "react";

export default function NotificationsPage() {
    return (
        <Suspense fallback={<div className="p-6">Đang tải...</div>}>
            <div className="p-6">
                <NotificationListView />
            </div>
        </Suspense>
    );
}
