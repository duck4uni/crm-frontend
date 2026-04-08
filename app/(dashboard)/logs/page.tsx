"use client";

import { SystemToolsPanel } from "../components/system/SystemToolsPanel";

export default function LogsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Xem Logs</h1>
        <p className="mt-1 text-gray-500">Tra cứu log theo khoảng ngày để hỗ trợ vận hành và kiểm tra sự cố.</p>
      </div>

      <SystemToolsPanel sections={["logs"]} />
    </div>
  );
}
