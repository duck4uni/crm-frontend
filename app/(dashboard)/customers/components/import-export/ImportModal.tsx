"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useState, useRef } from "react";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Download } from "lucide-react";

interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (data: any[]) => void;
}

export function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState<{
        success: number;
        failed: number;
        errors: string[];
    } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (selectedFile: File) => {
        const validTypes = [
            "text/csv",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ];

        if (validTypes.includes(selectedFile.type)) {
            setFile(selectedFile);
            setImportResult(null);
        } else {
            alert("Vui lòng chọn file CSV hoặc Excel (.xls, .xlsx)");
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            handleFileSelect(droppedFile);
        }
    };

    const handleImport = async () => {
        if (!file) return;

        setImporting(true);

        // Simulate import process
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Mock result
        const result = {
            success: 145,
            failed: 5,
            errors: [
                "Dòng 12: Thiếu số điện thoại",
                "Dòng 34: Email không hợp lệ",
                "Dòng 67: Trùng mã khách hàng",
                "Dòng 89: Thiếu tên khách hàng",
                "Dòng 123: Trạng thái không hợp lệ",
            ],
        };

        setImportResult(result);
        setImporting(false);

        // Call onImport with mock data
        onImport([]);
    };

    const handleReset = () => {
        setFile(null);
        setImportResult(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleDownloadTemplate = () => {
        // In real app, this would download a CSV/Excel template
        alert("Đang tải xuống mẫu file...");
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Import khách hàng"
            size="lg"
            footer={
                <div className="flex gap-3 justify-end">
                    {importResult ? (
                        <>
                            <Button variant="outline" onClick={handleReset}>
                                Import tiếp
                            </Button>
                            <Button variant="primary" onClick={onClose}>
                                Hoàn tất
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" onClick={onClose}>
                                Hủy
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleImport}
                                disabled={!file || importing}
                            >
                                {importing ? "Đang import..." : "Bắt đầu import"}
                            </Button>
                        </>
                    )}
                </div>
            }
        >
            <div className="space-y-4">
                {!importResult ? (
                    <>
                        {/* Download Template */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <FileSpreadsheet className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <h4 className="text-sm font-semibold text-blue-900 mb-1">
                                        Tải xuống file mẫu
                                    </h4>
                                    <p className="text-sm text-blue-700 mb-3">
                                        Sử dụng file mẫu để đảm bảo dữ liệu của bạn đúng định dạng
                                    </p>
                                    <button
                                        onClick={handleDownloadTemplate}
                                        className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                                    >
                                        <Download className="w-4 h-4" />
                                        Tải file mẫu
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* File Upload Area */}
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`
                border-2 border-dashed rounded-lg p-8 text-center transition-all
                ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"}
              `}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv,.xls,.xlsx"
                                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                                className="hidden"
                            />

                            {file ? (
                                <div className="space-y-3">
                                    <FileSpreadsheet className="w-12 h-12 text-green-600 mx-auto" />
                                    <div>
                                        <p className="font-semibold text-gray-900">{file.name}</p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {(file.size / 1024).toFixed(2)} KB
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleReset}
                                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        Chọn file khác
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                                    <div>
                                        <p className="text-gray-700 font-medium">
                                            Kéo thả file vào đây hoặc
                                        </p>
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            chọn file từ máy tính
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        Hỗ trợ: CSV, Excel (.xls, .xlsx)
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Instructions */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">
                                Hướng dẫn import
                            </h4>
                            <ul className="text-sm text-gray-700 space-y-1">
                                <li>• File phải có các cột: Tên KH, Số điện thoại, Email (bắt buộc)</li>
                                <li>• Các cột tùy chọn: Địa chỉ, Người phụ trách, Trạng thái, Ghi chú</li>
                                <li>• Mỗi dòng là một khách hàng</li>
                                <li>• Tối đa 1000 khách hàng mỗi lần import</li>
                            </ul>
                        </div>
                    </>
                ) : (
                    /* Import Result */
                    <div className="space-y-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                                <div>
                                    <h4 className="text-sm font-semibold text-green-900">
                                        Import thành công {importResult.success} khách hàng
                                    </h4>
                                    <p className="text-sm text-green-700 mt-1">
                                        Dữ liệu đã được thêm vào hệ thống
                                    </p>
                                </div>
                            </div>
                        </div>

                        {importResult.failed > 0 && (
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0" />
                                    <div className="flex-1">
                                        <h4 className="text-sm font-semibold text-orange-900 mb-2">
                                            {importResult.failed} dòng bị lỗi
                                        </h4>
                                        <div className="max-h-32 overflow-y-auto space-y-1">
                                            {importResult.errors.map((error, idx) => (
                                                <p key={idx} className="text-sm text-orange-700">
                                                    • {error}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
}
