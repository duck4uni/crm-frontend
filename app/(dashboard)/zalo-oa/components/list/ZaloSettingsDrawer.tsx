"use client";

import { useState } from "react";
import { FiChevronRight, FiRefreshCw, FiTrash2 } from "react-icons/fi";
import type { OaConnection } from "@/types/zalo-oa";
import { ZaloOaAddModal } from "../forms/ZaloOaAddModal";

interface ZaloSettingsDrawerProps {
    settingsOpen: boolean;
    onClose: () => void;
    connections: OaConnection[];
    onAddConnection: (connection: OaConnection) => void;
    onRemoveConnection: (id: string) => void;
}

export function ZaloSettingsDrawer({ settingsOpen, onClose, connections, onAddConnection, onRemoveConnection }: ZaloSettingsDrawerProps) {
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <>
            <div
                className={`absolute inset-y-0 right-0 w-[380px] bg-white border-l border-gray-200 shadow-xl flex flex-col transition-transform duration-300 z-20 ${settingsOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                <button
                    onClick={onClose}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center text-gray-500 hover:text-primary-600 z-30 transition-colors"
                >
                    <FiChevronRight className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 flex-shrink-0">
                    <h3 className="text-sm font-semibold text-gray-900">Cài đặt ZaloOA</h3>
                    <button
                        onClick={() => setModalOpen(true)}
                        className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium rounded-lg transition-colors"
                    >
                        Thêm mới
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-gray-100 min-h-0">
                    {connections.map((conn) => (
                        <div
                            key={conn.id}
                            className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors"
                        >
                            <div className="w-9 h-9 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-sm flex-shrink-0">
                                {conn.oaName.charAt(0)}
                            </div>
                            <p className="flex-1 text-sm text-gray-800 truncate min-w-0">
                                {conn.oaName} - {conn.oaOfficialId}
                            </p>
                            <div className="flex items-center gap-1 flex-shrink-0">
                                <button
                                    onClick={() => setModalOpen(true)}
                                    className="p-1.5 rounded-md text-primary-600 hover:bg-primary-50 transition-colors"
                                    title="Kết nối lại"
                                >
                                    <FiRefreshCw className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => onRemoveConnection(conn.id)}
                                    className="p-1.5 rounded-md text-red-500 hover:bg-red-50 transition-colors"
                                    title="Xoá kết nối"
                                >
                                    <FiTrash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <ZaloOaAddModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onConnected={(connection) => {
                    onAddConnection(connection);
                    setModalOpen(false);
                }}
            />
        </>
    );
}
