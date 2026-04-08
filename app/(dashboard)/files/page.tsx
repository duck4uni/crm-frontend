"use client";

import { SystemToolsPanel } from "../components/system/SystemToolsPanel";

export default function FilesPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Files</h1>
        <p className="mt-1 text-gray-500">Upload, theo dõi và dọn dẹp tệp đính kèm qua API file service.</p>
      </div>

      <SystemToolsPanel sections={["files"]} />
    </div>
  );
}
