"use client";

import { FiTrash2 } from "react-icons/fi";
import type { UseMarketingAutomationReturn } from "../_hooks/useMarketingAutomation";

interface Props {
  hook: UseMarketingAutomationReturn;
}

const TRIGGER_EVENTS = [
  { value: "follow_oa", label: "Theo dõi OA" },
  { value: "send_message", label: "Gửi tin nhắn" },
  { value: "click_link", label: "Click link" },
  { value: "order_complete", label: "Hoàn thành đơn hàng" },
  { value: "cart_abandon", label: "Bỏ giỏ hàng" },
  { value: "birthday", label: "Sinh nhật khách hàng" },
  { value: "service_expiry", label: "Sắp hết hạn dịch vụ" },
];

const ACTIONS = [
  { value: "send_zalo", label: "Gửi tin Zalo" },
  { value: "add_tag", label: "Gán tag khách hàng" },
  { value: "remove_tag", label: "Gỡ tag khách hàng" },
  { value: "update_attr", label: "Cập nhật thuộc tính" },
  { value: "create_task", label: "Tạo task" },
  { value: "assign_staff", label: "Gán nhân viên" },
];

export function NodeConfigPanel({ hook }: Props) {
  const { builderNodes, selectedNodeId, updateNodeConfig, deleteNode } = hook;

  const node = builderNodes.find((n) => n.id === selectedNodeId);
  if (!node) {
    return (
      <div className="w-72 border-l border-gray-200 bg-gray-50 flex items-center justify-center p-6">
        <p className="text-sm text-gray-400 text-center">Chọn một node để cấu hình</p>
      </div>
    );
  }

  const cfg = node.config as Record<string, string>;

  const updateCfg = (key: string, value: string) => {
    updateNodeConfig(node.id, { config: { ...cfg, [key]: value } });
  };

  const updateLabel = (label: string) => {
    updateNodeConfig(node.id, { label } as Record<string, unknown>);
  };

  return (
    <div className="w-72 border-l border-gray-200 bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">Cấu hình node</p>
          <p className="text-xs text-gray-400 capitalize">{node.type}</p>
        </div>
        <button
          onClick={() => deleteNode(node.id)}
          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Xoá node"
        >
          <FiTrash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Config form */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Label */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Tên hiển thị</label>
          <input
            value={node.label}
            onChange={(e) => updateLabel(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Trigger config */}
        {node.type === "trigger" && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Sự kiện kích hoạt</label>
              <select
                value={cfg.event ?? ""}
                onChange={(e) => updateCfg("event", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">-- Chọn sự kiện --</option>
                {TRIGGER_EVENTS.map((ev) => (
                  <option key={ev.value} value={ev.value}>{ev.label}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* Condition config */}
        {node.type === "condition" && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Loại điều kiện</label>
              <select
                value={cfg.field ?? ""}
                onChange={(e) => updateCfg("field", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">-- Chọn trường --</option>
                <option value="tag">Tag khách hàng</option>
                <option value="order_value">Giá trị đơn hàng</option>
                <option value="renewed">Đã gia hạn</option>
                <option value="gender">Giới tính</option>
                <option value="city">Thành phố</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Điều kiện</label>
              <select
                value={cfg.op ?? ""}
                onChange={(e) => updateCfg("op", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">-- Chọn --</option>
                <option value="eq">Bằng</option>
                <option value="ne">Không bằng</option>
                <option value="gt">Lớn hơn</option>
                <option value="lt">Nhỏ hơn</option>
                <option value="contains">Chứa</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Giá trị</label>
              <input
                value={cfg.value ?? ""}
                onChange={(e) => updateCfg("value", e.target.value)}
                placeholder="Nhập giá trị..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </>
        )}

        {/* Action config */}
        {node.type === "action" && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Hành động</label>
              <select
                value={cfg.action ?? ""}
                onChange={(e) => updateCfg("action", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">-- Chọn hành động --</option>
                {ACTIONS.map((a) => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
            </div>
            {cfg.action === "send_zalo" && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nội dung tin nhắn</label>
                <textarea
                  value={cfg.message ?? ""}
                  onChange={(e) => updateCfg("message", e.target.value)}
                  rows={4}
                  placeholder="Nhập nội dung tin nhắn Zalo..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>
            )}
            {(cfg.action === "add_tag" || cfg.action === "remove_tag") && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tên tag</label>
                <input
                  value={cfg.tag ?? ""}
                  onChange={(e) => updateCfg("tag", e.target.value)}
                  placeholder="VD: KH VIP, KH mới..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            )}
          </>
        )}

        {/* Delay config */}
        {node.type === "delay" && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Thời gian chờ</label>
              <input
                type="number"
                min={1}
                value={cfg.amount ?? "1"}
                onChange={(e) => updateCfg("amount", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Đơn vị</label>
              <select
                value={cfg.unit ?? "hour"}
                onChange={(e) => updateCfg("unit", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="minute">Phút</option>
                <option value="hour">Giờ</option>
                <option value="day">Ngày</option>
                <option value="week">Tuần</option>
              </select>
            </div>
          </>
        )}

        {node.type === "end" && (
          <p className="text-xs text-gray-400">Node kết thúc — không có cấu hình thêm.</p>
        )}
      </div>
    </div>
  );
}
