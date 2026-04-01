"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { mockCustomers } from "@/mock-data/customers";
import { Tabs } from "@/components/ui/Tabs";
import { CustomerListView } from "./components/list/CustomerListView";
import { CustomerJourneyView } from "./components/journey/CustomerJourneyView";
import { ConversionRateView } from "./components/conversion/ConversionRateView";
import { Suspense } from "react";

type CustomerTab = "list" | "journey" | "conversion";

function CustomersPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = (searchParams.get("tab") as CustomerTab) || "list";

  const handleTabChange = (tabId: string) => {
    router.push(`/customers?tab=${tabId}`);
  };

  const tabs = [
    { id: "list", label: "Danh sách khách hàng", badge: mockCustomers.length },
    { id: "journey", label: "Hành trình khách hàng" },
    { id: "conversion", label: "Tỷ lệ chuyển đổi" },
  ];

  return (
    <div className="px-6 space-y-3">
      {/* Tabs Navigation */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={handleTabChange}
      />

      {/* Tab Content */}
      <div className="mt-0">
        {activeTab === "list" && <CustomerListView />}
        {activeTab === "journey" && <CustomerJourneyView />}
        {activeTab === "conversion" && <ConversionRateView />}
      </div>
    </div>
  );
}

export default function CustomersPage() {
  return (
    <Suspense fallback={<div className="p-6">Đang tải...</div>}>
      <CustomersPageContent />
    </Suspense>
  );
}
