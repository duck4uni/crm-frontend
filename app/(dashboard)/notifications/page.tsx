"use client";

import { NotificationListView } from "./components/list/NotificationListView";
import { Suspense } from "react";

export default function NotificationsPage() {
    return (
        <Suspense fallback={<div className="p-6">Đang tải...</div>}>
            <div className="px-6 mt-4 space-y-3">
                {/* <h1 className="text-2xl font-bold text-gray-900">Thông báo</h1> */}
                <NotificationListView />
            </div>
        </Suspense>
    );
}
