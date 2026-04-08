"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { FiPlay, FiTrash2 } from "react-icons/fi";
import { AutomationRule } from "@/types/automation";

interface AutomationRuleListProps {
  rules: AutomationRule[];
  onRunRule: (ruleId: string) => void;
  onToggleRule: (ruleId: string) => void;
  onDeleteRule: (ruleId: string) => void;
}

export function AutomationRuleList({
  rules,
  onRunRule,
  onToggleRule,
  onDeleteRule,
}: AutomationRuleListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Danh sách workflow</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rules.map((rule) => (
          <div key={rule.id} className="rounded-xl border border-gray-200 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="font-semibold text-gray-900">{rule.name}</p>
                <p className="text-sm text-gray-600">
                  Trigger: {rule.trigger} - Action: {rule.action}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant={rule.isActive ? "success" : "warning"}>
                    {rule.isActive ? "Đang bật" : "Đang tắt"}
                  </Badge>
                  <Badge variant="info">Segment: {rule.targetSegment}</Badge>
                  <Badge variant="default">Delay: {rule.delayMinutes} phút</Badge>
                </div>
              </div>
              <p className="text-sm text-gray-500">Lần chạy gần nhất: {rule.lastRun}</p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => onRunRule(rule.id)}>
                <FiPlay className="mr-2 h-4 w-4" />
                Chạy thử
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onToggleRule(rule.id)}>
                {rule.isActive ? "Tạm dừng" : "Kích hoạt"}
              </Button>
              <Button variant="danger" size="sm" onClick={() => onDeleteRule(rule.id)}>
                <FiTrash2 className="mr-2 h-4 w-4" />
                Xóa
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
