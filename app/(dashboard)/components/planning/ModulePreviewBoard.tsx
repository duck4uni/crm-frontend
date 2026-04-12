"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FiSearch } from "react-icons/fi";

export type FeatureStatus = "no-api" | "no-fe" | "api-ready";

export interface ModuleFeatureItem {
  code: string;
  title: string;
  description: string;
  role: string;
  priority: "High" | "Medium";
  status: FeatureStatus;
}

interface ModulePreviewBoardProps {
  moduleName: string;
  moduleDescription: string;
  items: ModuleFeatureItem[];
}

const statusLabel: Record<FeatureStatus, string> = {
  "no-api": "Chưa có API",
  "no-fe": "Chưa có FE",
  "api-ready": "Có API",
};

const statusVariant: Record<FeatureStatus, "warning" | "info" | "success"> = {
  "no-api": "warning",
  "no-fe": "info",
  "api-ready": "success",
};

export function ModulePreviewBoard({ moduleName, moduleDescription, items }: ModulePreviewBoardProps) {
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | FeatureStatus>("all");

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchedKeyword =
        item.code.toLowerCase().includes(keyword.toLowerCase()) ||
        item.title.toLowerCase().includes(keyword.toLowerCase()) ||
        item.description.toLowerCase().includes(keyword.toLowerCase());

      const matchedStatus = statusFilter === "all" || item.status === statusFilter;
      return matchedKeyword && matchedStatus;
    });
  }, [items, keyword, statusFilter]);

  return (
    <div className="space-y-6">
      <Card className="border border-primary-100 bg-primary-50/60">
        <CardContent className="py-4 text-sm text-primary-900">
          <strong>{moduleName}</strong>: {moduleDescription}
          <p className="mt-1 text-primary-800">
            Bản dựng UI trước để chốt luồng nghiệp vụ. Những mục chưa có API sẽ được nối dữ liệu ở sprint backend tiếp theo.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-3 pt-5 md:flex-row md:items-end">
          <div className="relative flex-1">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Tìm theo mã, tên chức năng, mô tả"
              className="pl-9"
            />
          </div>
          <div className="w-full md:w-60">
            <Select
              label="Trạng thái"
              value={statusFilter}
              options={[
                { value: "all", label: "Tất cả" },
                { value: "no-api", label: "Chưa có API" },
                { value: "no-fe", label: "Chưa có FE" },
                { value: "api-ready", label: "Có API" },
              ]}
              onChange={(event) =>
                setStatusFilter(event.target.value as "all" | FeatureStatus)
              }
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        {filteredItems.map((item) => (
          <Card key={item.code} className="border border-gray-200">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base">
                  {item.code} - {item.title}
                </CardTitle>
                <p className="mt-1 text-sm text-gray-600">{item.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={statusVariant[item.status]}>{statusLabel[item.status]}</Badge>
                <Badge variant="default">{item.priority}</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 border-t border-gray-100 pt-4 md:flex-row md:items-center md:justify-between">
              <div className="text-sm text-gray-600">Phân quyền: {item.role}</div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Xem chi tiết UI
                </Button>
                <Button variant="ghost" size="sm" disabled={item.status !== "api-ready"}>
                  {item.status === "api-ready" ? "Kết nối API" : "Chờ API"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredItems.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-gray-500">
              Không có chức năng phù hợp với bộ lọc hiện tại.
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
