"use client";

import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { GrowthItem, PerformanceItem } from "@/types/reports";

interface ReportsDetailPanelsProps {
  reportView: string;
  growthData: GrowthItem[];
  performanceData: PerformanceItem[];
}

export function ReportsDetailPanels({
  reportView,
  growthData,
  performanceData,
}: ReportsDetailPanelsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Tăng trưởng khách hàng ({reportView === "weekly" ? "tuần" : "tháng"})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {growthData.map((item) => (
            <div key={item.label}>
              <div className="mb-1 flex items-center justify-between text-sm text-gray-600">
                <span>{item.label}</span>
                <span>{item.customers} khách</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100">
                <div
                  className="h-2 rounded-full bg-blue-500"
                  style={{ width: `${Math.min(100, Math.round((item.customers / 80) * 100))}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hiệu suất nhân sự</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {performanceData.map((item) => (
            <div key={item.name} className="rounded-lg border border-gray-200 p-3">
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-900">{item.name}</p>
                <Badge variant={item.responseRate >= 90 ? "success" : "warning"}>
                  {item.responseRate}% phản hồi
                </Badge>
              </div>
              <p className="mt-1 text-sm text-gray-600">{item.closedJobs} công việc hoàn tất</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
