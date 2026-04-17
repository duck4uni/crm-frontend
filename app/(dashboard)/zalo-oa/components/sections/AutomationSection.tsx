"use client";

import { useMemo, useState } from "react";
import { FiTrash2, FiPlay, FiToggleLeft } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { initialRules } from "@/mock-data/automation";
import { initialConnections, mockConversations } from "@/mock-data/zalo-oa";
import {
  actionOptions,
  AutomationFormState,
  AutomationRule,
  segmentOptions,
  triggerOptions,
} from "@/types/automation";

const initialFormState: AutomationFormState = {
  oaId: initialConnections[0]?.id || "",
  name: "",
  trigger: triggerOptions[0].value,
  action: actionOptions[0].value,
  targetSegment: segmentOptions[0].value,
  delayMinutes: "15",
};

export function AutomationSection() {
  const [rules, setRules] = useState<AutomationRule[]>(initialRules);
  const [form, setForm] = useState<AutomationFormState>(initialFormState);

  const activeRules = useMemo(() => rules.filter((item) => item.isActive).length, [rules]);

  const handleCreateRule = () => {
    const name = form.name.trim();
    if (!name) {
      return;
    }

    const newRule: AutomationRule = {
      id: `rule-${Date.now()}`,
      oaId: form.oaId || initialConnections[0]?.id,
      name,
      trigger: form.trigger,
      action: form.action,
      targetSegment: form.targetSegment,
      delayMinutes: Number(form.delayMinutes) || 0,
      isActive: true,
      lastRun: "Chưa chạy",
    };

    setRules((prev) => [newRule, ...prev]);
    setForm((prev) => ({ ...prev, name: "", delayMinutes: "15" }));
  };

  const handleToggleRule = (ruleId: string) => {
    setRules((prev) =>
      prev.map((rule) =>
        rule.id === ruleId
          ? {
            ...rule,
            isActive: !rule.isActive,
          }
          : rule,
      ),
    );
  };

  const handleRunRule = (ruleId: string) => {
    setRules((prev) =>
      prev.map((rule) =>
        rule.id === ruleId
          ? {
            ...rule,
            lastRun: new Date().toLocaleString("vi-VN", { hour12: false }),
          }
          : rule,
      ),
    );
  };

  const handleDeleteRule = (ruleId: string) => {
    setRules((prev) => prev.filter((rule) => rule.id !== ruleId));
  };

  const oaOptions = useMemo(
    () => initialConnections.map((connection) => ({ value: connection.id, label: connection.oaName })),
    [],
  );

  const oaNameById = useMemo(
    () =>
      initialConnections.reduce<Record<string, string>>((acc, connection) => {
        acc[connection.id] = connection.oaName;
        return acc;
      }, {}),
    [],
  );

  const conversationsByOa = useMemo(
    () =>
      mockConversations.reduce<Record<string, number>>((acc, conversation) => {
        acc[conversation.oaId] = (acc[conversation.oaId] || 0) + 1;
        return acc;
      }, {}),
    [],
  );

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-sm font-semibold text-gray-800">Automation</h2>
        <p className="text-xs text-gray-500 mt-1">Thiết kế luồng tự động cho Zalo OA</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card>
          <CardContent className="py-3">
            <p className="text-xs text-gray-500">Tổng workflow</p>
            <p className="mt-1 text-lg font-bold text-gray-900">{rules.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3">
            <p className="text-xs text-gray-500">Đang hoạt động</p>
            <p className="mt-1 text-lg font-bold text-green-600">{activeRules}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3">
            <p className="text-xs text-gray-500">Tạm dừng</p>
            <p className="mt-1 text-lg font-bold text-orange-600">{rules.length - activeRules}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Tạo workflow mới</h3>
          <div className="space-y-3">
            <Select
              label="OA áp dụng"
              value={form.oaId || oaOptions[0]?.value || ""}
              onChange={(e) => setForm({ ...form, oaId: e.target.value })}
              options={oaOptions}
              size="md"
            />
            <Input
              label="Tên workflow"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="VD: Chào mừng khách mới"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Select
                label="Trigger"
                value={form.trigger}
                onChange={(e) => setForm({ ...form, trigger: e.target.value })}
                options={triggerOptions}
                size="md"
              />
              <Select
                label="Action"
                value={form.action}
                onChange={(e) => setForm({ ...form, action: e.target.value })}
                options={actionOptions}
                size="md"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Select
                label="Đối tượng"
                value={form.targetSegment}
                onChange={(e) => setForm({ ...form, targetSegment: e.target.value })}
                options={segmentOptions}
                size="md"
              />
              <Input
                label="Delay (phút)"
                type="number"
                value={form.delayMinutes}
                onChange={(e) => setForm({ ...form, delayMinutes: e.target.value })}
              />
            </div>
            <Button
              type="button"
              variant="primary"
              className="w-full text-sm"
              onClick={handleCreateRule}
              disabled={!form.name.trim()}
            >
              Thêm workflow
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left">
                <th className="px-3 py-2 font-medium text-gray-600">#</th>
                <th className="px-3 py-2 font-medium text-gray-600">Tên</th>
                <th className="px-3 py-2 font-medium text-gray-600">OA</th>
                <th className="px-3 py-2 font-medium text-gray-600">Trigger</th>
                <th className="px-3 py-2 font-medium text-gray-600">Action</th>
                <th className="px-3 py-2 font-medium text-gray-600">Hội thoại</th>
                <th className="px-3 py-2 font-medium text-gray-600">Lần cuối chạy</th>
                <th className="px-3 py-2 font-medium text-gray-600 w-20">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule, idx) => (
                <tr key={rule.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 text-xs">
                  <td className="px-3 py-2 text-gray-500">{idx + 1}</td>
                  <td className="px-3 py-2 font-medium text-gray-800">{rule.name}</td>
                  <td className="px-3 py-2 text-gray-600">{oaNameById[rule.oaId || ""] || "N/A"}</td>
                  <td className="px-3 py-2 text-gray-600">{rule.trigger}</td>
                  <td className="px-3 py-2 text-gray-600">{rule.action}</td>
                  <td className="px-3 py-2 text-gray-600">{conversationsByOa[rule.oaId || ""] || 0}</td>
                  <td className="px-3 py-2 text-gray-600">{rule.lastRun}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleRule(rule.id)}
                        className={`p-1 rounded transition-colors ${rule.isActive
                            ? "text-green-600 hover:bg-green-50"
                            : "text-gray-400 hover:bg-gray-100"
                          }`}
                        title={rule.isActive ? "Tắt" : "Bật"}
                      >
                        <FiToggleLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRunRule(rule.id)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Chạy ngay"
                      >
                        <FiPlay className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Xóa"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rules.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-gray-400">
                    Chưa có workflow nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
