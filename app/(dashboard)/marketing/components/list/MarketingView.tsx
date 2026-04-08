"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { initialCampaigns } from "@/mock-data/marketing";
import { CampaignForm } from "../forms/CampaignForm";
import { CampaignList } from "./CampaignList";
import {
  Campaign,
  CampaignFormState,
  channelOptions,
  segmentOptions,
} from "@/types/marketing";

const initialFormState: CampaignFormState = {
  name: "",
  channel: channelOptions[0].value,
  segment: segmentOptions[0].value,
  scheduledAt: "",
  message: "",
};

export function MarketingView() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [form, setForm] = useState<CampaignFormState>(initialFormState);

  const totalSent = useMemo(
    () => campaigns.reduce((sum, campaign) => sum + campaign.sent, 0),
    [campaigns],
  );

  const handleCreateCampaign = () => {
    const name = form.name.trim();
    const message = form.message.trim();

    if (!name || !message) {
      return;
    }

    const nextCampaign: Campaign = {
      id: `camp-${Date.now()}`,
      name,
      channel: form.channel,
      segment: form.segment,
      scheduledAt: form.scheduledAt || "Chưa đặt lịch",
      message,
      status: form.scheduledAt ? "scheduled" : "draft",
      sent: 0,
      failed: 0,
    };

    setCampaigns((prev) => [nextCampaign, ...prev]);
    setForm((prev) => ({ ...prev, name: "", scheduledAt: "", message: "" }));
  };

  const handleRunCampaign = (campaignId: string) => {
    setCampaigns((prev) =>
      prev.map((campaign) => {
        if (campaign.id !== campaignId) {
          return campaign;
        }

        const sent = Math.floor(Math.random() * 300 + 120);
        const failed = Math.floor(sent * 0.07);

        return {
          ...campaign,
          status: "completed",
          sent,
          failed,
        };
      }),
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Marketing</h1>
        <p className="mt-1 text-gray-500">
          Tạo chiến dịch broadcast, gửi theo phân nhóm và theo dõi kết quả.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="py-5">
            <p className="text-sm text-gray-500">Tổng chiến dịch</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{campaigns.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-5">
            <p className="text-sm text-gray-500">Đang chạy / đã lịch</p>
            <p className="mt-1 text-2xl font-bold text-orange-600">
              {
                campaigns.filter((campaign) =>
                  campaign.status === "running" || campaign.status === "scheduled",
                ).length
              }
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-5">
            <p className="text-sm text-gray-500">Tổng tin đã gửi</p>
            <p className="mt-1 text-2xl font-bold text-green-700">
              {totalSent.toLocaleString("vi-VN")}
            </p>
          </CardContent>
        </Card>
      </div>

      <CampaignForm form={form} onChange={setForm} onCreateCampaign={handleCreateCampaign} />
      <CampaignList campaigns={campaigns} onRunCampaign={handleRunCampaign} />
    </div>
  );
}
