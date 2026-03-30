"use client";

import { useState, useRef, useEffect } from "react";
import { BookmarkPlus, Check, Trash2, Plus } from "lucide-react";
import { FilterValues } from "./FilterModal";
import { SaveFilterModal } from "./SaveFilterModal";

interface SavedFilter {
    id: string;
    name: string;
    filters: FilterValues;
    createdAt: string;
    description?: string;
}

interface SavedFiltersDropdownProps {
    onSelectFilter: (filters: FilterValues) => void;
    currentFilters?: FilterValues;
}

const MOCK_SAVED_FILTERS: SavedFilter[] = [
    {
        id: "1",
        name: "KH tiềm năng tháng này",
        filters: { status: "qualified" as any, dateFrom: "2026-03-01", dateTo: "2026-03-31" },
        createdAt: "2026-03-15",
    },
    {
        id: "2",
        name: "KH đã liên hệ chưa xử lý",
        filters: { status: "contacted" as any },
        createdAt: "2026-03-10",
    },
    {
        id: "3",
        name: "Doanh thu > 10 triệu",
        filters: { minRevenue: "10000000" },
        createdAt: "2026-02-28",
    },
];

export function SavedFiltersDropdown({ onSelectFilter, currentFilters }: SavedFiltersDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [savedFilters, setSavedFilters] = useState<SavedFilter[]>(MOCK_SAVED_FILTERS);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const handleSelectFilter = (filter: SavedFilter) => {
        setSelectedId(filter.id);
        onSelectFilter(filter.filters);
        setIsOpen(false);
    };

    const handleDeleteFilter = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSavedFilters(savedFilters.filter((f) => f.id !== id));
    };

    const handleSaveFilter = (name: string, description?: string) => {
        if (currentFilters) {
            const newFilter: SavedFilter = {
                id: Date.now().toString(),
                name,
                description: description || "",
                filters: currentFilters,
                createdAt: new Date().toISOString().split("T")[0],
            };
            setSavedFilters([newFilter, ...savedFilters]);
            setIsOpen(false);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="h-10 px-4 flex items-center gap-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-sm font-medium transition-colors shadow-sm"
            >
                <BookmarkPlus className="w-4 h-4" />
                Bộ lọc đã lưu
                {savedFilters.length > 0 && (
                    <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                        {savedFilters.length}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute top-full mt-2 left-0 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                    <div className="p-3 border-b border-gray-200 bg-gray-50">
                        <button
                            onClick={() => {
                                setIsSaveModalOpen(true);
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Lưu bộ lọc hiện tại
                        </button>
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                        {savedFilters.length === 0 ? (
                            <div className="p-8 text-center">
                                <BookmarkPlus className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-sm text-gray-500">Chưa có bộ lọc đã lưu</p>
                                <p className="text-xs text-gray-400 mt-1">
                                    Áp dụng bộ lọc rồi click &ldquo;Lưu bộ lọc hiện tại&rdquo;
                                </p>
                            </div>
                        ) : (
                            <div className="py-2">
                                {savedFilters.map((filter) => (
                                    <button
                                        key={filter.id}
                                        onClick={() => handleSelectFilter(filter)}
                                        className="w-full px-4 py-3 hover:bg-gray-50 flex items-start gap-3 transition-colors group"
                                    >
                                        <div className="flex-1 text-left">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-gray-900">
                                                    {filter.name}
                                                </span>
                                                {selectedId === filter.id && (
                                                    <Check className="w-4 h-4 text-green-600" />
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                Đã lưu: {new Date(filter.createdAt).toLocaleDateString("vi-VN")}
                                            </p>
                                        </div>
                                        <button
                                            onClick={(e) => handleDeleteFilter(filter.id, e)}
                                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all"
                                            title="Xóa"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-600" />
                                        </button>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <SaveFilterModal
                isOpen={isSaveModalOpen}
                onClose={() => setIsSaveModalOpen(false)}
                onSave={handleSaveFilter}
            />
        </div>
    );
}
