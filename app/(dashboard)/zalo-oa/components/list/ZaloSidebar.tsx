"use client";

import { FiSearch, FiSettings } from "react-icons/fi";
import { Select } from "@/components/ui/Select";
import type { OaConnection, ZaloConversation } from "@/types/zalo-oa";
import { ConversationRow } from "./ConversationRow";

interface ZaloSidebarProps {
    selectedOaFilter: string;
    onSelectedOaFilterChange: (value: string) => void;
    connections: OaConnection[];
    settingsOpen: boolean;
    onOpenSettings: () => void;
    activeTab: "tuong-tac" | "cau-hinh";
    onActiveTabChange: (tab: "tuong-tac" | "cau-hinh") => void;
    searchQuery: string;
    onSearchQueryChange: (value: string) => void;
    filteredConversations: ZaloConversation[];
    selectedConvId: string | null;
    onSelectConversation: (conversationId: string) => void;
}

export function ZaloSidebar({
    selectedOaFilter,
    onSelectedOaFilterChange,
    connections,
    settingsOpen,
    onOpenSettings,
    activeTab,
    onActiveTabChange,
    searchQuery,
    onSearchQueryChange,
    filteredConversations,
    selectedConvId,
    onSelectConversation,
}: ZaloSidebarProps) {
    return (
        <div className="w-[320px] flex-shrink-0 flex flex-col bg-white border-r border-gray-200">
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100 flex-shrink-0">
                <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-gray-500">
                        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                    </svg>
                </div>
                <Select
                    value={selectedOaFilter}
                    onChange={(e) => onSelectedOaFilterChange(e.currentTarget.value)}
                    options={[
                        { value: "all", label: "Tất cả" },
                        ...connections.map((c) => ({
                            value: c.id,
                            label: c.oaName,
                        })),
                    ]}
                    className="flex-1 !border-none !bg-transparent !outline-none text-sm font-medium text-gray-800"
                    variant="subtle"
                    size="sm"
                />
                <button
                    onClick={onOpenSettings}
                    className={`p-1.5 rounded-md transition-colors ${settingsOpen
                            ? "text-primary-600 bg-primary-50"
                            : "text-gray-500 hover:bg-gray-100 hover:text-primary-600"
                        }`}
                    title="Cài đặt ZaloOA"
                >
                    <FiSettings className="w-4 h-4" />
                </button>
            </div>

            <div className="flex border-b border-gray-200 flex-shrink-0">
                {(
                    [
                        { key: "tuong-tac", label: "Tương tác" },
                        { key: "cau-hinh", label: "Cấu hình tự động" },
                    ] as const
                ).map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => onActiveTabChange(tab.key)}
                        className={`flex-1 py-2.5 text-sm font-medium transition-colors relative ${activeTab === tab.key ? "text-primary-600" : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        {tab.label}
                        {activeTab === tab.key && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-t" />
                        )}
                    </button>
                ))}
            </div>

            <div className="px-3 py-2 border-b border-gray-100 flex-shrink-0">
                <div className="relative">
                    <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchQueryChange(e.target.value)}
                        placeholder="Tìm theo tên"
                        className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100 placeholder:text-gray-400 bg-white"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0">
                {filteredConversations.map((conv) => (
                    <ConversationRow
                        key={conv.id}
                        conv={conv}
                        isActive={selectedConvId === conv.id && activeTab === "tuong-tac"}
                        onClick={() => onSelectConversation(conv.id)}
                    />
                ))}
                {filteredConversations.length === 0 && (
                    <p className="text-center text-sm text-gray-400 py-10">Không tìm thấy</p>
                )}
            </div>
        </div>
    );
}
