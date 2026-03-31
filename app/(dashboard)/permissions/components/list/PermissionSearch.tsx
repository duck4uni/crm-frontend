"use client";

import { Search, Plus } from "lucide-react";

interface PermissionSearchProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onAddPermission: () => void;
}

export function PermissionSearch({
    searchQuery,
    onSearchChange,
    onAddPermission,
}: PermissionSearchProps) {
    return (
        <div className="flex items-center gap-3">
            <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                    type="text"
                    placeholder="Tìm tên quyền, mã code..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all"
                />
            </div>

            <button
                onClick={onAddPermission}
                className="h-10 px-4 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow"
            >
                <Plus className="w-4 h-4" />
                Thêm quyền
            </button>
        </div>
    );
}
