"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiPlus, FiCheck, FiX } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import type { OaConnection } from "@/types/zalo-oa";
import type { BodyComponent, FooterButton, FormState, HeaderState, TemplateType, TemplateTag } from "./_components/types";
import {
  CONNECTIONS_KEY,
  TEMPLATE_TYPES,
  TEMPLATE_TAGS,
  PARAM_TYPES,
} from "./_components/constants";
import { StepBar } from "./_components/StepBar";
import { BodyEditor } from "./_components/BodyEditor";
import { TemplatePreview } from "./_components/TemplatePreview";
import { HeaderMediaSection } from "./_components/HeaderMediaSection";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid() { return Math.random().toString(36).slice(2); }

function extractVars(text: string): string[] {
  const regex = /{{\s*([a-zA-Z0-9_]+)\s*}}/g;
  const found = new Set<string>();
  let m;
  while ((m = regex.exec(text)) !== null) found.add(m[1]);
  return Array.from(found);
}

function extractAllVars(body: BodyComponent[], footer: FooterButton[]): string[] {
  const found = new Set<string>();
  for (const c of body) {
    extractVars(c.text).forEach((v) => found.add(v));
    for (const item of c.items) {
      extractVars(item.key).forEach((v) => found.add(v));
      extractVars(item.value).forEach((v) => found.add(v));
    }
  }
  for (const btn of footer) extractVars(btn.content).forEach((v) => found.add(v));
  return Array.from(found);
}

function buildLayout(header: HeaderState, body: BodyComponent[], footer: FooterButton[]) {
  const layout = [];

  // HEADER
  if (header.variant === "LOGO" && (header.lightMediaId || header.darkMediaId)) {
    const components: object[] = [];
    if (header.lightMediaId)
      components.push({ type: "LOGO", mediaSystemId: header.lightMediaId });
    if (header.darkMediaId)
      components.push({ type: "LOGO_DARK", mediaSystemId: header.darkMediaId });
    layout.push({ type: "HEADER", components });
  } else if (header.variant === "IMAGE" && header.imageMediaId) {
    layout.push({
      type: "HEADER",
      components: [{ type: "IMAGE", mediaSystemId: header.imageMediaId }],
    });
  }

  // BODY
  const bodyParts = body
    .filter((c) => c.type === "TABLE" ? c.items.length > 0 : c.text.trim())
    .map((c) =>
      c.type === "TABLE"
        ? { type: "TABLE", items: c.items.filter((i) => i.key.trim() || i.value.trim()) }
        : { type: c.type, text: c.text },
    );
  if (bodyParts.length > 0) layout.push({ type: "BODY", components: bodyParts });

  // FOOTER
  const btnItems = footer
    .filter((b) => b.title.trim() && b.content.trim())
    .map((b) => ({ title: b.title, type: "OPEN_URL", content: b.content }));
  if (btnItems.length > 0) layout.push({ type: "FOOTER", components: [{ type: "BUTTONS", items: btnItems }] });

  return layout;
}

function loadConnections(): OaConnection[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CONNECTIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

// ─── Local UI ─────────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">{children}</p>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
      <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      {children}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const emptyHeader = (): HeaderState => ({
  variant: null,
  lightFile: null, lightPreview: "", lightMediaId: "",
  darkFile: null, darkPreview: "", darkMediaId: "",
  imageFile: null, imagePreview: "", imageMediaId: "",
});

const initialForm = (): FormState => ({
  oaId: "",
  template_name: "",
  template_type: "1",
  tag: "1",
  note: "",
  header: emptyHeader(),
  bodyComponents: [{ id: uid(), type: "TITLE", text: "", items: [] }],
  footerButtons: [],
  params: [],
});

export default function TaoTemplatePage() {
  const router = useRouter();
  const [connections, setConnections] = useState<OaConnection[]>([]);
  const [form, setForm] = useState<FormState>(initialForm);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => { setConnections(loadConnections()); }, []);

  const detectedVars = extractAllVars(form.bodyComponents, form.footerButtons);

  // Sync params whenever layout changes
  const syncParams = (body: BodyComponent[], footer: FooterButton[]) => {
    const vars = extractAllVars(body, footer);
    setForm((prev) => {
      const existing = new Map(prev.params.map((p) => [p.name, p]));
      const merged = vars.map((v) => existing.get(v) ?? { id: uid(), name: v, type: "OTHER", sample_value: "" });
      const extras = prev.params.filter((p) => !vars.includes(p.name));
      return { ...prev, params: [...merged, ...extras] };
    });
  };

  const setBody = (updated: BodyComponent[]) => {
    setForm((f) => ({ ...f, bodyComponents: updated }));
    syncParams(updated, form.footerButtons);
  };

  const setFooter = (updated: FooterButton[]) => {
    setForm((f) => ({ ...f, footerButtons: updated }));
    syncParams(form.bodyComponents, updated);
  };

  // Validation
  const validateStep = (s: number) => {
    if (s === 1) {
      if (!form.oaId) return "Vui lòng chọn Zalo OA.";
      if (!form.template_name.trim()) return "Tên template không được rỗng.";
    }
    if (s === 2) {
      const hasContent = form.bodyComponents.some((c) =>
        c.type === "TABLE" ? c.items.some((i) => i.key.trim()) : c.text.trim(),
      );
      if (!hasContent) return "Phần BODY cần có ít nhất một component có nội dung.";
    }
    if (s === 3) {
      for (const p of form.params) {
        if (detectedVars.includes(p.name) && !p.sample_value.trim())
          return `Biến "{{${p.name}}}" chưa có giá trị mẫu.`;
      }
    }
    return "";
  };

  const handleNext = () => {
    const err = validateStep(step);
    setError(err);
    if (!err) setStep((s) => (s < 3 ? (s + 1) as 1 | 2 | 3 : s));
  };

  const handleBack = () => { setStep((s) => (s > 1 ? (s - 1) as 1 | 2 | 3 : s)); setError(""); };

  const handleSubmit = async () => {
    const err = validateStep(3);
    setError(err);
    if (err) return;

    const conn = connections.find((c) => c.id === form.oaId);
    if (!conn?.accessToken) { setError("Không tìm thấy access token của OA đã chọn."); return; }

    const layout = buildLayout(form.header, form.bodyComponents, form.footerButtons);
    if (layout.length === 0) { setError("Cần có ít nhất BODY trong layout."); return; }

    const payload = {
      template_name: form.template_name.trim(),
      template_type: form.template_type,
      tag: form.tag,
      layout,
      params: form.params
        .filter((p) => detectedVars.includes(p.name))
        .map(({ name, type, sample_value }) => ({ name, type, sample_value })),
      note: form.note.trim() || undefined,
    };

    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/zalo/templates/create", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-oa-access-token": conn.accessToken },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.error !== 0) {
        setError(json.message ?? "Zalo trả về lỗi không xác định.");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  if (success) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <FiCheck className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900 mb-1">Template đã được gửi duyệt!</p>
            <p className="text-sm text-gray-500">Zalo sẽ kiểm duyệt template của bạn. Sau khi được duyệt, template sẽ chuyển sang trạng thái có thể sử dụng.</p>
          </div>
          <div className="flex gap-3 mt-2">
            <Button variant="secondary" onClick={() => router.push("/zalo-oa/marketing")}>Về danh sách</Button>
            <Button variant="primary" onClick={() => { setForm(initialForm()); setStep(1); setSuccess(false); setError(""); }}>Tạo thêm</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4 flex items-center gap-4">
        <button
          type="button"
          onClick={() => router.push("/zalo-oa/marketing")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <FiArrowLeft className="h-4 w-4" />
          Quay lại
        </button>
        <div className="h-4 w-px bg-gray-200" />
        <h1 className="text-sm font-semibold text-gray-800">Tạo template Zalo</h1>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8 space-y-6">
        {/* Step bar */}
        <StepBar step={step} />

        {/* ── Step 1 ── */}
        {step === 1 && (
          <div className="space-y-4">
            <Section title="Thông tin cơ bản">
              <div>
                <Label>Zalo OA *</Label>
                {connections.length === 0 ? (
                  <p className="text-sm text-amber-600">Chưa có OA nào được kết nối. Vui lòng kết nối OA ở trang Zalo OA trước.</p>
                ) : (
                  <select
                    value={form.oaId}
                    onChange={(e) => setForm((f) => ({ ...f, oaId: e.target.value }))}
                    className="w-full text-sm rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 bg-white"
                  >
                    <option value="">-- Chọn OA --</option>
                    {connections.map((c) => (
                      <option key={c.id} value={c.id}>{c.oaName}</option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <Label>Tên template *</Label>
                <input
                  value={form.template_name}
                  onChange={(e) => setForm((f) => ({ ...f, template_name: e.target.value }))}
                  placeholder="VD: Xác nhận đơn hàng"
                  className="w-full text-sm rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Loại template *</Label>
                  <select
                    value={form.template_type}
                    onChange={(e) => setForm((f) => ({ ...f, template_type: e.target.value as TemplateType }))}
                    className="w-full text-sm rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-primary-400 bg-white"
                  >
                    {TEMPLATE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Tag (nhóm mục đích) *</Label>
                  <select
                    value={form.tag}
                    onChange={(e) => setForm((f) => ({ ...f, tag: e.target.value as TemplateTag }))}
                    className="w-full text-sm rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-primary-400 bg-white"
                  >
                    {TEMPLATE_TAGS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <Label>Ghi chú cho bộ phận kiểm duyệt</Label>
                <textarea
                  value={form.note}
                  onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                  rows={3}
                  placeholder="Mô tả ngắn về mục đích template để Zalo duyệt dễ hơn..."
                  className="w-full resize-none text-sm rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                />
              </div>
            </Section>
          </div>
        )}

        {/* ── Step 2 ── */}
        {step === 2 && (
          <div className="space-y-4">
            {/* HEADER — Logo / Image */}
            <HeaderMediaSection
              header={form.header}
              onChange={(h) => setForm((f) => ({ ...f, header: h }))}
              oaAccessToken={
                connections.find((c) => c.id === form.oaId)?.accessToken ?? ""
              }
            />

            {/* BODY — Nội dung template */}
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-800">Nội dung Template</h3>
              </div>
              <div className="p-5 space-y-3">
                {form.bodyComponents.map((comp, i) => (
                  <BodyEditor
                    key={comp.id}
                    comp={comp}
                    index={i}
                    onChange={(updated) => {
                      const arr = [...form.bodyComponents];
                      arr[i] = updated;
                      setBody(arr);
                    }}
                    onRemove={() =>
                      setBody(form.bodyComponents.filter((_, j) => j !== i))
                    }
                  />
                ))}

                {/* Add body component buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      setBody([
                        ...form.bodyComponents,
                        { id: uid(), type: "PARAGRAPH", text: "", items: [] },
                      ])
                    }
                    className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-primary-300 hover:text-primary-700 transition-colors"
                  >
                    <FiPlus className="h-3 w-3" /> Văn bản
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setBody([
                        ...form.bodyComponents,
                        { id: uid(), type: "TABLE", text: "", items: [{ key: "", value: "" }] },
                      ])
                    }
                    className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-primary-300 hover:text-primary-700 transition-colors"
                  >
                    <FiPlus className="h-3 w-3" /> Bảng
                  </button>
                </div>
              </div>
            </div>

            {/* FOOTER — Nút thao tác */}
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-800">Nút thao tác</h3>
              </div>
              <div className="p-5 space-y-3">
                {form.footerButtons.map((btn, i) => (
                  <div
                    key={btn.id}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-gray-700">
                        Nút thao tác {i + 1}
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          setFooter(form.footerButtons.filter((_, j) => j !== i))
                        }
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <FiX className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-[11px] text-gray-500 mb-1">Loại nút</p>
                        <select
                          className="w-full text-sm rounded-lg border border-gray-200 px-3 py-2 bg-white outline-none focus:border-primary-400"
                          value="OPEN_URL"
                          disabled
                        >
                          <option value="OPEN_URL">Mở URL</option>
                        </select>
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-500 mb-1">Tên nút</p>
                        <input
                          value={btn.title}
                          onChange={(e) => {
                            const arr = [...form.footerButtons];
                            arr[i] = { ...btn, title: e.target.value };
                            setFooter(arr);
                          }}
                          placeholder="VD: Xem chi tiết đơn hàng"
                          className="w-full text-sm rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-primary-400"
                        />
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-500 mb-1">Nội dung nút (URL)</p>
                        <input
                          value={btn.content}
                          onChange={(e) => {
                            const arr = [...form.footerButtons];
                            arr[i] = { ...btn, content: e.target.value };
                            setFooter(arr);
                          }}
                          placeholder="https://example.com/order/{{order_code}}"
                          className="w-full text-sm rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-primary-400"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  disabled={form.footerButtons.length >= 3}
                  onClick={() =>
                    setFooter([
                      ...form.footerButtons,
                      { id: uid(), title: "", content: "" },
                    ])
                  }
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-primary-300 hover:text-primary-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <FiPlus className="h-3 w-3" /> Thêm nút thao tác
                </button>

                <div className="rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 text-xs text-blue-700">
                  Dùng <code className="font-mono bg-blue-100 px-1 rounded">{"{{tên_biến}}"}</code> trong URL để chèn giá trị động.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3 ── */}
        {step === 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Section title="Khai báo biến động">
              {detectedVars.length === 0 ? (
                <p className="text-sm text-gray-500 italic">Không phát hiện biến nào trong layout.</p>
              ) : (
                <div className="space-y-2">
                  {form.params.filter((p) => detectedVars.includes(p.name)).map((param) => (
                    <div key={param.id} className="space-y-1.5 rounded-lg border border-gray-200 bg-gray-50 p-3">
                      <code className="text-xs font-mono text-primary-700 bg-primary-50 px-2 py-0.5 rounded">
                        {`{{${param.name}}}`}
                      </code>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-[10px] text-gray-400 mb-1">Loại</p>
                          <select
                            value={param.type}
                            onChange={(e) => setForm((f) => ({ ...f, params: f.params.map((p) => p.id === param.id ? { ...p, type: e.target.value } : p) }))}
                            className="w-full text-xs rounded-md border border-gray-200 px-2 py-1.5 bg-white outline-none focus:border-primary-400"
                          >
                            {PARAM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 mb-1">Giá trị mẫu *</p>
                          <input
                            value={param.sample_value}
                            onChange={(e) => setForm((f) => ({ ...f, params: f.params.map((p) => p.id === param.id ? { ...p, sample_value: e.target.value } : p) }))}
                            placeholder="VD: Nguyễn Văn A"
                            className="w-full text-xs rounded-md border border-gray-200 px-2 py-1.5 outline-none focus:border-primary-400"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            <div className="space-y-4">
              <TemplatePreview body={form.bodyComponents} footer={form.footerButtons} />
              <div className="rounded-lg bg-amber-50 border border-amber-100 px-3 py-2.5 text-xs text-amber-700 space-y-1">
                <p className="font-semibold">Lưu ý trước khi gửi duyệt</p>
                <ul className="list-disc list-inside space-y-0.5 text-amber-600">
                  <li>Template sau khi gửi sẽ chờ Zalo kiểm duyệt.</li>
                  <li>Chỉ template được duyệt mới dùng gửi tin được.</li>
                  <li>Không chứa nội dung quảng cáo trong template giao dịch.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <div>
            {step > 1 && (
              <Button variant="secondary" onClick={handleBack}>Quay lại</Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => router.push("/zalo-oa/marketing")}>Huỷ</Button>
            {step < 3 ? (
              <Button variant="primary" onClick={handleNext}>Tiếp theo</Button>
            ) : (
              <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Đang gửi..." : "Gửi duyệt Zalo"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
