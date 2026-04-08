"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FiPlus } from "react-icons/fi";
import {
  actionOptions,
  AutomationFormState,
  segmentOptions,
  triggerOptions,
} from "@/types/automation";

interface AutomationRuleFormProps {
  form: AutomationFormState;
  onChange: (next: AutomationFormState) => void;
  onCreateRule: () => void;
}

export function AutomationRuleForm({ form, onChange, onCreateRule }: AutomationRuleFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tạo workflow mới</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
        <Input
          label="Tên workflow"
          value={form.name}
          onChange={(event) => onChange({ ...form, name: event.target.value })}
          placeholder="Ví dụ: Nhắc khách không tương tác"
        />
        <Select
          label="Trigger"
          value={form.trigger}
          options={triggerOptions}
          onChange={(event) => onChange({ ...form, trigger: event.target.value })}
        />
        <Select
          label="Hành động"
          value={form.action}
          options={actionOptions}
          onChange={(event) => onChange({ ...form, action: event.target.value })}
        />
        <Select
          label="Nhóm khách"
          value={form.targetSegment}
          options={segmentOptions}
          onChange={(event) => onChange({ ...form, targetSegment: event.target.value })}
        />
        <Input
          label="Delay (phút)"
          type="number"
          min={0}
          value={form.delayMinutes}
          onChange={(event) => onChange({ ...form, delayMinutes: event.target.value })}
        />
        <div className="flex justify-end lg:col-span-5">
          <Button onClick={onCreateRule}>
            <FiPlus className="mr-2 h-4 w-4" />
            Thêm workflow
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
