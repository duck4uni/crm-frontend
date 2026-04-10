"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { tagsService } from "@/services/tags";
import { useEffect, useState } from "react";

export interface FilterValues {
    groupId?: string;
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
    const [groupOptions, setGroupOptions] = useState<Array<{ value: string; label: string }>>([
        { value: "", label: "Tất cả nhóm" },
    ]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const loadGroups = async () => {
            try {
                const response = await tagsService.getTags({ currentPage: "1", pageSize: "5000" });
                const options = (response.responseData?.rows || [])
                    .map((tag) => ({ value: tag.id, label: tag.name }))
                    .sort((a, b) => a.label.localeCompare(b.label, "vi"));

                setGroupOptions([{ value: "", label: "Tất cả nhóm" }, ...options]);
            } catch {
                setGroupOptions([{ value: "", label: "Tất cả nhóm" }]);
            }
        };

        void loadGroups();
    }, [isOpen]);

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
                        label="Nhóm khách hàng"
                        value={filters.groupId || ""}
                        onChange={(e) => setFilters({ ...filters, groupId: e.target.value })}
                        options={groupOptions}
                    />

                    <Select
                        label="Người phụ trách"
                        value={filters.assignee || ""}
                        onChange={(e) => setFilters({ ...filters, assignee: e.target.value })}
                        options={[
                            { value: "", label: "Tất cả người phụ trách" },
                            { value: "getfly_admin", label: "Quản trị viên Getfly" },
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
                            { value: "website", label: "Trang web" },
                            { value: "facebook", label: "Facebook" },
                            { value: "google", label: "Quảng cáo Google" },
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
