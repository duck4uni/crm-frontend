"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { mockUsers } from "@/mock-data/users";
import { Tabs } from "@/components/ui/Tabs";
import { UserListView } from "./components/list/UserListView";
import { UserSessionsView } from "./components/sessions/UserSessionsView";
import { UserHistoryView } from "./components/history/UserHistoryView";
import { Suspense } from "react";

type UserTab = "list" | "sessions" | "history";

function UsersPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const activeTab = (searchParams.get("tab") as UserTab) || "list";

    const handleTabChange = (tabId: string) => {
        router.push(`/users?tab=${tabId}`);
    };

    const tabs = [
        { id: "list", label: "Danh sách người dùng", badge: mockUsers.length },
        { id: "sessions", label: "Phiên đăng nhập" },
        { id: "history", label: "Lịch sử hoạt động" },
    ];

    return (
        <div className="px-6 space-y-3">
            <Tabs tabs={tabs} activeTab={activeTab} onChange={handleTabChange} />

            <div className="mt-0">
                {activeTab === "list" && <UserListView />}
                {activeTab === "sessions" && <UserSessionsView />}
                {activeTab === "history" && <UserHistoryView />}
            </div>
        </div>
    );
}

export default function UsersPage() {
    return (
        <Suspense fallback={<div className="p-6">Đang tải...</div>}>
            <UsersPageContent />
        </Suspense>
    );
}
