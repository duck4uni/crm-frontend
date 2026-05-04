"use client";

import { useRef, useState } from "react";
import { FiAlertCircle, FiCheckCircle, FiDownload, FiFile, FiUpload, FiX } from "react-icons/fi";
import * as XLSX from "xlsx";
import type { ZbsTemplateParam } from "@/types/zalo-oa";

export interface CampaignRecipient {
    phone: string;
    templateData: Record<string, string>;
    rowIndex: number;
    errors: string[];
}

interface CampaignRecipientsImportProps {
    params: ZbsTemplateParam[];
    recipients: CampaignRecipient[];
    onChange: (recipients: CampaignRecipient[]) => void;
    templateName: string;
    templateCode: string;
}

const PHONE_REGEX = /^(0|84)[0-9]{8,10}$/;

const buildHeaders = (params: ZbsTemplateParam[]) => ["phone", ...params.map((p) => p.name)];

const buildSampleRow = (params: ZbsTemplateParam[]) => [
    "0901234567",
    ...params.map((p) => p.sample),
];

export function CampaignRecipientsImport({
    params,
    recipients,
    onChange,
    templateName,
    templateCode,
}: CampaignRecipientsImportProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = useState<string>("");
    const [parseError, setParseError] = useState<string>("");
    const [isDragging, setIsDragging] = useState(false);

    const headers = buildHeaders(params);

    const handleDownloadSample = () => {
        const sampleRow = buildSampleRow(params);
        const data = [headers, sampleRow];
        const ws = XLSX.utils.aoa_to_sheet(data);

        // Cấp width cho từng cột
        ws["!cols"] = headers.map((h) => ({ wch: Math.max(h.length + 2, 18) }));

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Recipients");
        const safeName = templateCode.replace(/[^A-Za-z0-9_-]/g, "_") || "template";
        XLSX.writeFile(wb, `mau_gui_${safeName}.xlsx`);
    };

    const parseFile = async (file: File) => {
        setParseError("");
        setFileName(file.name);
        try {
            const buffer = await file.arrayBuffer();
            const wb = XLSX.read(buffer, { type: "array" });
            const sheet = wb.Sheets[wb.SheetNames[0]];
            if (!sheet) {
                throw new Error("Không tìm thấy sheet trong file.");
            }
            const rows: string[][] = XLSX.utils.sheet_to_json(sheet, {
                header: 1,
                raw: false,
                defval: "",
            });

            if (rows.length < 2) {
                throw new Error("File rỗng hoặc chỉ có header. Cần ít nhất 1 dòng dữ liệu.");
            }

            const fileHeaders = rows[0].map((h) => String(h || "").trim().toLowerCase());
            const phoneIdx = fileHeaders.indexOf("phone");
            if (phoneIdx === -1) {
                throw new Error("File thiếu cột 'phone'.");
            }

            const paramIndexes: { name: string; idx: number; required: boolean }[] = params.map(
                (p) => ({
                    name: p.name,
                    idx: fileHeaders.indexOf(p.name.toLowerCase()),
                    required: p.required,
                }),
            );
            const missingRequired = paramIndexes.filter((p) => p.required && p.idx === -1);
            if (missingRequired.length > 0) {
                throw new Error(
                    `File thiếu cột bắt buộc: ${missingRequired.map((p) => p.name).join(", ")}`,
                );
            }

            const parsed: CampaignRecipient[] = [];
            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                const isEmpty = row.every((cell) => !String(cell || "").trim());
                if (isEmpty) continue;

                const phoneRaw = String(row[phoneIdx] || "").trim();
                const errors: string[] = [];
                if (!phoneRaw) {
                    errors.push("Thiếu số điện thoại");
                } else if (!PHONE_REGEX.test(phoneRaw.replace(/\s|-/g, ""))) {
                    errors.push("SĐT sai định dạng");
                }

                const templateData: Record<string, string> = {};
                for (const p of paramIndexes) {
                    const value = p.idx >= 0 ? String(row[p.idx] || "").trim() : "";
                    templateData[p.name] = value;
                    if (p.required && !value) {
                        errors.push(`Thiếu ${p.name}`);
                    }
                }

                parsed.push({
                    phone: phoneRaw,
                    templateData,
                    rowIndex: i + 1,
                    errors,
                });
            }

            if (parsed.length === 0) {
                throw new Error("Không có dòng dữ liệu hợp lệ.");
            }

            onChange(parsed);
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Không đọc được file.";
            setParseError(msg);
            onChange([]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) void parseFile(file);
        e.target.value = "";
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) void parseFile(file);
    };

    const handleClear = () => {
        onChange([]);
        setFileName("");
        setParseError("");
    };

    const validCount = recipients.filter((r) => r.errors.length === 0).length;
    const errorCount = recipients.length - validCount;

    return (
        <div className="space-y-3">
            <div className="rounded-lg border border-gray-200 bg-white p-3">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <p className="text-sm font-semibold text-gray-800">Nội dung tệp mẫu</p>
                        <p className="text-[11px] text-gray-500">
                            Dữ liệu trong tập danh sách tải lên cần đúng thứ tự cột và quy định về tham số như bên dưới.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleDownloadSample}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-primary-300 text-primary-700 hover:bg-primary-50 rounded-lg text-xs font-medium"
                    >
                        <FiDownload className="h-3.5 w-3.5" />
                        Tải tệp mẫu
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-[11px] border border-gray-100">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left px-2 py-1.5 font-medium text-gray-500 w-32">Vị trí cột</th>
                                {headers.map((_, i) => (
                                    <th key={i} className="text-left px-2 py-1.5 font-medium text-gray-500">
                                        Cột {i + 1}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-t border-gray-100">
                                <td className="px-2 py-1.5 text-gray-500">Tham số</td>
                                {headers.map((h) => (
                                    <td key={h} className="px-2 py-1.5 font-mono text-gray-700 bg-gray-50/50">
                                        {h}
                                    </td>
                                ))}
                            </tr>
                            <tr className="border-t border-gray-100">
                                <td className="px-2 py-1.5 text-gray-500">Dữ liệu mẫu</td>
                                <td className="px-2 py-1.5 text-gray-700">0901234567</td>
                                {params.map((p) => (
                                    <td key={p.name} className="px-2 py-1.5 text-gray-700">
                                        {p.sample}
                                    </td>
                                ))}
                            </tr>
                            <tr className="border-t border-gray-100">
                                <td className="px-2 py-1.5 text-gray-500">Yêu cầu</td>
                                <td className="px-2 py-1.5 text-primary-600">SĐT (84xxx hoặc 0xxx)</td>
                                {params.map((p) => (
                                    <td key={p.name} className="px-2 py-1.5 text-primary-600">
                                        {p.type}
                                        {p.required ? " *" : ""}
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div>
                <p className="text-sm font-semibold text-gray-800 mb-1">Tải lên danh sách</p>

                {recipients.length === 0 ? (
                    <div
                        onDragOver={(e) => {
                            e.preventDefault();
                            setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                            isDragging
                                ? "border-primary-400 bg-primary-50"
                                : "border-gray-300 hover:border-primary-300 bg-gray-50"
                        }`}
                    >
                        <FiUpload className="mx-auto h-6 w-6 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">
                            Kéo thả hoặc{" "}
                            <span className="text-primary-600 font-medium">tải danh sách lên</span>
                        </p>
                        <p className="text-[11px] text-gray-400 mt-1">
                            Định dạng hỗ trợ: CSV, XLS, XLSX
                        </p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv,.xls,.xlsx"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>
                ) : (
                    <div className="rounded-lg border border-gray-200 bg-white p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <FiFile className="h-4 w-4 text-primary-600" />
                            <span className="text-sm font-medium text-gray-800 truncate">{fileName}</span>
                            <span className="text-[11px] text-gray-500">
                                {recipients.length} dòng
                            </span>
                            <button
                                type="button"
                                onClick={handleClear}
                                className="ml-auto p-1 text-gray-400 hover:text-red-500"
                                title="Xóa file"
                            >
                                <FiX className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="flex items-center gap-3 text-xs mb-2">
                            <span className="flex items-center gap-1 text-emerald-700">
                                <FiCheckCircle className="h-3.5 w-3.5" />
                                {validCount} hợp lệ
                            </span>
                            {errorCount > 0 && (
                                <span className="flex items-center gap-1 text-red-600">
                                    <FiAlertCircle className="h-3.5 w-3.5" />
                                    {errorCount} lỗi
                                </span>
                            )}
                            <span className="text-gray-400">
                                Template: {templateName}
                            </span>
                        </div>

                        <div className="overflow-x-auto max-h-60 overflow-y-auto border border-gray-100 rounded">
                            <table className="w-full text-[11px]">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="text-left px-2 py-1 font-medium text-gray-500 w-10">#</th>
                                        <th className="text-left px-2 py-1 font-medium text-gray-500">phone</th>
                                        {params.map((p) => (
                                            <th key={p.name} className="text-left px-2 py-1 font-medium text-gray-500">
                                                {p.name}
                                            </th>
                                        ))}
                                        <th className="text-left px-2 py-1 font-medium text-gray-500">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recipients.slice(0, 100).map((r) => (
                                        <tr
                                            key={r.rowIndex}
                                            className={`border-t border-gray-100 ${r.errors.length > 0 ? "bg-red-50/40" : ""}`}
                                        >
                                            <td className="px-2 py-1 text-gray-400">{r.rowIndex}</td>
                                            <td className="px-2 py-1 font-mono text-gray-700">{r.phone || "—"}</td>
                                            {params.map((p) => (
                                                <td key={p.name} className="px-2 py-1 text-gray-700">
                                                    {r.templateData[p.name] || (
                                                        <span className="text-gray-300">—</span>
                                                    )}
                                                </td>
                                            ))}
                                            <td className="px-2 py-1">
                                                {r.errors.length === 0 ? (
                                                    <span className="text-emerald-600">Hợp lệ</span>
                                                ) : (
                                                    <span
                                                        className="text-red-600"
                                                        title={r.errors.join(", ")}
                                                    >
                                                        {r.errors.join(", ")}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {recipients.length > 100 && (
                                        <tr>
                                            <td
                                                colSpan={params.length + 3}
                                                className="px-2 py-2 text-center text-gray-400 italic"
                                            >
                                                ... và {recipients.length - 100} dòng nữa
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {parseError && (
                    <div className="mt-2 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                        <FiAlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                        <span>{parseError}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
