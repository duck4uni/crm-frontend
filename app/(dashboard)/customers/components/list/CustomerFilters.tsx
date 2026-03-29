"use client";

import { CustomerStatus } from "@/types/customer";
import { CUSTOMER_FILTERS } from "@/mock-data/customer-filters";

interface CustomerFiltersProps {
  activeFilter: CustomerStatus | "all";
  onFilterChange: (filter: CustomerStatus | "all") => void;
  counts: Record<string, number>;
}

export function CustomerFilters({ activeFilter, onFilterChange, counts }: CustomerFiltersProps) {
  return (
    <div className="flex items-center space-x-2 overflow-x-auto pb-2">
      {CUSTOMER_FILTERS.map((filter) => {
        const count = counts[filter.id] || 0;
        const isActive = activeFilter === filter.id;
        
        return (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id as CustomerStatus | "all")}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded transition-all whitespace-nowrap ${
              isActive
                ? `${filter.activeBgColor} ${filter.activeTextColor} shadow-md`
                : `${filter.bgColor} ${filter.textColor} opacity-90 hover:opacity-100 hover:shadow`
            }`}
          >
            <span className="text-sm font-medium">{filter.label}</span>
            <span className="text-xs font-bold bg-white bg-opacity-30 px-2 py-0.5 rounded-full">
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
