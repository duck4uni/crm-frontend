"use client";

import { FiChevronRight } from "react-icons/fi";
import { Select } from "@/components/ui/Select";
import type { AutoConfigFormState, OaConnection } from "@/types/zalo-oa";
import { InlineToggle } from "./InlineToggle";

interface ZaloConfigFormDrawerProps {
    configFormOpen: boolean;
    onClose: () => void;
    onAddConfig: () => void;
    configForm: AutoConfigFormState;
    onConfigFormChange: (nextState: AutoConfigFormState) => void;
    connections: OaConnection[];
}

export function ZaloConfigFormDrawer({
    configFormOpen,
    onClose,
    onAddConfig,
    configForm,
    onConfigFormChange,
    connections,
}: ZaloConfigFormDrawerProps) {
    return (
        <div
            className={`absolute inset-y-0 right-0 w-[380px] bg-white border-l border-gray-200 shadow-xl flex flex-col transition-transform duration-300 z-20 ${configFormOpen ? "translate-x-0" : "translate-x-full"
                }`}
        >
            <button
                onClick={onClose}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center text-gray-500 hover:text-primary-600 z-30 transition-colors"
            >
                <FiChevronRight className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 flex-shrink-0">
                <h3 className="text-sm font-semibold text-gray-900">Thêm cấu hình tự động</h3>
                <button
                    onClick={onAddConfig}
                    disabled={!configForm.oaId}
                    className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium rounded-lg transition-colors"
                >
                    Thêm mới
                </button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 px-5 py-5 space-y-6">
                <div>
                    <label className="block text-sm text-gray-700 mb-2">
                        OA áp dụng <span className="text-red-500 font-semibold">(*)</span>
                    </label>
                    <Select
                        value={configForm.oaId}
                        onChange={(e) => onConfigFormChange({ ...configForm, oaId: e.currentTarget.value })}
                        options={[
                            { value: "", label: "Vui lòng chọn" },
                            ...connections.map((c) => ({
                                value: c.id,
                                label: c.oaName,
                            })),
                        ]}
                        className="w-full"
                        size="md"
                    />
                </div>

                <div className="space-y-5 pt-1">
                    <InlineToggle
                        label="Cho phép hiển thị tên đăng nhập CRM"
                        checked={configForm.showCrmUsername}
                        onChange={(v) => onConfigFormChange({ ...configForm, showCrmUsername: v })}
                    />
                    <InlineToggle
                        label="Tự động tạo cơ hội khi có inbox/bình luận"
                        checked={configForm.autoCreateOpportunity}
                        onChange={(v) => onConfigFormChange({ ...configForm, autoCreateOpportunity: v })}
                    />
                </div>
            </div>
        </div>
    );
}
