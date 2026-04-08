"use client";

import { SystemToolsPanel } from "../components/system/SystemToolsPanel";

export default function TagsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Tags</h1>
        <p className="mt-1 text-gray-500">Tạo và quản trị các thẻ phân loại khách hàng từ API hệ thống.</p>
      </div>

      <SystemToolsPanel sections={["tags"]} />
    </div>
  );
}
