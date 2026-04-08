"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { initialRules } from "@/mock-data/automation";
import { AutomationRuleForm } from "../forms/AutomationRuleForm";
import { AutomationRuleList } from "./AutomationRuleList";
import {
  actionOptions,
  AutomationFormState,
  AutomationRule,
  segmentOptions,
  triggerOptions,
} from "@/types/automation";

const initialFormState: AutomationFormState = {
  name: "",
  trigger: triggerOptions[0].value,
  action: actionOptions[0].value,
  targetSegment: segmentOptions[0].value,
  delayMinutes: "15",
};

export function AutomationView() {
  const [rules, setRules] = useState<AutomationRule[]>(initialRules);
  const [form, setForm] = useState<AutomationFormState>(initialFormState);

  const activeRules = useMemo(
    () => rules.filter((item) => item.isActive).length,
    [rules],
  );

  const handleCreateRule = () => {
    const name = form.name.trim();
    if (!name) {
      return;
    }

    const newRule: AutomationRule = {
      id: `rule-${Date.now()}`,
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

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Automation</h1>
        <p className="mt-1 text-gray-500">
          Thiết kế luồng tự động cho chăm sóc khách hàng và điều phối vận hành.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="py-5">
            <p className="text-sm text-gray-500">Tổng workflow</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{rules.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-5">
            <p className="text-sm text-gray-500">Đang hoạt động</p>
            <p className="mt-1 text-2xl font-bold text-green-600">{activeRules}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-5">
            <p className="text-sm text-gray-500">Tạm dừng</p>
            <p className="mt-1 text-2xl font-bold text-orange-600">{rules.length - activeRules}</p>
          </CardContent>
        </Card>
      </div>

      <AutomationRuleForm
        form={form}
        onChange={setForm}
        onCreateRule={handleCreateRule}
      />

      <AutomationRuleList
        rules={rules}
        onRunRule={handleRunRule}
        onToggleRule={handleToggleRule}
        onDeleteRule={handleDeleteRule}
      />
    </div>
  );
}
