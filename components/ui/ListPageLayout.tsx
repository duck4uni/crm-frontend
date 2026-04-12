"use client";

import { useState, useMemo, useEffect } from "react";
import { TablePagination } from "./TablePagination";

const DEFAULT_PAGE_SIZE = 10;

interface ListPageLayoutProps<T> {
  /** Dữ liệu đã được filter từ ngoài (hoặc toàn bộ nếu không cần filter ngoài) */
  items: T[];
  /** Render khu vực filter badge (bên trên search bar) */
  renderFilters?: React.ReactNode;
  /** Render search/action bar */
  renderSearch?: React.ReactNode;
  /** Render table — nhận slice đã phân trang */
  renderTable: (pagedItems: T[]) => React.ReactNode;
  /** Khi filter / search state thay đổi bên ngoài, reset page (truyền key thay đổi) */
  resetPageKey?: string | number;
  /** Loading state */
  isLoading?: boolean;
  loadingText?: string;
  /** Thông báo lỗi */
  errorNode?: React.ReactNode;
}

/**
 * ListPageLayout — bố cục chung cho tất cả trang quản lý dạng danh sách.
 * Sử dụng:
 *   <ListPageLayout
 *     items={filteredItems}
 *     resetPageKey={`${activeFilter}|${searchQuery}`}
 *     renderFilters={<MyFilters ... />}
 *     renderSearch={<MySearch ... />}
 *     renderTable={(paged) => <MyTable items={paged} ... />}
 *   />
 */
export function ListPageLayout<T>({
  items,
  renderFilters,
  renderSearch,
  renderTable,
  resetPageKey,
  isLoading,
  loadingText = "Đang tải dữ liệu...",
  errorNode,
}: ListPageLayoutProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  // Reset về trang 1 mỗi khi filter/search thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [resetPageKey]);

  const pagedItems = useMemo(
    () => items.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [items, currentPage, pageSize],
  );

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 text-sm text-gray-600">
        {loadingText}
      </div>
    );
  }

  if (errorNode) {
    return <>{errorNode}</>;
  }

  return (
    <div className="space-y-4">
      {renderFilters && <div>{renderFilters}</div>}
      {renderSearch && <div>{renderSearch}</div>}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {items.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-gray-400">
            Không có dữ liệu để hiển thị.
          </div>
        ) : (
          renderTable(pagedItems)
        )}
        <TablePagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalCount={items.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
        />
      </div>
    </div>
  );
}
