"use client";

import { useState } from "react";
import { FiX, FiZap } from "react-icons/fi";
import type { UseMarketingAutomationReturn } from "../_hooks/useMarketingAutomation";

interface Props {
  hook: UseMarketingAutomationReturn;
}

const CATEGORY_TABS = [
  { id: "all", label: "Tất cả" },
  { id: "welcome", label: "Chào mừng" },
  { id: "nurture", label: "Chăm sóc" },
  { id: "upsell", label: "Upsell" },
  { id: "reminder", label: "Nhắc nhở" },
];

const CATEGORY_COLORS: Record<string, string> = {
  welcome: "bg-blue-100 text-blue-600",
  nurture: "bg-green-100 text-green-600",
  upsell: "bg-purple-100 text-purple-600",
  reminder: "bg-orange-100 text-orange-600",
  all: "bg-gray-100 text-gray-600",
};

export function TemplatePicker({ hook }: Props) {
  const { templates, setShowTemplatePicker, onCreate } = hook;
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = activeCategory === "all"
    ? templates
    : templates.filter((t) => t.category === activeCategory);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={() => setShowTemplatePicker(false)}
      />
      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Chọn template</h3>
            <p className="text-xs text-gray-500 mt-0.5">Chọn template hoặc tạo từ đầu</p>
          </div>
          <button
            onClick={() => setShowTemplatePicker(false)}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Create from scratch */}
        <div className="px-5 py-3 border-b border-gray-100">
          <button
            onClick={() => onCreate()}
            className="w-full flex items-center gap-3 border-2 border-dashed border-primary-300 rounded-lg px-4 py-3 text-sm text-primary-600 font-medium hover:bg-primary-50 transition-colors"
          >
            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center shrink-0">
              <FiZap className="w-4 h-4" />
            </div>
            Tạo automation từ đầu
          </button>
        </div>

        {/* Category tabs */}
        <div className="px-5 py-2 border-b border-gray-100">
          <div className="flex gap-1 overflow-x-auto">
            {CATEGORY_TABS.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  activeCategory === cat.id
                    ? "bg-primary-100 text-primary-700"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Template list */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
          {filtered.map((tpl) => {
            const colorCls = CATEGORY_COLORS[tpl.category] ?? "bg-gray-100 text-gray-600";
            return (
              <div
                key={tpl.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-sm transition-all cursor-pointer group"
                onClick={() => onCreate(tpl)}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${colorCls}`}>
                    <FiZap className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-primary-700">{tpl.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{tpl.moTa}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${colorCls}`}>
                        {CATEGORY_TABS.find((c) => c.id === tpl.category)?.label ?? tpl.category}
                      </span>
                      <span className="text-xs text-gray-400">{tpl.nodes.length} bước</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onCreate(tpl); }}
                  className="mt-3 w-full text-xs font-medium text-primary-600 border border-primary-200 rounded-lg py-1.5 hover:bg-primary-50 transition-colors opacity-0 group-hover:opacity-100"
                >
                  Dùng template này
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
