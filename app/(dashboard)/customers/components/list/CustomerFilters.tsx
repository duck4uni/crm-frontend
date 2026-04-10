"use client";

export interface CustomerFilterOption {
  id: string;
  label: string;
  bgColor: string;
  textColor: string;
  activeBgColor: string;
  activeTextColor: string;
}

interface CustomerFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  counts: Record<string, number>;
  filters: CustomerFilterOption[];
}

export function CustomerFilters({ activeFilter, onFilterChange, counts, filters }: CustomerFiltersProps) {
  return (
    <div>
      <div className="text-xs text-gray-500 mb-2">Lưu ý: các nút bên dưới là bộ lọc theo <strong>nhóm khách hàng</strong>.</div>
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
      {filters.map((filter) => {
        const count = counts[filter.id] || 0;
        const isActive = activeFilter === filter.id;
        
        return (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
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
    </div>
  );
}
