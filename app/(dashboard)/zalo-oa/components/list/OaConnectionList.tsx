"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { FiRefreshCw, FiUsers } from "react-icons/fi";
import { OaConnection, ownerLabelMap } from "@/types/zalo-oa";

interface OaConnectionListProps {
  connections: OaConnection[];
  onSyncCustomers: (id: string) => void;
  onToggleConnection: (id: string) => void;
}

export function OaConnectionList({
  connections,
  onSyncCustomers,
  onToggleConnection,
}: OaConnectionListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Danh sách OA</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {connections.map((connection) => (
          <div key={connection.id} className="rounded-xl border border-gray-200 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold text-gray-900">{connection.oaName}</p>
                <p className="text-sm text-gray-500">{connection.oaOfficialId}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={connection.isActive ? "success" : "warning"}>
                  {connection.isActive ? "Đang hoạt động" : "Tạm dừng"}
                </Badge>
                <Badge variant="info">{ownerLabelMap[connection.owner] || "Chưa gán"}</Badge>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 text-sm text-gray-600 md:grid-cols-3">
              <p>
                <FiUsers className="mr-1 inline h-4 w-4" />
                Followers: {connection.followers.toLocaleString("vi-VN")}
              </p>
              <p>Khách đã đồng bộ: {connection.syncedCustomers.toLocaleString("vi-VN")}</p>
              <p>Đồng bộ gần nhất: {connection.lastSyncAt}</p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => onSyncCustomers(connection.id)}>
                <FiRefreshCw className="mr-2 h-4 w-4" />
                Đồng bộ khách
              </Button>
              <Button
                variant={connection.isActive ? "ghost" : "primary"}
                size="sm"
                onClick={() => onToggleConnection(connection.id)}
              >
                {connection.isActive ? "Tạm dừng kết nối" : "Kích hoạt lại"}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
