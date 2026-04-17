"use client";

import { useMemo, useState } from "react";
import { FiTrash2, FiPlay } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { initialCampaigns } from "@/mock-data/marketing";
import { initialConnections, mockConversations } from "@/mock-data/zalo-oa";
import {
  Campaign,
  CampaignFormState,
  segmentOptions,
} from "@/types/marketing";

const initialFormState: CampaignFormState = {
  name: "",
  channel: initialConnections[0]?.id || "",
  segment: segmentOptions[0].value,
  scheduledAt: "",
  message: "",
};

export function MarketingSection() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [form, setForm] = useState<CampaignFormState>(initialFormState);

  const totalSent = useMemo(
    () => campaigns.reduce((sum, campaign) => sum + campaign.sent, 0),
    [campaigns],
  );

  const channelOptions = useMemo(
    () => initialConnections.map((connection) => ({ value: connection.id, label: connection.oaName })),
    [],
  );

  const channelLabelById = useMemo(
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

  const handleDeleteCampaign = (campaignId: string) => {
    setCampaigns((prev) => prev.filter((campaign) => campaign.id !== campaignId));
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-sm font-semibold text-gray-800">Marketing</h2>
        <p className="text-xs text-gray-500 mt-1">Tạo chiến dịch broadcast cho Zalo OA</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card>
          <CardContent className="py-3">
            <p className="text-xs text-gray-500">Tổng chiến dịch</p>
            <p className="mt-1 text-lg font-bold text-gray-900">{campaigns.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3">
            <p className="text-xs text-gray-500">Đang chạy / đã lịch</p>
            <p className="mt-1 text-lg font-bold text-orange-600">
              {campaigns.filter((c) => c.status === "running" || c.status === "scheduled").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3">
            <p className="text-xs text-gray-500">Tổng tin gửi</p>
            <p className="mt-1 text-lg font-bold text-green-700">
              {totalSent.toLocaleString("vi-VN")}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Tạo chiến dịch mới</h3>
          <div className="space-y-3">
            <Input
              label="Tên chiến dịch"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="VD: Khuyến mãi mùa hè"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Select
                label="Kênh"
                value={form.channel}
                onChange={(e) => setForm({ ...form, channel: e.target.value })}
                options={channelOptions}
                size="md"
              />
              <Select
                label="Đối tượng"
                value={form.segment}
                onChange={(e) => setForm({ ...form, segment: e.target.value })}
                options={segmentOptions}
                size="md"
              />
            </div>
            <p className="text-xs text-gray-500">
              OA đang chọn có {conversationsByOa[form.channel] || 0} hội thoại trong mock-data Zalo OA.
            </p>
            <Input
              label="Nội dung tin nhắn"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Nhập nội dung chiến dịch"
            />
            <Input
              label="Lịch gửi (nếu có)"
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
            />
            <Button
              type="button"
              variant="primary"
              className="w-full text-sm"
              onClick={handleCreateCampaign}
              disabled={!form.name.trim() || !form.message.trim()}
            >
              Tạo chiến dịch
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
                <th className="px-3 py-2 font-medium text-gray-600">Kênh</th>
                <th className="px-3 py-2 font-medium text-gray-600">Trạng thái</th>
                <th className="px-3 py-2 font-medium text-gray-600">Hội thoại OA</th>
                <th className="px-3 py-2 font-medium text-gray-600">Gửi / Lỗi</th>
                <th className="px-3 py-2 font-medium text-gray-600 w-20">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign, idx) => (
                <tr key={campaign.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 text-xs">
                  <td className="px-3 py-2 text-gray-500">{idx + 1}</td>
                  <td className="px-3 py-2 font-medium text-gray-800">{campaign.name}</td>
                  <td className="px-3 py-2 text-gray-600">{channelLabelById[campaign.channel] || campaign.channel}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`px-2 py-1 rounded text-[10px] font-medium ${campaign.status === "draft"
                          ? "bg-gray-100 text-gray-700"
                          : campaign.status === "scheduled"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-green-100 text-green-700"
                        }`}
                    >
                      {campaign.status === "draft"
                        ? "Nháp"
                        : campaign.status === "scheduled"
                          ? "Đã lịch"
                          : "Hoàn thành"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-gray-600">{conversationsByOa[campaign.channel] || 0}</td>
                  <td className="px-3 py-2 text-gray-600">
                    {campaign.sent} / {campaign.failed}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      {campaign.status !== "completed" && (
                        <button
                          onClick={() => handleRunCampaign(campaign.id)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Chạy ngay"
                        >
                          <FiPlay className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteCampaign(campaign.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Xóa"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {campaigns.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-gray-400">
                    Chưa có chiến dịch nào
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
