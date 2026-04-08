"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FiPlus } from "react-icons/fi";
import { CampaignFormState, channelOptions, segmentOptions } from "@/types/marketing";

interface CampaignFormProps {
  form: CampaignFormState;
  onChange: (next: CampaignFormState) => void;
  onCreateCampaign: () => void;
}

export function CampaignForm({ form, onChange, onCreateCampaign }: CampaignFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tạo campaign</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          <Input
            label="Tên chiến dịch"
            value={form.name}
            onChange={(event) => onChange({ ...form, name: event.target.value })}
            placeholder="Ví dụ: Ưu đãi vệ sinh tháng 4"
          />
          <Select
            label="Kênh gửi"
            value={form.channel}
            options={channelOptions}
            onChange={(event) => onChange({ ...form, channel: event.target.value })}
          />
          <Select
            label="Nhóm khách"
            value={form.segment}
            options={segmentOptions}
            onChange={(event) => onChange({ ...form, segment: event.target.value })}
          />
          <Input
            label="Lịch gửi"
            type="datetime-local"
            value={form.scheduledAt}
            onChange={(event) => onChange({ ...form, scheduledAt: event.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Nội dung</label>
          <textarea
            rows={4}
            value={form.message}
            onChange={(event) => onChange({ ...form, message: event.target.value })}
            placeholder="Nhập nội dung gửi tới khách hàng"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-transparent focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={onCreateCampaign}>
            <FiPlus className="mr-2 h-4 w-4" />
            Lưu chiến dịch
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
