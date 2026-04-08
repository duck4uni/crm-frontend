"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

interface ReportsFilterBarProps {
  fromDate: string;
  toDate: string;
  reportView: string;
  onChangeFromDate: (value: string) => void;
  onChangeToDate: (value: string) => void;
  onChangeReportView: (value: string) => void;
}

export function ReportsFilterBar({
  fromDate,
  toDate,
  reportView,
  onChangeFromDate,
  onChangeToDate,
  onChangeReportView,
}: ReportsFilterBarProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bộ lọc báo cáo</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Input
          label="Từ ngày"
          type="date"
          value={fromDate}
          onChange={(event) => onChangeFromDate(event.target.value)}
        />
        <Input
          label="Đến ngày"
          type="date"
          value={toDate}
          onChange={(event) => onChangeToDate(event.target.value)}
        />
        <Select
          label="Chế độ xem"
          value={reportView}
          options={[
            { value: "weekly", label: "Theo tuần" },
            { value: "monthly", label: "Theo tháng" },
          ]}
          onChange={(event) => onChangeReportView(event.target.value)}
        />
      </CardContent>
    </Card>
  );
}
