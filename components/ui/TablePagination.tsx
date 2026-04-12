"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, useEffect } from "react";

const PAGE_SIZE_OPTIONS = [10, 20, 50];

interface TablePaginationProps {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function TablePagination({
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
}: TablePaginationProps) {
  const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);
  const pageSizeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pageSizeRef.current && !pageSizeRef.current.contains(e.target as Node)) {
        setIsPageSizeOpen(false);
      }
    };
    if (isPageSizeOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isPageSizeOpen]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const from = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalCount);

  // Build page number list: always show first, last, current ±1, with ellipsis
  const getPageNumbers = (): (number | "...")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | "...")[] = [];
    const addPage = (p: number) => {
      if (!pages.includes(p)) pages.push(p);
    };

    addPage(1);
    if (currentPage > 3) pages.push("...");
    for (let p = Math.max(2, currentPage - 1); p <= Math.min(totalPages - 1, currentPage + 1); p++) {
      addPage(p);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    addPage(totalPages);

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
      {/* Left: item count info */}
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <span>
          {totalCount === 0
            ? "Không có kết quả"
            : `Hiển thị ${from}–${to} trong ${totalCount} kết quả`}
        </span>
      </div>

      {/* Right: page size selector + navigation */}
      <div className="flex items-center gap-3">
        {/* Page size selector */}
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <span>Hiển thị</span>
          <div ref={pageSizeRef} className="relative">
            <button
              onClick={() => setIsPageSizeOpen(!isPageSizeOpen)}
              className="h-8 px-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1 font-medium"
            >
              {pageSize}
              <ChevronLeft className="w-3 h-3 rotate-90" />
            </button>
            {isPageSizeOpen && (
              <div className="absolute bottom-full mb-1 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                {PAGE_SIZE_OPTIONS.map((size, idx) => (
                  <button
                    key={size}
                    onClick={() => {
                      onPageSizeChange(size);
                      setIsPageSizeOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-sm text-left hover:bg-primary-50 transition-colors whitespace-nowrap ${
                      size === pageSize ? "bg-primary-100 text-primary-700 font-semibold" : "text-gray-700"
                    } ${idx > 0 ? "border-t border-gray-100" : ""}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            )}
          </div>
          <span>/ trang</span>
        </div>

        {/* Page navigation */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-8 w-8 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Trang trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {pageNumbers.map((p, i) =>
            p === "..." ? (
              <span key={`ellipsis-${i}`} className="h-8 w-8 flex items-center justify-center text-sm text-gray-500">
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`h-8 w-8 flex items-center justify-center border rounded text-sm transition-colors ${
                  p === currentPage
                    ? "border-primary-600 bg-primary-600 text-white font-medium"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            )
          )}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-8 w-8 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Trang sau"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
