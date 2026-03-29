"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { mockCustomers } from "@/mock-data/customers";
import { Tabs } from "@/components/ui/Tabs";
import { CustomerListView } from "./components/list/CustomerListView";
import { CustomerJourneyView } from "./components/journey/CustomerJourneyView";
import { ConversionRateView } from "./components/conversion/ConversionRateView";
import { FiUsers } from "react-icons/fi";
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
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-600 rounded-lg">
            <FiUsers className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Khách hàng
            </h1>
            <p className="mt-1 text-gray-600">
              Quản lý danh sách khách hàng và thông tin chi tiết
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-gray-900">
            {mockCustomers.length}
          </p>
          <p className="text-sm text-gray-600">Tổng số khách hàng</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs 
        tabs={tabs} 
        activeTab={activeTab} 
        onChange={handleTabChange} 
      />

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "list" && <CustomerListView />}
        {activeTab === "journey" && <CustomerJourneyView />}
        {activeTab === "conversion" && <ConversionRateView />}
      </div>
    </div>
  );
}

export default function CustomersPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <CustomersPageContent />
    </Suspense>
  );
}
