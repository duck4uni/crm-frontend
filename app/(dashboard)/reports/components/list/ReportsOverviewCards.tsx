"use client";

import { Card, CardContent } from "@/components/ui/Card";

interface ReportsOverviewCardsProps {
  totalCustomers: number;
  totalConverted: number;
  conversionRate: number;
  topPerformerName: string;
  topPerformerJobs: number;
}

export function ReportsOverviewCards({
  totalCustomers,
  totalConverted,
  conversionRate,
  topPerformerName,
  topPerformerJobs,
}: ReportsOverviewCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      <Card>
        <CardContent className="py-5">
          <p className="text-sm text-gray-500">Khách hàng mới</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{totalCustomers}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="py-5">
          <p className="text-sm text-gray-500">Khách chuyển đổi</p>
          <p className="mt-1 text-2xl font-bold text-blue-700">{totalConverted}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="py-5">
          <p className="text-sm text-gray-500">Tỷ lệ chuyển đổi</p>
          <p className="mt-1 text-2xl font-bold text-green-600">{conversionRate}%</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="py-5">
          <p className="text-sm text-gray-500">Top hiệu suất</p>
          <p className="mt-1 text-lg font-bold text-gray-900">{topPerformerName}</p>
          <p className="text-sm text-gray-500">{topPerformerJobs} jobs</p>
        </CardContent>
      </Card>
    </div>
  );
}
