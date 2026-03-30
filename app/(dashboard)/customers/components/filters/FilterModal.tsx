"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { CustomerStatus } from "@/types/customer";
import { useState } from "react";

export interface FilterValues {
    status?: CustomerStatus;
    assignee?: string;
    dateFrom?: string;
    dateTo?: string;
    minRevenue?: string;
    maxRevenue?: string;
    tags?: string[];
    source?: string;
}

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (filters: FilterValues) => void;
    initialFilters?: FilterValues;
}

export function FilterModal({ isOpen, onClose, onApply, initialFilters = {} }: FilterModalProps) {
    const [filters, setFilters] = useState<FilterValues>(initialFilters);

    const handleApply = () => {
        onApply(filters);
        onClose();
    };

    const handleReset = () => {
        setFilters({});
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Bộ lọc nâng cao"
            size="lg"
            footer={
                <div className="flex gap-3 justify-end">
                    <Button variant="outline" onClick={handleReset}>
                        🔄 Đặt lại
                    </Button>
                    <Button variant="secondary" onClick={onClose}>
                        Hủy
                    </Button>
                    <Button variant="primary" onClick={handleApply}>
                        Áp dụng bộ lọc
                    </Button>
                </div>
            }
        >
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <Select
                        label="Trạng thái khách hàng"
                        value={filters.status || ""}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value as CustomerStatus })}
                        options={[
                            { value: "", label: "Tất cả trạng thái" },
                            { value: CustomerStatus.NEW, label: "Mới" },
                            { value: CustomerStatus.CONTACTED, label: "Đã liên hệ" },
                            { value: CustomerStatus.QUOTED, label: "Dự báo giá" },
                            { value: CustomerStatus.TESTED, label: "Đã test đầu vào" },
                            { value: CustomerStatus.REGISTERED, label: "Đã đăng ký" },
                            { value: CustomerStatus.CONSIDERING, label: "Đang cân nhắc" },
                            { value: CustomerStatus.APPROACHED, label: "Đã tiếp cận" },
                        ]}
                    />

                    <Select
                        label="Người phụ trách"
                        value={filters.assignee || ""}
                        onChange={(e) => setFilters({ ...filters, assignee: e.target.value })}
                        options={[
                            { value: "", label: "Tất cả người phụ trách" },
                            { value: "getfly_admin", label: "Getfly Admin" },
                            { value: "nguyen_van_a", label: "Nguyễn Văn A" },
                            { value: "tran_thi_b", label: "Trần Thị B" },
                            { value: "le_van_c", label: "Lê Văn C" },
                        ]}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Từ ngày"
                        type="date"
                        value={filters.dateFrom || ""}
                        onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                    />

                    <Input
                        label="Đến ngày"
                        type="date"
                        value={filters.dateTo || ""}
                        onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                    />
                </div>

                <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Doanh thu</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Từ (VNĐ)"
                            type="number"
                            placeholder="0"
                            value={filters.minRevenue || ""}
                            onChange={(e) => setFilters({ ...filters, minRevenue: e.target.value })}
                        />

                        <Input
                            label="Đến (VNĐ)"
                            type="number"
                            placeholder="999,999,999"
                            value={filters.maxRevenue || ""}
                            onChange={(e) => setFilters({ ...filters, maxRevenue: e.target.value })}
                        />
                    </div>
                </div>

                <div className="border-t pt-4">
                    <Select
                        label="Nguồn khách hàng"
                        value={filters.source || ""}
                        onChange={(e) => setFilters({ ...filters, source: e.target.value })}
                        options={[
                            { value: "", label: "Tất cả nguồn" },
                            { value: "website", label: "Website" },
                            { value: "facebook", label: "Facebook" },
                            { value: "google", label: "Google Ads" },
                            { value: "referral", label: "Giới thiệu" },
                            { value: "direct", label: "Trực tiếp" },
                            { value: "other", label: "Khác" },
                        ]}
                    />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                        💡 <strong>Mẹo:</strong> Để lưu bộ lọc này, hãy áp dụng rồi click &ldquo;Bộ lọc đã lưu&rdquo; để lưu lại.
                    </p>
                </div>
            </div>
        </Modal>
    );
}
