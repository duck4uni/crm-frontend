"use client";

import { CustomerFilterOption } from "../../types";

interface CustomerFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  counts: Record<string, number>;
  filters: CustomerFilterOption[];
}

export function CustomerFilters({ activeFilter, onFilterChange, counts, filters }: CustomerFiltersProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-500">Nhóm khách hàng:</p>
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {filters.map((filter) => {
          const count = counts[filter.id] || 0;
          const isActive = activeFilter === filter.id;

          return (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap text-sm font-medium ${isActive
                  ? `${filter.activeBgColor} ${filter.activeTextColor} shadow-md`
                  : `${filter.bgColor} ${filter.textColor} opacity-80 hover:opacity-100 hover:shadow`
                }`}
            >
              <span>{filter.label}</span>
              <span className="bg-white bg-opacity-25 px-1.5 py-0.5 rounded-full text-xs font-bold">
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
