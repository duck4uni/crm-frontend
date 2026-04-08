"use client";

import { useMemo, useState } from "react";
import { growthData, performanceData } from "@/mock-data/reports";
import { ReportsFilterBar } from "../filters/ReportsFilterBar";
import { ReportsDetailPanels } from "./ReportsDetailPanels";
import { ReportsOverviewCards } from "./ReportsOverviewCards";

export function ReportsView() {
  const [fromDate, setFromDate] = useState("2026-04-01");
  const [toDate, setToDate] = useState("2026-04-08");
  const [reportView, setReportView] = useState("weekly");

  const totalCustomers = useMemo(
    () => growthData.reduce((sum, item) => sum + item.customers, 0),
    [],
  );
  const totalConverted = useMemo(
    () => growthData.reduce((sum, item) => sum + item.converted, 0),
    [],
  );
  const conversionRate = totalCustomers > 0 ? Math.round((totalConverted / totalCustomers) * 100) : 0;

  const topPerformer = useMemo(
    () => [...performanceData].sort((a, b) => b.closedJobs - a.closedJobs)[0],
    [],
  );

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="mt-1 text-gray-500">
          Theo dõi tăng trưởng khách hàng, hiệu suất xử lý và chất lượng chuyển đổi.
        </p>
      </div>

      <ReportsFilterBar
        fromDate={fromDate}
        toDate={toDate}
        reportView={reportView}
        onChangeFromDate={setFromDate}
        onChangeToDate={setToDate}
        onChangeReportView={setReportView}
      />

      <ReportsOverviewCards
        totalCustomers={totalCustomers}
        totalConverted={totalConverted}
        conversionRate={conversionRate}
        topPerformerName={topPerformer?.name || "N/A"}
        topPerformerJobs={topPerformer?.closedJobs || 0}
      />

      <ReportsDetailPanels
        reportView={reportView}
        growthData={growthData}
        performanceData={performanceData}
      />
    </div>
  );
}
