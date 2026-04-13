"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  FiSettings,
  FiChevronRight,
  FiSearch,
  FiLink,
  FiSend,
  FiTrash2,
} from "react-icons/fi";
import { Select } from "@/components/ui/Select";
import {
  initialConnections,
  mockConversations,
  mockConversationMessages,
  mockAutoConfigs,
} from "@/mock-data/zalo-oa";
import type {
  OaConnection,
  ZaloConversation,
  ZaloChatMessage,
  AutoConfig,
  AutoConfigFormState,
} from "@/types/zalo-oa";

type ActiveTab = "tuong-tac" | "cau-hinh";

const initialConfigForm: AutoConfigFormState = {
  oaId: "",
  showCrmUsername: false,
  autoCreateOpportunity: false,
};

// ─── Inline toggle (label left, switch right) ───────────────────────────────
function InlineToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 cursor-pointer select-none">
      <span className="text-sm text-gray-700">{label}</span>
      <div className="relative flex-shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div
          className={`w-10 h-5 rounded-full transition-colors duration-200 ${
            checked ? "bg-primary-600" : "bg-gray-300"
          }`}
        />
        <div
          className={`absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </div>
    </label>
  );
}

// ─── Empty state illustration ────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 text-center select-none">
      <svg
        width="168"
        height="160"
        viewBox="0 0 168 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Left gold speech bubble */}
        <rect x="4" y="26" width="52" height="38" rx="11" fill="#F5A623" />
        <polygon points="12,64 4,80 38,64" fill="#F5A623" />
        {/* Center navy speech bubble */}
        <rect x="38" y="8" width="92" height="56" rx="14" fill="#1C3661" />
        <polygon points="54,64 42,84 82,64" fill="#1C3661" />
        {/* Right gold speech bubble */}
        <rect x="112" y="26" width="52" height="38" rx="11" fill="#F5A623" />
        <polygon points="126,64 164,80 138,64" fill="#F5A623" />
        {/* People: left gold */}
        <circle cx="34" cy="108" r="12" fill="#F5A623" />
        <path d="M14 142 Q14 126 34 126 Q54 126 54 142" fill="#F5A623" />
        {/* People: center navy */}
        <circle cx="84" cy="102" r="16" fill="#1C3661" />
        <path d="M56 142 Q56 124 84 124 Q112 124 112 142" fill="#1C3661" />
        {/* People: right gold */}
        <circle cx="134" cy="108" r="12" fill="#F5A623" />
        <path d="M114 142 Q114 126 134 126 Q154 126 154 142" fill="#F5A623" />
      </svg>
      <p className="text-sm text-gray-400">Chọn một cuộc trò chuyện để bắt đầu</p>
    </div>
  );
}

// ─── Single conversation row ─────────────────────────────────────────────────
function ConversationRow({
  conv,
  isActive,
  onClick,
}: {
  conv: ZaloConversation;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-3 px-3 py-2.5 text-left transition-colors border-b border-gray-100 last:border-0 ${
        isActive ? "bg-primary-50" : "hover:bg-gray-50"
      }`}
    >
      <div className="relative flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center overflow-hidden">
          {conv.avatar ? (
            <Image src={conv.avatar} alt={conv.name} fill sizes="40px" className="object-cover" unoptimized />
          ) : (
            <span className="text-white text-xs font-bold select-none">Z</span>
          )}
        </div>
        {conv.unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] leading-none flex items-center justify-center font-semibold px-1">
            {conv.unreadCount}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-1">
          <p
            className={`text-sm leading-tight truncate ${
              conv.unreadCount > 0 ? "font-semibold text-gray-900" : "font-medium text-gray-700"
            }`}
          >
            {conv.name}
          </p>
          <span className="text-[10px] text-gray-400 flex-shrink-0 mt-0.5">{conv.timestamp}</span>
        </div>
        {conv.lastMessage && (
          <p className="text-xs text-gray-500 truncate mt-0.5">{conv.lastMessage}</p>
        )}
      </div>
    </button>
  );
}

function ChatMessageRow({ message }: { message: ZaloChatMessage }) {
  if (message.sender === "system") {
    return (
      <div className="flex justify-center">
        <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] text-gray-500">
          {message.content}
        </span>
      </div>
    );
  }

  const isAgent = message.sender === "agent";

  return (
    <div className={`flex ${isAgent ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[75%] ${isAgent ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <div
          className={`rounded-2xl px-3 py-2 text-sm leading-relaxed ${
            isAgent ? "bg-primary-600 text-white rounded-br-md" : "bg-white text-gray-800 rounded-bl-md border border-gray-200"
          }`}
        >
          {message.content}
        </div>
        <span className="text-[11px] text-gray-400">{message.timestamp}</span>
      </div>
    </div>
  );
}

// ─── Main view ───────────────────────────────────────────────────────────────
export function ZaloOaView() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("tuong-tac");
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [configFormOpen, setConfigFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [chatComposerValue, setChatComposerValue] = useState("");
  const [conversations, setConversations] = useState<ZaloConversation[]>(mockConversations);
  const [messagesByConversation, setMessagesByConversation] =
    useState<Record<string, ZaloChatMessage[]>>(mockConversationMessages);
  const [connections] = useState<OaConnection[]>(initialConnections);
  const [autoConfigs, setAutoConfigs] = useState<AutoConfig[]>(mockAutoConfigs);
  const [configForm, setConfigForm] = useState<AutoConfigFormState>(initialConfigForm);
  const [selectedOaFilter, setSelectedOaFilter] = useState("all");

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedConvId) || null,
    [conversations, selectedConvId],
  );

  const selectedOaName = useMemo(() => {
    if (!selectedConversation) {
      return "";
    }

    return connections.find((connection) => connection.id === selectedConversation.oaId)?.oaName || "";
  }, [connections, selectedConversation]);

  const selectedMessages = useMemo(() => {
    if (!selectedConvId) {
      return [];
    }

    return messagesByConversation[selectedConvId] || [];
  }, [messagesByConversation, selectedConvId]);

  const filteredConversations = useMemo(
    () =>
      conversations.filter((c) => {
        const matchedByOa = selectedOaFilter === "all" || c.oaId === selectedOaFilter;
        const matchedByName = c.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchedByOa && matchedByName;
      }),
    [conversations, searchQuery, selectedOaFilter],
  );

  useEffect(() => {
    if (!selectedConvId || selectedOaFilter === "all") {
      return;
    }

    const selected = conversations.find((conversation) => conversation.id === selectedConvId);
    if (selected && selected.oaId !== selectedOaFilter) {
      setSelectedConvId(null);
      setChatComposerValue("");
    }
  }, [conversations, selectedConvId, selectedOaFilter]);

  const handleAddConfig = () => {
    if (!configForm.oaId) return;
    const oa = connections.find((c) => c.id === configForm.oaId);
    if (!oa) return;
    const newConfig: AutoConfig = {
      id: `ac-${Date.now()}`,
      oaName: oa.oaName,
      createdBy: "Admin CRM",
      createdByRole: "Quản trị viên hệ thống",
      createdAt: new Date().toLocaleString("vi-VN", { hour12: false }),
    };
    setAutoConfigs((prev) => [newConfig, ...prev]);
    setConfigForm(initialConfigForm);
    setConfigFormOpen(false);
  };

  const openSettings = () => {
    setConfigFormOpen(false);
    setSettingsOpen(true);
  };

  const openConfigForm = () => {
    setSettingsOpen(false);
    setConfigFormOpen(true);
  };

  const handleSendMockMessage = () => {
    if (!selectedConvId || !chatComposerValue.trim()) {
      return;
    }

    const nowTime = new Date().toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const newMessage: ZaloChatMessage = {
      id: `${selectedConvId}-local-${Date.now()}`,
      conversationId: selectedConvId,
      sender: "agent",
      content: chatComposerValue.trim(),
      timestamp: nowTime,
    };

    setMessagesByConversation((prev) => ({
      ...prev,
      [selectedConvId]: [...(prev[selectedConvId] || []), newMessage],
    }));
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === selectedConvId
          ? {
              ...conversation,
              lastMessage: newMessage.content,
              timestamp: nowTime,
              unreadCount: 0,
            }
          : conversation,
      ),
    );
    setChatComposerValue("");
  };

  return (
    <div className="flex h-full overflow-hidden bg-white">
      {/* ════════════════════ LEFT PANEL ════════════════════ */}
      <div className="w-[320px] flex-shrink-0 flex flex-col bg-white border-r border-gray-200">
        {/* Top bar: OA selector + gear */}
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100 flex-shrink-0">
          <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-gray-500">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
            </svg>
          </div>
          <Select
            value={selectedOaFilter}
            onChange={(e) => setSelectedOaFilter(e.currentTarget.value)}
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
            onClick={openSettings}
            className={`p-1.5 rounded-md transition-colors ${
              settingsOpen
                ? "text-primary-600 bg-primary-50"
                : "text-gray-500 hover:bg-gray-100 hover:text-primary-600"
            }`}
            title="Cài đặt ZaloOA"
          >
            <FiSettings className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 flex-shrink-0">
          {(
            [
              { key: "tuong-tac", label: "Tương tác" },
              { key: "cau-hinh", label: "Cấu hình tự động" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors relative ${
                activeTab === tab.key ? "text-primary-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-t" />
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="px-3 py-2 border-b border-gray-100 flex-shrink-0">
          <div className="relative">
            <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên"
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100 placeholder:text-gray-400 bg-white"
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {filteredConversations.map((conv) => (
            <ConversationRow
              key={conv.id}
              conv={conv}
              isActive={selectedConvId === conv.id && activeTab === "tuong-tac"}
              onClick={() => {
                setSelectedConvId(conv.id);
                setActiveTab("tuong-tac");
              }}
            />
          ))}
          {filteredConversations.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-10">Không tìm thấy</p>
          )}
        </div>
      </div>

      {/* ════════════════════ RIGHT MAIN AREA ════════════════════ */}
      <div className="flex-1 relative overflow-hidden flex flex-col bg-gray-50 min-w-0">
        {activeTab === "tuong-tac" ? (
          selectedConversation ? (
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {selectedConversation.avatar ? (
                      <Image
                        src={selectedConversation.avatar}
                        alt={selectedConversation.name}
                        fill
                        sizes="40px"
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <span className="text-white text-sm font-semibold select-none">Z</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{selectedConversation.name}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {selectedConversation.customerPhone || "Chưa có số điện thoại"}
                      {selectedOaName ? ` • ${selectedOaName}` : ""}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {selectedMessages.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center pt-8">Chưa có tin nhắn trong hội thoại này.</p>
                ) : (
                  selectedMessages.map((message) => (
                    <ChatMessageRow key={message.id} message={message} />
                  ))
                )}
              </div>

              <div className="border-t border-gray-200 bg-white p-3">
                <div className="flex items-end gap-2">
                  <textarea
                    value={chatComposerValue}
                    onChange={(event) => setChatComposerValue(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        handleSendMockMessage();
                      }
                    }}
                    placeholder="Nhập nội dung tin nhắn..."
                    rows={2}
                    className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  />
                  <button
                    type="button"
                    onClick={handleSendMockMessage}
                    disabled={!chatComposerValue.trim()}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
                    title="Gửi tin nhắn"
                  >
                    <FiSend className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-2 text-[11px] text-gray-400">Nhấn Enter để gửi, Shift + Enter để xuống dòng.</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState />
            </div>
          )
        ) : (
          /* Cấu hình tự động */
          <div className="flex-1 overflow-auto p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-800">Cấu hình tự động</h2>
              <button
                onClick={openConfigForm}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Thêm cấu hình
              </button>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-left">
                    <th className="px-4 py-3 font-medium text-gray-600 w-10">#</th>
                    <th className="px-4 py-3 font-medium text-gray-600">OA áp dụng</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Người tạo</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Ngày tạo</th>
                    <th className="px-4 py-3 font-medium text-gray-600 w-24">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {autoConfigs.map((cfg, idx) => (
                    <tr
                      key={cfg.id}
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800">{cfg.oaName}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                            {cfg.createdBy.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-primary-600 leading-tight">
                              {cfg.createdBy}
                            </p>
                            <p className="text-[10px] text-gray-500 leading-tight">
                              {cfg.createdByRole}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{cfg.createdAt}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() =>
                            setAutoConfigs((prev) => prev.filter((c) => c.id !== cfg.id))
                          }
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Xóa"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {autoConfigs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-400">
                        Chưa có cấu hình nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════ Settings panel (slide-in from right) ════ */}
        <div
          className={`absolute inset-y-0 right-0 w-[380px] bg-white border-l border-gray-200 shadow-xl flex flex-col transition-transform duration-300 z-20 ${
            settingsOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <button
            onClick={() => setSettingsOpen(false)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center text-gray-500 hover:text-primary-600 z-30 transition-colors"
          >
            <FiChevronRight className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 flex-shrink-0">
            <h3 className="text-sm font-semibold text-gray-900">Cài đặt ZaloOA</h3>
            <button className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium rounded-lg transition-colors">
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
                <button
                  className={`flex-shrink-0 p-1.5 rounded-md transition-colors ${
                    conn.isActive
                      ? "text-primary-600 hover:bg-primary-50"
                      : "text-gray-400 hover:bg-gray-100"
                  }`}
                  title={conn.isActive ? "Đã kết nối" : "Chưa kết nối"}
                >
                  <FiLink className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ════ Auto-config form panel (slide-in from right) ════ */}
        <div
          className={`absolute inset-y-0 right-0 w-[380px] bg-white border-l border-gray-200 shadow-xl flex flex-col transition-transform duration-300 z-20 ${
            configFormOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <button
            onClick={() => setConfigFormOpen(false)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center text-gray-500 hover:text-primary-600 z-30 transition-colors"
          >
            <FiChevronRight className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 flex-shrink-0">
            <h3 className="text-sm font-semibold text-gray-900">Thêm cấu hình tự động</h3>
            <button
              onClick={handleAddConfig}
              disabled={!configForm.oaId}
              className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium rounded-lg transition-colors"
            >
              Thêm mới
            </button>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0 px-5 py-5 space-y-6">
            {/* OA selector */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                OA áp dụng <span className="text-red-500 font-semibold">(*)</span>
              </label>
              <Select
                value={configForm.oaId}
                onChange={(e) => setConfigForm({ ...configForm, oaId: e.currentTarget.value })}
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

            {/* Toggle options */}
            <div className="space-y-5 pt-1">
              <InlineToggle
                label="Cho phép hiển thị tên đăng nhập CRM"
                checked={configForm.showCrmUsername}
                onChange={(v) => setConfigForm({ ...configForm, showCrmUsername: v })}
              />
              <InlineToggle
                label="Tự động tạo cơ hội khi có inbox/bình luận"
                checked={configForm.autoCreateOpportunity}
                onChange={(v) => setConfigForm({ ...configForm, autoCreateOpportunity: v })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
