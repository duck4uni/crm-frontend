"use client";

import { useEffect, useMemo, useState } from "react";
import { FiTrash2, FiPlay } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { fetchOaTemplates } from "@/lib/zalo-oa";
import {
  Campaign,
  CampaignFormState,
  segmentOptions,
} from "@/types/marketing";
import type { OaConnection, ZbsTemplate } from "@/types/zalo-oa";
import { CampaignRecipientsImport, type CampaignRecipient } from "./CampaignRecipientsImport";

const CONNECTIONS_STORAGE_KEY = "crm.zaloOa.connections.v1";

const loadStoredConnections = (): OaConnection[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CONNECTIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as OaConnection[]) : [];
  } catch {
    return [];
  }
};

const initialFormState: CampaignFormState = {
  name: "",
  channel: "",
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

interface TemplateWithOa extends ZbsTemplate {
  connectionId: string;
  oaName: string;
}

export function MarketingSection() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [form, setForm] = useState<CampaignFormState>(initialFormState);
  const [templatesByOa, setTemplatesByOa] = useState<Record<string, ZbsTemplate[]>>({});
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [connections, setConnections] = useState<OaConnection[]>([]);
  const [recipients, setRecipients] = useState<CampaignRecipient[]>([]);

  useEffect(() => {
    setConnections(loadStoredConnections());
  }, []);

  // Fetch templates cho TẤT CẢ OA đã kết nối
  useEffect(() => {
    if (connections.length === 0) return;

    let cancelled = false;
    const missing = connections.filter(
      (c) => !templatesByOa[c.oaOfficialId],
    );
    if (missing.length === 0) return;

    setTemplatesLoading(true);
    Promise.all(
      missing.map((c) =>
        fetchOaTemplates(c.oaOfficialId).then((list) => ({
          oaOfficialId: c.oaOfficialId,
          list,
        })),
      ),
    )
      .then((results) => {
        if (cancelled) return;
        setTemplatesByOa((prev) => {
          const next = { ...prev };
          for (const { oaOfficialId, list } of results) {
            next[oaOfficialId] = list;
          }
          return next;
        });
      })
      .finally(() => {
        if (!cancelled) setTemplatesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [connections, templatesByOa]);

  const totalSent = useMemo(
    () => campaigns.reduce((sum, campaign) => sum + campaign.sent, 0),
    [campaigns],
  );

  const channelLabelById = useMemo(
    () =>
      connections.reduce<Record<string, string>>((acc, connection) => {
        acc[connection.id] = connection.oaName;
        return acc;
      }, {}),
    [connections],
  );

  // Gộp template từ tất cả OA, gắn thêm connectionId/oaName
  const allTemplates = useMemo<TemplateWithOa[]>(() => {
    const flat: TemplateWithOa[] = [];
    for (const conn of connections) {
      const list = templatesByOa[conn.oaOfficialId] ?? [];
      for (const t of list) {
        flat.push({ ...t, connectionId: conn.id, oaName: conn.oaName });
      }
    }
    return flat;
  }, [connections, templatesByOa]);

  const approvedTemplates = useMemo(
    () => allTemplates.filter((t) => t.status === "approved"),
    [allTemplates],
  );

  // Group cho dropdown / list theo OA
  const templatesGroupedByOa = useMemo(() => {
    const groups: { connectionId: string; oaName: string; items: TemplateWithOa[] }[] = [];
    for (const conn of connections) {
      const items = allTemplates.filter((t) => t.connectionId === conn.id);
      if (items.length > 0) {
        groups.push({ connectionId: conn.id, oaName: conn.oaName, items });
      }
    }
    return groups;
  }, [connections, allTemplates]);

  const selectedTemplate = useMemo(
    () => allTemplates.find((t) => t.templateCode === form.templateCode) || null,
    [allTemplates, form.templateCode],
  );

  const handleTemplateChange = (templateCode: string) => {
    const template = allTemplates.find((t) => t.templateCode === templateCode);
    setForm((prev) => ({
      ...prev,
      templateCode,
      // Tự set kênh theo OA của template được chọn
      channel: template ? template.connectionId : "",
      message: template ? template.previewContent : "",
    }));
    setRecipients([]); // reset danh sách khi đổi template (vì cột biến có thể khác)
  };

  const handleCreateCampaign = () => {
    const name = form.name.trim();
    if (!name || !selectedTemplate) {
      return;
    }

    const validRecipients = recipients.filter((r) => r.errors.length === 0);

    const nextCampaign: Campaign = {
      id: `camp-${Date.now()}`,
      name,
      channel: selectedTemplate.connectionId,
      segment: form.segment,
      scheduledAt: form.scheduledAt || "Chưa đặt lịch",
      message: selectedTemplate.previewContent,
      status: form.scheduledAt ? "scheduled" : "draft",
      sent: 0,
      failed: 0,
      templateCode: selectedTemplate.templateCode,
      templateName: selectedTemplate.templateName,
      recipientsCount: validRecipients.length,
    };

    setCampaigns((prev) => [nextCampaign, ...prev]);
    setForm((prev) => ({
      ...prev,
      name: "",
      scheduledAt: "",
      message: "",
      templateCode: "",
      channel: "",
    }));
    setRecipients([]);
  };

  const handleRunCampaign = (campaignId: string) => {
    setCampaigns((prev) =>
      prev.map((campaign) => {
        if (campaign.id !== campaignId) {
          return campaign;
        }
        const sent = Math.floor(Math.random() * 300 + 120);
        const failed = Math.floor(sent * 0.07);
        return { ...campaign, status: "completed", sent, failed };
      }),
    );
  };

  const handleDeleteCampaign = (campaignId: string) => {
    setCampaigns((prev) => prev.filter((campaign) => campaign.id !== campaignId));
  };

  const validRecipientsCount = recipients.filter((r) => r.errors.length === 0).length;
  const canCreate =
    !!form.name.trim() && !!selectedTemplate && validRecipientsCount > 0;
  const hasConnections = connections.length > 0;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-sm font-semibold text-gray-800">Marketing</h2>
        <p className="text-xs text-gray-500 mt-1">
          Tạo chiến dịch broadcast cho Zalo OA — gộp template từ tất cả OA đã kết nối
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
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
        <Card>
          <CardContent className="py-3">
            <p className="text-xs text-gray-500">Template / OA</p>
            <p className="mt-1 text-lg font-bold text-primary-700">
              {approvedTemplates.length}
              <span className="text-xs font-medium text-gray-400">
                {" "}
                / {allTemplates.length} • {connections.length} OA
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Danh sách template tổng hợp từ mọi OA */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">
              Template từ tất cả Zalo OA
            </h3>
            {templatesLoading && (
              <span className="flex items-center gap-1.5 text-[11px] text-gray-500">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-primary-600" />
                Đang đồng bộ...
              </span>
            )}
          </div>

          {!hasConnections ? (
            <p className="text-xs text-gray-500 py-4 text-center">
              Chưa có Zalo OA nào được kết nối. Vui lòng kết nối OA trước ở trang Zalo OA.
            </p>
          ) : templatesGroupedByOa.length === 0 && !templatesLoading ? (
            <p className="text-xs text-gray-500 py-4 text-center">
              Các OA hiện chưa có template nào.
            </p>
          ) : (
            <div className="space-y-4">
              {templatesGroupedByOa.map((group) => (
                <div key={group.connectionId}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded bg-primary-50 text-primary-700 text-[11px] font-semibold">
                      {group.oaName}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {group.items.filter((t) => t.status === "approved").length}/
                      {group.items.length} đã duyệt
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {group.items.map((t) => {
                      const isSelected = form.templateCode === t.templateCode;
                      const canPick = t.status === "approved";
                      return (
                        <button
                          key={`${t.connectionId}-${t.id}`}
                          type="button"
                          onClick={() => canPick && handleTemplateChange(t.templateCode)}
                          disabled={!canPick}
                          className={`text-left rounded-lg border p-3 transition-colors ${
                            isSelected
                              ? "border-primary-500 bg-primary-50/40"
                              : canPick
                                ? "border-gray-200 hover:border-primary-300 bg-white"
                                : "border-gray-100 bg-gray-50 cursor-not-allowed opacity-60"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <p className="text-xs font-semibold text-gray-800 truncate">
                              {t.templateName}
                            </p>
                            <span
                              className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${STATUS_BADGE[t.status].className}`}
                            >
                              {STATUS_BADGE[t.status].label}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 line-clamp-2">
                            {t.previewContent}
                          </p>
                          <p className="mt-1 text-[10px] text-gray-400">
                            {t.templateType} • {t.templateCode} • {t.params.length} biến
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Template ZBS <span className="text-gray-400 font-normal">(từ tất cả OA)</span>
              </label>
              <Select
                value={form.templateCode}
                onChange={(e) => handleTemplateChange(e.target.value)}
                options={[
                  { value: "", label: "-- Chọn template --" },
                  ...approvedTemplates.map((t) => ({
                    value: t.templateCode,
                    label: `[${t.oaName}] ${t.templateName}`,
                  })),
                ]}
                size="md"
                disabled={approvedTemplates.length === 0}
              />
              <p className="mt-1 text-[11px] text-gray-400">
                {approvedTemplates.length > 0
                  ? `Có ${approvedTemplates.length} template đã duyệt sẵn sàng để gửi từ ${templatesGroupedByOa.length} OA.`
                  : "Chưa có template nào sẵn sàng để gửi."}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đối tượng
              </label>
              <Select
                value={form.segment}
                onChange={(e) => setForm({ ...form, segment: e.target.value })}
                options={segmentOptions}
                size="md"
              />
            </div>

            {selectedTemplate && (
              <div className="rounded-lg bg-gray-50 border border-gray-100 p-3 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-primary-50 text-primary-700 text-[10px] font-semibold">
                    {selectedTemplate.oaName}
                  </span>
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

            {selectedTemplate && (
              <CampaignRecipientsImport
                params={selectedTemplate.params}
                recipients={recipients}
                onChange={setRecipients}
                templateName={selectedTemplate.templateName}
                templateCode={selectedTemplate.templateCode}
              />
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
              {validRecipientsCount > 0
                ? `Tạo chiến dịch (${validRecipientsCount} người nhận)`
                : "Tạo chiến dịch"}
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
                <th className="px-3 py-2 font-medium text-gray-600">Người nhận</th>
                <th className="px-3 py-2 font-medium text-gray-600">Trạng thái</th>
                <th className="px-3 py-2 font-medium text-gray-600">Gửi / Lỗi</th>
                <th className="px-3 py-2 font-medium text-gray-600 w-20">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign, idx) => (
                <tr key={campaign.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 text-xs">
                  <td className="px-3 py-2 text-gray-500">{idx + 1}</td>
                  <td className="px-3 py-2 font-medium text-gray-800">{campaign.name}</td>
                  <td className="px-3 py-2 text-gray-600">
                    {channelLabelById[campaign.channel] || campaign.channel}
                  </td>
                  <td className="px-3 py-2 text-gray-600">
                    {campaign.templateName ? (
                      <span title={campaign.templateCode}>{campaign.templateName}</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-gray-600">
                    {typeof campaign.recipientsCount === "number"
                      ? campaign.recipientsCount.toLocaleString("vi-VN")
                      : "—"}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`px-2 py-1 rounded text-[10px] font-medium ${
                        campaign.status === "draft"
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
