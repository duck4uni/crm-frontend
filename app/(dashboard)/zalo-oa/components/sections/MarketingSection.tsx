"use client";

import { useEffect, useMemo, useState } from "react";
import { FiTrash2, FiPlay } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { fetchOaTemplates } from "@/lib/zalo-oa";
import { initialCampaigns } from "@/mock-data/marketing";
import { initialConnections, mockConversations } from "@/mock-data/zalo-oa";
import {
  Campaign,
  CampaignFormState,
  segmentOptions,
} from "@/types/marketing";
import type { ZbsTemplate } from "@/types/zalo-oa";

const initialFormState: CampaignFormState = {
  name: "",
  channel: initialConnections[0]?.id || "",
  segment: segmentOptions[0].value,
  scheduledAt: "",
  message: "",
  templateCode: "",
};

const STATUS_BADGE: Record<ZbsTemplate["status"], { label: string; className: string }> = {
  approved: { label: "Đã duyệt", className: "bg-green-100 text-green-700" },
  pending_review: { label: "Chờ duyệt", className: "bg-amber-100 text-amber-700" },
  rejected: { label: "Bị từ chối", className: "bg-red-100 text-red-700" },
  draft: { label: "Nháp", className: "bg-gray-100 text-gray-600" },
  inactive: { label: "Ngừng dùng", className: "bg-gray-100 text-gray-500" },
};

export function MarketingSection() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [form, setForm] = useState<CampaignFormState>(initialFormState);
  const [templatesByOa, setTemplatesByOa] = useState<Record<string, ZbsTemplate[]>>({});
  const [templatesLoading, setTemplatesLoading] = useState(false);

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

  const selectedConnection = useMemo(
    () => initialConnections.find((c) => c.id === form.channel) || null,
    [form.channel],
  );

  useEffect(() => {
    if (!selectedConnection) return;
    const oaOfficialId = selectedConnection.oaOfficialId;
    if (templatesByOa[oaOfficialId]) return;

    let cancelled = false;
    setTemplatesLoading(true);
    fetchOaTemplates(oaOfficialId)
      .then((list) => {
        if (cancelled) return;
        setTemplatesByOa((prev) => ({ ...prev, [oaOfficialId]: list }));
      })
      .finally(() => {
        if (!cancelled) setTemplatesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedConnection, templatesByOa]);

  const currentTemplates = useMemo(() => {
    if (!selectedConnection) return [];
    return templatesByOa[selectedConnection.oaOfficialId] ?? [];
  }, [selectedConnection, templatesByOa]);

  const approvedTemplates = useMemo(
    () => currentTemplates.filter((t) => t.status === "approved"),
    [currentTemplates],
  );

  const selectedTemplate = useMemo(
    () => currentTemplates.find((t) => t.templateCode === form.templateCode) || null,
    [currentTemplates, form.templateCode],
  );

  const handleChannelChange = (value: string) => {
    setForm((prev) => ({ ...prev, channel: value, templateCode: "", message: "" }));
  };

  const handleTemplateChange = (templateCode: string) => {
    const template = currentTemplates.find((t) => t.templateCode === templateCode);
    setForm((prev) => ({
      ...prev,
      templateCode,
      message: template ? template.previewContent : "",
    }));
  };

  const handleCreateCampaign = () => {
    const name = form.name.trim();
    if (!name || !selectedTemplate) {
      return;
    }

    const nextCampaign: Campaign = {
      id: `camp-${Date.now()}`,
      name,
      channel: form.channel,
      segment: form.segment,
      scheduledAt: form.scheduledAt || "Chưa đặt lịch",
      message: selectedTemplate.previewContent,
      status: form.scheduledAt ? "scheduled" : "draft",
      sent: 0,
      failed: 0,
      templateCode: selectedTemplate.templateCode,
      templateName: selectedTemplate.templateName,
    };

    setCampaigns((prev) => [nextCampaign, ...prev]);
    setForm((prev) => ({
      ...prev,
      name: "",
      scheduledAt: "",
      message: "",
      templateCode: "",
    }));
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

  const canCreate = !!form.name.trim() && !!selectedTemplate;

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
                onChange={(e) => handleChannelChange(e.target.value)}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Template ZBS
              </label>
              {templatesLoading && currentTemplates.length === 0 ? (
                <div className="flex items-center gap-2 text-xs text-gray-500 py-2">
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-primary-600" />
                  Đang tải template từ Zalo...
                </div>
              ) : currentTemplates.length === 0 ? (
                <p className="text-xs text-gray-500 py-2">
                  OA này chưa có template. Hãy tạo template trên Zalo Business Solution trước.
                </p>
              ) : (
                <>
                  <Select
                    value={form.templateCode}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                    options={[
                      { value: "", label: "-- Chọn template --" },
                      ...approvedTemplates.map((t) => ({
                        value: t.templateCode,
                        label: `${t.templateName} (${t.templateCode})`,
                      })),
                    ]}
                    size="md"
                  />
                  <p className="mt-1 text-[11px] text-gray-400">
                    Có {approvedTemplates.length}/{currentTemplates.length} template đã duyệt sẵn sàng để gửi.
                  </p>
                </>
              )}
            </div>

            {selectedTemplate && (
              <div className="rounded-lg bg-gray-50 border border-gray-100 p-3 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-xs font-semibold text-gray-800">
                    {selectedTemplate.templateName}
                  </p>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_BADGE[selectedTemplate.status].className}`}
                  >
                    {STATUS_BADGE[selectedTemplate.status].label}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {selectedTemplate.templateType} • Template ID: {selectedTemplate.templateId}
                  </span>
                </div>
                <p className="text-xs text-gray-600 whitespace-pre-line">
                  {selectedTemplate.previewContent}
                </p>
                {selectedTemplate.params.length > 0 && (
                  <p className="text-[11px] text-gray-500">
                    Biến cần truyền:{" "}
                    {selectedTemplate.params.map((p) => (
                      <span
                        key={p.name}
                        className="inline-block mr-1 px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-mono text-gray-700"
                      >
                        {p.name}
                      </span>
                    ))}
                  </p>
                )}
              </div>
            )}

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
              disabled={!canCreate}
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
                <th className="px-3 py-2 font-medium text-gray-600">Template</th>
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
                  <td className="px-3 py-2 text-gray-600">
                    {campaign.templateName ? (
                      <span title={campaign.templateCode}>{campaign.templateName}</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
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
                  <td colSpan={8} className="px-3 py-6 text-center text-gray-400">
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
