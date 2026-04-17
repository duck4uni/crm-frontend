"use client";

import { DashboardChartsSection } from "./dashboard-home/components/DashboardChartsSection";
import { DashboardKpiGrid } from "./dashboard-home/components/DashboardKpiGrid";
import { DashboardPerformanceTables } from "./dashboard-home/components/DashboardPerformanceTables";
import { useDashboardPage } from "./dashboard-home/hooks/useDashboardPage";

export default function DashboardPage() {
    const {
        isLoading,
        kpiCards,
        conversionRate,
        totalWeeklyCustomers,
        totalWeeklyConverted,
        leaderData,
        workerData,
        pieData,
    } = useDashboardPage();

    return (
        <div className="p-6 space-y-6">
            <div>
                <p className="mt-1 text-gray-500 text-sm">
                    {isLoading ? "Đang tải dữ liệu..." : "Chào mừng bạn quay lại! Đây là tình hình hiện tại."}
                </p>
            </div>

            <DashboardKpiGrid cards={kpiCards} />

            <DashboardChartsSection
                pieData={pieData}
                conversionRate={conversionRate}
                totalWeeklyCustomers={totalWeeklyCustomers}
                totalWeeklyConverted={totalWeeklyConverted}
            />

            <DashboardPerformanceTables leaderData={leaderData} workerData={workerData} />
        </div>
    );
}
