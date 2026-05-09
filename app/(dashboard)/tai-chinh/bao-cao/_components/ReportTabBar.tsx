"use client";

import { REPORT_TABS, type ReportTabId } from "../_type";

interface Props {
  tab: ReportTabId;
  onTabChange: (id: ReportTabId) => void;
}

export function ReportTabBar({ tab, onTabChange }: Props) {
  return (
    <div className="flex flex-wrap gap-1 border-b border-gray-200 mb-4 overflow-x-auto">
      {REPORT_TABS.map((t) => (
        <button
          key={t.id}
          onClick={() => onTabChange(t.id)}
          className={`whitespace-nowrap py-2 px-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === t.id
              ? "border-primary-600 text-primary-600"
              : "border-transparent text-gray-600"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
