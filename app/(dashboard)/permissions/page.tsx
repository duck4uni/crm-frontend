"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { mockPermissions } from "@/mock-data/permissions";
import { Tabs } from "@/components/ui/Tabs";
import { PermissionListView } from "./components/list/PermissionListView";
import { AssignPermissionView } from "./components/assign/AssignPermissionView";
import { Suspense } from "react";

type PermissionTab = "list" | "assign";

function PermissionsPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const activeTab = (searchParams.get("tab") as PermissionTab) || "list";

    const handleTabChange = (tabId: string) => {
        router.push(`/permissions?tab=${tabId}`);
    };

    const tabs = [
        { id: "list", label: "Danh sách quyền", badge: mockPermissions.length },
        { id: "assign", label: "Phân quyền người dùng" },
    ];

    return (
        <div className="px-6 space-y-3">
            <Tabs tabs={tabs} activeTab={activeTab} onChange={handleTabChange} />

            <div className="mt-0">
                {activeTab === "list" && <PermissionListView />}
                {activeTab === "assign" && <AssignPermissionView />}
            </div>
        </div>
    );
}

export default function PermissionsPage() {
    return (
        <Suspense fallback={<div className="p-6">Đang tải...</div>}>
            <PermissionsPageContent />
        </Suspense>
    );
}
