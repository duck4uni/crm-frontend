"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { initialConnections } from "@/mock-data/zalo-oa";
import { OaConnection, OaConnectionFormState } from "@/types/zalo-oa";
import { OaConnectionForm } from "../forms/OaConnectionForm";
import { OaConnectionList } from "./OaConnectionList";

const initialFormState: OaConnectionFormState = {
  oaName: "",
  oaOfficialId: "",
  owner: "owner",
};

function buildNowLabel(): string {
  return new Date().toLocaleString("vi-VN", {
    hour12: false,
  });
}

export function ZaloOaView() {
  const [connections, setConnections] = useState<OaConnection[]>(initialConnections);
  const [form, setForm] = useState<OaConnectionFormState>(initialFormState);

  const activeCount = useMemo(
    () => connections.filter((item) => item.isActive).length,
    [connections],
  );
  const totalFollowers = useMemo(
    () => connections.reduce((sum, item) => sum + item.followers, 0),
    [connections],
  );

  const handleCreateConnection = () => {
    const oaName = form.oaName.trim();
    const oaOfficialId = form.oaOfficialId.trim();

    if (!oaName || !oaOfficialId) {
      return;
    }

    const newConnection: OaConnection = {
      id: `oa-${Date.now()}`,
      oaName,
      oaOfficialId,
      owner: form.owner,
      followers: 0,
      syncedCustomers: 0,
      isActive: true,
      lastSyncAt: "Chưa đồng bộ",
    };

    setConnections((prev) => [newConnection, ...prev]);
    setForm(initialFormState);
  };

  const handleToggleConnection = (id: string) => {
    setConnections((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              isActive: !item.isActive,
            }
          : item,
      ),
    );
  };

  const handleSyncCustomers = (id: string) => {
    setConnections((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              syncedCustomers: item.syncedCustomers + Math.floor(Math.random() * 20 + 5),
              lastSyncAt: buildNowLabel(),
            }
          : item,
      ),
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Zalo OA</h1>
        <p className="mt-1 text-gray-500">
          Quản trị kết nối OA, đồng bộ khách hàng và phân quyền vận hành theo đội nhóm.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="py-5">
            <p className="text-sm text-gray-500">OA đang kết nối</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{connections.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-5">
            <p className="text-sm text-gray-500">OA hoạt động</p>
            <p className="mt-1 text-2xl font-bold text-green-600">{activeCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-5">
            <p className="text-sm text-gray-500">Tổng followers</p>
            <p className="mt-1 text-2xl font-bold text-blue-700">
              {totalFollowers.toLocaleString("vi-VN")}
            </p>
          </CardContent>
        </Card>
      </div>

      <OaConnectionForm
        form={form}
        onChange={setForm}
        onCreateConnection={handleCreateConnection}
      />

      <OaConnectionList
        connections={connections}
        onSyncCustomers={handleSyncCustomers}
        onToggleConnection={handleToggleConnection}
      />
    </div>
  );
}
