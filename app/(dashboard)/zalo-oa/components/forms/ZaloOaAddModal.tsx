"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiCheck,
  FiExternalLink,
  FiSend,
  FiX,
} from "react-icons/fi";
import type {
  OaConnectStep,
  OaConnection,
  ZbsSendByPhoneResult,
  ZbsTemplate,
} from "@/types/zalo-oa";
import {
  buildOaConnectionFromToken,
  buildZaloOAuthUrl,
  DEV_CAPTURED_OAUTH,
  exchangeAuthorizationCode,
  fetchOaTemplates,
  getZaloAppId,
  sendTemplateByPhone,
} from "@/lib/zalo-oa";

interface ZaloOaAddModalProps {
  open: boolean;
  onClose: () => void;
  onConnected: (connection: OaConnection) => void;
}

const STATUS_BADGE: Record<ZbsTemplate["status"], { label: string; className: string }> = {
  approved: { label: "Đã duyệt", className: "bg-green-100 text-green-700" },
  pending_review: { label: "Chờ duyệt", className: "bg-amber-100 text-amber-700" },
  rejected: { label: "Bị từ chối", className: "bg-red-100 text-red-700" },
  draft: { label: "Nháp", className: "bg-gray-100 text-gray-600" },
  inactive: { label: "Ngừng dùng", className: "bg-gray-100 text-gray-500" },
};

export function ZaloOaAddModal({ open, onClose, onConnected }: ZaloOaAddModalProps) {
  const [step, setStep] = useState<OaConnectStep>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [connectedOa, setConnectedOa] = useState<OaConnection | null>(null);

  const [templates, setTemplates] = useState<ZbsTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ZbsTemplate | null>(null);

  const [phone, setPhone] = useState("");
  const [templateData, setTemplateData] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<ZbsSendByPhoneResult | null>(null);

  useEffect(() => {
    if (!open) {
      setStep("idle");
      setErrorMsg("");
      setConnectedOa(null);
      setTemplates([]);
      setSelectedTemplate(null);
      setPhone("");
      setTemplateData({});
      setSendResult(null);
    }
  }, [open]);

  useEffect(() => {
    async function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== "ZALO_OA_OAUTH_CALLBACK") return;

      console.group("[Zalo OA Modal] nhận postMessage từ popup");
      console.log("payload:", event.data);
      console.groupEnd();

      if (event.data.error) {
        setStep("error");
        setErrorMsg("Người dùng từ chối cấp quyền hoặc có lỗi xảy ra.");
        return;
      }

      if (!event.data.code) {
        setStep("error");
        setErrorMsg("Không nhận được authorization code từ Zalo.");
        return;
      }

      setStep("exchanging");
      try {
        const tokenResult = await exchangeAuthorizationCode(event.data.code);
        const connection = buildOaConnectionFromToken(tokenResult);
        console.log("[Zalo OA Modal] connection sau khi đổi token:", connection);
        setConnectedOa(connection);
        setStep("success");
        onConnected(connection);
      } catch (err) {
        console.error("[Zalo OA Modal] exchange thất bại:", err);
        setStep("error");
        setErrorMsg(err instanceof Error ? err.message : "Không đổi được token. Vui lòng thử lại.");
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onConnected]);

  const handleStartOAuth = () => {
    const appId = getZaloAppId();
    if (!appId) {
      setStep("error");
      setErrorMsg("Hệ thống chưa cấu hình Zalo App ID. Vui lòng liên hệ quản trị viên.");
      return;
    }

    setErrorMsg("");
    setStep("connecting");

    const redirectUri = `${window.location.origin}/zalo-oa/callback`;
    const state = `oa_${Date.now()}`;
    const url = buildZaloOAuthUrl({ appId, redirectUri, state });

    console.group("[Zalo OA Modal] startOAuth");
    console.log("redirect_uri:", redirectUri);
    console.log("state:", state);
    console.log("oauth_url:", url);
    console.groupEnd();

    const popup = window.open(url, "zalo_oa_oauth", "width=600,height=700,scrollbars=yes");
    if (!popup) {
      setStep("error");
      setErrorMsg("Trình duyệt đã chặn popup. Vui lòng cho phép popup và thử lại.");
    }
  };

  const handleMockOAuth = async () => {
    setErrorMsg("");
    setStep("exchanging");
    const capturedCode = DEV_CAPTURED_OAUTH.authorizationCode;
    console.log(
      "[Zalo OA Modal] DEV MOCK: bypass popup, dùng captured code (OA thật:",
      DEV_CAPTURED_OAUTH.oaName,
      "/",
      DEV_CAPTURED_OAUTH.oaId,
      ")",
    );
    try {
      const tokenResult = await exchangeAuthorizationCode(capturedCode);
      const connection = buildOaConnectionFromToken(tokenResult);
      setConnectedOa(connection);
      setStep("success");
      onConnected(connection);
    } catch (err) {
      setStep("error");
      setErrorMsg(err instanceof Error ? err.message : "Mock thất bại.");
    }
  };

  const handleViewTemplates = async () => {
    if (!connectedOa) return;
    setStep("templates");
    setTemplatesLoading(true);
    try {
      const list = await fetchOaTemplates(connectedOa.oaOfficialId);
      setTemplates(list);
    } finally {
      setTemplatesLoading(false);
    }
  };

  const handlePickTemplate = (template: ZbsTemplate) => {
    setSelectedTemplate(template);
    const initialData: Record<string, string> = {};
    template.params.forEach((param) => {
      initialData[param.name] = "";
    });
    setTemplateData(initialData);
    setPhone("");
    setSendResult(null);
    setStep("send");
  };

  const handleFillSample = () => {
    if (!selectedTemplate) return;
    const sample: Record<string, string> = {};
    selectedTemplate.params.forEach((param) => {
      sample[param.name] = param.sample;
    });
    setTemplateData(sample);
  };

  const canSubmitSend = useMemo(() => {
    if (!selectedTemplate || !phone.trim()) return false;
    return selectedTemplate.params.every(
      (param) => !param.required || (templateData[param.name] || "").trim().length > 0,
    );
  }, [phone, selectedTemplate, templateData]);

  const handleSend = async () => {
    if (!connectedOa || !selectedTemplate) return;
    setSending(true);
    setSendResult(null);
    try {
      const result = await sendTemplateByPhone({
        oaId: connectedOa.oaOfficialId,
        templateCode: selectedTemplate.templateCode,
        phone: phone.trim(),
        templateData,
        trackingId: `${selectedTemplate.templateCode}_${Date.now()}`,
      });
      setSendResult(result);
      setStep("sent");
    } finally {
      setSending(false);
    }
  };

  if (!open) return null;

  const isBusy = step === "connecting" || step === "exchanging";
  const isWideStep =
    step === "success" || step === "templates" || step === "send" || step === "sent";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div
        className={`relative w-full rounded-2xl bg-white shadow-2xl flex flex-col max-h-[90vh] ${
          isWideStep ? "max-w-3xl" : "max-w-md"
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            {(step === "send" || step === "sent") && (
              <button
                onClick={() => {
                  setStep("templates");
                  setSendResult(null);
                }}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                title="Quay lại danh sách template"
              >
                <FiArrowLeft className="h-4 w-4" />
              </button>
            )}
            <h2 className="text-base font-semibold text-gray-900">
              {step === "templates"
                ? "Danh sách template"
                : step === "send"
                  ? "Gửi tin theo template"
                  : step === "sent"
                    ? "Kết quả gửi tin"
                    : "Kết nối Zalo OA"}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isBusy}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-6 overflow-y-auto">
          {step === "success" && connectedOa ? (
            <div className="flex flex-col items-center gap-3 py-2 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                <FiCheck className="h-7 w-7 text-green-600" />
              </div>
              <p className="font-semibold text-gray-800">Kết nối thành công!</p>
              <p className="text-sm text-gray-500">
                OA <span className="font-medium text-gray-700">{connectedOa.oaName}</span> đã được
                kết nối với hệ thống.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={onClose}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Đóng
                </button>
                <button
                  onClick={handleViewTemplates}
                  className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
                >
                  Xem danh sách template
                </button>
              </div>
            </div>
          ) : step === "templates" ? (
            <TemplateListStep
              loading={templatesLoading}
              templates={templates}
              onPick={handlePickTemplate}
              oaName={connectedOa?.oaName || ""}
            />
          ) : step === "send" && selectedTemplate ? (
            <SendByPhoneStep
              template={selectedTemplate}
              phone={phone}
              onPhoneChange={setPhone}
              templateData={templateData}
              onTemplateDataChange={(name, value) =>
                setTemplateData((prev) => ({ ...prev, [name]: value }))
              }
              onFillSample={handleFillSample}
              onSubmit={handleSend}
              sending={sending}
              canSubmit={canSubmitSend}
            />
          ) : step === "sent" && sendResult ? (
            <SendResultStep
              result={sendResult}
              onSendAnother={() => {
                setSendResult(null);
                setStep("send");
              }}
              onBackToTemplates={() => {
                setSendResult(null);
                setStep("templates");
              }}
              onClose={onClose}
            />
          ) : (
            <div className="space-y-4">
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  Bấm nút bên dưới để mở cửa sổ ủy quyền của Zalo. Bạn sẽ chọn OA cần kết nối và đồng
                  ý cấp quyền cho hệ thống.
                </p>
                <ul className="ml-4 list-disc space-y-1 text-gray-500">
                  <li>OA cần đã được xác thực và đang hoạt động.</li>
                  <li>Bạn cần là quản trị viên của OA.</li>
                  <li>Hệ thống sẽ chỉ truy cập theo phạm vi quyền đã được Zalo cấp.</li>
                </ul>
                <a
                  href="https://developers.zalo.me/docs/social-api/tham-khao/user-access-token-v4"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-primary-600 hover:underline"
                >
                  Xem tài liệu Zalo OAuth <FiExternalLink className="h-3 w-3" />
                </a>
              </div>

              {step === "exchanging" && (
                <div className="rounded-lg bg-blue-50 px-3 py-2.5 text-sm text-blue-700">
                  Đang đổi authorization code lấy access token...
                </div>
              )}

              {step === "error" && (
                <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-600">
                  <FiAlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>{errorMsg || "Kết nối thất bại. Vui lòng thử lại."}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-1 flex-wrap">
                <button
                  onClick={onClose}
                  disabled={isBusy}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Hủy
                </button>
                {process.env.NODE_ENV !== "production" && (
                  <button
                    onClick={handleMockOAuth}
                    disabled={isBusy}
                    title="Dev only: bỏ qua popup Zalo, mock 1 OA đã kết nối để test luồng template/gửi tin"
                    className="flex items-center gap-2 rounded-lg border border-dashed border-amber-400 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100 transition-colors disabled:opacity-60"
                  >
                    🧪 Mock kết nối (dev)
                  </button>
                )}
                <button
                  onClick={handleStartOAuth}
                  disabled={isBusy}
                  className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors disabled:opacity-60"
                >
                  {isBusy && (
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  )}
                  {step === "connecting"
                    ? "Đang chờ xác thực..."
                    : step === "exchanging"
                      ? "Đang đổi token..."
                      : step === "error"
                        ? "Thử lại"
                        : "Kết nối với Zalo"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface TemplateListStepProps {
  loading: boolean;
  templates: ZbsTemplate[];
  oaName: string;
  onPick: (template: ZbsTemplate) => void;
}

function TemplateListStep({ loading, templates, oaName, onPick }: TemplateListStepProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-gray-500">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-primary-600 mr-2" />
        Đang đồng bộ template từ Zalo...
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <p className="text-center text-sm text-gray-500 py-12">
        OA này chưa có template nào. Vui lòng tạo template trên Zalo Business Solution.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">
        OA <span className="font-medium text-gray-700">{oaName}</span> có {templates.length} template.
        Chỉ template ở trạng thái <span className="font-medium text-green-700">Đã duyệt</span> mới có
        thể gửi tin.
      </p>
      <div className="divide-y divide-gray-100 rounded-lg border border-gray-200">
        {templates.map((template) => {
          const badge = STATUS_BADGE[template.status];
          const canSend = template.status === "approved";
          return (
            <div key={template.id} className="flex items-start gap-3 p-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {template.templateName}
                  </p>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {template.templateType} • {template.templateCode}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500 line-clamp-2">{template.previewContent}</p>
                <p className="mt-1 text-[11px] text-gray-400">
                  {template.params.length} biến: {template.params.map((p) => p.name).join(", ")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onPick(template)}
                disabled={!canSend}
                className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
              >
                <FiSend className="h-3 w-3" />
                Gửi tin
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface SendByPhoneStepProps {
  template: ZbsTemplate;
  phone: string;
  onPhoneChange: (value: string) => void;
  templateData: Record<string, string>;
  onTemplateDataChange: (name: string, value: string) => void;
  onFillSample: () => void;
  onSubmit: () => void;
  sending: boolean;
  canSubmit: boolean;
}

function SendByPhoneStep({
  template,
  phone,
  onPhoneChange,
  templateData,
  onTemplateDataChange,
  onFillSample,
  onSubmit,
  sending,
  canSubmit,
}: SendByPhoneStepProps) {
  const preview = useMemo(() => {
    return template.previewContent.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      return templateData[key]?.trim() || `{{${key}}}`;
    });
  }, [template.previewContent, templateData]);

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-gray-50 border border-gray-100 p-3">
        <p className="text-xs font-semibold text-gray-700">{template.templateName}</p>
        <p className="text-[11px] text-gray-500">
          {template.templateCode} • Template ID: {template.templateId}
        </p>
        <p className="mt-2 text-xs text-gray-600 whitespace-pre-line">{preview}</p>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Số điện thoại người nhận <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          placeholder="0901234567 hoặc 84901234567"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
        />
        <p className="mt-1 text-[11px] text-gray-400">
          Hệ thống sẽ tự chuẩn hóa về dạng 84xxxxxxxxx khi gửi.
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-medium text-gray-700">Dữ liệu biến template</label>
          <button
            type="button"
            onClick={onFillSample}
            className="text-[11px] font-medium text-primary-600 hover:underline"
          >
            Điền dữ liệu mẫu
          </button>
        </div>
        <div className="space-y-2">
          {template.params.map((param) => (
            <div key={param.name}>
              <label className="block text-[11px] text-gray-600 mb-0.5">
                {param.name}
                {param.required && <span className="text-red-500"> *</span>}
                <span className="ml-1 text-gray-400">({param.type})</span>
              </label>
              <input
                type="text"
                value={templateData[param.name] || ""}
                onChange={(e) => onTemplateDataChange(param.name, e.target.value)}
                placeholder={`VD: ${param.sample}`}
                className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <button
          onClick={onSubmit}
          disabled={!canSubmit || sending}
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {sending && (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          )}
          <FiSend className="h-3.5 w-3.5" />
          {sending ? "Đang gửi..." : "Gửi tin"}
        </button>
      </div>
    </div>
  );
}

interface SendResultStepProps {
  result: ZbsSendByPhoneResult;
  onSendAnother: () => void;
  onBackToTemplates: () => void;
  onClose: () => void;
}

function SendResultStep({
  result,
  onSendAnother,
  onBackToTemplates,
  onClose,
}: SendResultStepProps) {
  const isSuccess = result.status === "success";
  return (
    <div className="space-y-4">
      <div
        className={`flex items-start gap-3 rounded-lg p-3 ${
          isSuccess ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"
        }`}
      >
        {isSuccess ? (
          <FiCheck className="mt-0.5 h-5 w-5 flex-shrink-0" />
        ) : (
          <FiAlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
        )}
        <div className="text-sm">
          <p className="font-semibold">
            {isSuccess ? "Gửi tin thành công" : "Gửi tin thất bại"}
          </p>
          {result.errorMessage && <p className="text-xs mt-1">{result.errorMessage}</p>}
        </div>
      </div>

      <dl className="text-xs grid grid-cols-3 gap-y-2 text-gray-600">
        {result.msgId && (
          <>
            <dt className="text-gray-400">msg_id</dt>
            <dd className="col-span-2 font-mono text-gray-800">{result.msgId}</dd>
          </>
        )}
        <dt className="text-gray-400">tracking_id</dt>
        <dd className="col-span-2 font-mono text-gray-800">{result.trackingId}</dd>
        <dt className="text-gray-400">status</dt>
        <dd className="col-span-2 text-gray-800">{result.status}</dd>
        <dt className="text-gray-400">sent_at</dt>
        <dd className="col-span-2 text-gray-800">
          {new Date(result.sentAt).toLocaleString("vi-VN", { hour12: false })}
        </dd>
        {typeof result.quotaRemaining === "number" && (
          <>
            <dt className="text-gray-400">quota</dt>
            <dd className="col-span-2 text-gray-800">{result.quotaRemaining}</dd>
          </>
        )}
      </dl>

      <div className="flex justify-end gap-2 pt-1">
        <button
          onClick={onClose}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          Đóng
        </button>
        <button
          onClick={onBackToTemplates}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Chọn template khác
        </button>
        <button
          onClick={onSendAnother}
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          Gửi tin tiếp
        </button>
      </div>
    </div>
  );
}
