"use client";

import { useState } from "react";
import { Search, Filter, Plus, Download } from "lucide-react";

interface UserSearchProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onAddUser: () => void;
    onExport: () => void;
}

export function UserSearch({
    searchQuery,
    onSearchChange,
    onAddUser,
    onExport,
}: UserSearchProps) {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Tìm tên, email, số điện thoại..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all"
                    />
                </div>

                <button
                    onClick={onExport}
                    className="h-10 px-4 flex items-center gap-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-sm font-medium transition-colors shadow-sm"
                >
                    <Download className="w-4 h-4" />
                    Xuất file
                </button>

                <button
                    onClick={onAddUser}
                    className="h-10 px-4 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow"
                >
                    <Plus className="w-4 h-4" />
                    Thêm người dùng
                </button>
            </div>
        </div>
    );
}
