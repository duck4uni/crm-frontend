"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/ToastProvider";

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    reportType: "journey" | "conversion";
}

export function ReportModal({ isOpen, onClose, reportType }: ReportModalProps) {
    const [format, setFormat] = useState("pdf");
    const [includeCharts, setIncludeCharts] = useState(true);
    const [includeDetails, setIncludeDetails] = useState(true);
    const [email, setEmail] = useState("");
    const toast = useToast();

    const handleExport = () => {
        toast.success(
            "Xuất báo cáo thành công",
            `Báo cáo ${reportType === "journey" ? "hành trình" : "tỷ lệ chuyển đổi"} đã được tải xuống`
        );
        onClose();
    };

    const handleEmail = () => {
        if (!email.trim()) {
            toast.error("Lỗi", "Vui lòng nhập email");
            return;
        }
        toast.success("Gửi email thành công", `Báo cáo đã được gửi đến ${email}`);
        onClose();
    };

    const handlePrint = () => {
        window.print();
        toast.success("Đang in báo cáo", "Chuẩn bị tài liệu để in...");
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Báo cáo ${reportType === "journey" ? "hành trình khách hàng" : "tỷ lệ chuyển đổi"}`}
            size="lg"
            footer={
                <div className="flex gap-3 justify-end">
                    <Button variant="outline" onClick={onClose}>
                        Đóng
                    </Button>
                </div>
            }
        >
            <div className="space-y-6">
                {/* Export Options */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                        Tùy chọn xuất báo cáo
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="Định dạng file"
                            value={format}
                            onChange={(e) => setFormat(e.target.value)}
                            options={[
                                { value: "pdf", label: "PDF" },
                                { value: "excel", label: "Excel" },
                                { value: "word", label: "Word" },
                                { value: "csv", label: "CSV" },
                            ]}
                        />

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nội dung
                            </label>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={includeCharts}
                                        onChange={(e) => setIncludeCharts(e.target.checked)}
                                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                    />
                                    <span className="text-sm text-gray-700">Bao gồm biểu đồ</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={includeDetails}
                                        onChange={(e) => setIncludeDetails(e.target.checked)}
                                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                    />
                                    <span className="text-sm text-gray-700">Bao gồm chi tiết</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-3">
                    <button
                        onClick={handleExport}
                        className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all group"
                    >
                        <span className="text-sm font-medium text-gray-700 group-hover:text-primary-700">
                            Tải xuống
                        </span>
                    </button>

                    <button
                        onClick={handlePrint}
                        className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group"
                    >
                        <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">
                            In báo cáo
                        </span>
                    </button>

                    <div className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Gửi email</span>
                    </div>
                </div>

                {/* Email Section */}
                <div className="border-t pt-4">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Nhập email người nhận"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                        />
                        <Button variant="primary" onClick={handleEmail}>
                            Gửi
                        </Button>
                    </div>
                </div>

                {/* Summary */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">
                        Thông tin báo cáo
                    </h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Loại: {reportType === "journey" ? "Hành trình khách hàng" : "Tỷ lệ chuyển đổi"}</li>
                        <li>• Định dạng: {format.toUpperCase()}</li>
                        <li>• Ngày tạo: {new Date().toLocaleDateString("vi-VN")}</li>
                        <li>• Biểu đồ: {includeCharts ? "Có" : "Không"}</li>
                        <li>• Chi tiết: {includeDetails ? "Có" : "Không"}</li>
                    </ul>
                </div>
            </div>
        </Modal>
    );
}
