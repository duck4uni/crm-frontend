"use client";

import { SUB_TABS } from "../_hooks/useQuyPage";

interface Props {
  activeTab: string;
  onTabChange: (id: string) => void;
}

export function QuyTabBar({ activeTab, onTabChange }: Props) {
  return (
    <div className="flex items-center gap-1 border-b border-gray-200 mb-4">
      {SUB_TABS.map((t) => (
        <button
          key={t.id}
          onClick={() => onTabChange(t.id)}
          className={`py-2 px-4 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === t.id
              ? "border-primary-600 text-primary-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
