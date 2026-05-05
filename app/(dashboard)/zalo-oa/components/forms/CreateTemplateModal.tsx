"use client";

import { useState } from "react";
import { FiPlus, FiTrash2, FiX } from "react-icons/fi";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import type { OaConnection } from "@/types/zalo-oa";

// ─── Types ────────────────────────────────────────────────────────────────────

type TemplateType = "1" | "2" | "3" | "4" | "5";
type TemplateTag = "1" | "2" | "3";
type ComponentType = "TITLE" | "PARAGRAPH" | "TABLE";
type ButtonType = "OPEN_URL";

interface TableItem {
  key: string;
  value: string;
}

interface BodyComponent {
  id: string;
  type: ComponentType;
  text: string;
  items: TableItem[];
}

interface FooterButton {
  id: string;
  title: string;
  type: ButtonType;
  content: string;
}

interface TemplateParam {
  id: string;
  name: string;
  type: string;
  sample_value: string;
}

interface FormState {
  oaId: string;
  template_name: string;
  template_type: TemplateType;
  tag: TemplateTag;
  note: string;
  bodyComponents: BodyComponent[];
  footerButtons: FooterButton[];
  params: TemplateParam[];
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const TEMPLATE_TYPES: { value: TemplateType; label: string }[] = [
  { value: "1", label: "1 - Custom" },
  { value: "2", label: "2 - Authentication (OTP)" },
  { value: "3", label: "3 - Payment Request" },
  { value: "4", label: "4 - Voucher" },
  { value: "5", label: "5 - Service Rating" },
];

const TEMPLATE_TAGS: { value: TemplateTag; label: string }[] = [
  { value: "1", label: "1 - Giao dịch" },
  { value: "2", label: "2 - Chăm sóc khách hàng" },
  { value: "3", label: "3 - Hậu mãi / Khuyến mãi" },
];

const PARAM_TYPES = [
  "CUSTOMER_NAME",
  "ORDER_CODE",
  "AMOUNT",
  "ORDER_DATE",
  "APPOINTMENT_DATE",
  "APPOINTMENT_TIME",
  "DOCTOR_NAME",
  "PAYMENT_LINK",
  "TRACKING_CODE",
  "OTHER",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2);
}

function extractVarsFromText(text: string): string[] {
  const regex = /{{\s*([a-zA-Z0-9_]+)\s*}}/g;
  const found = new Set<string>();
  let m;
  while ((m = regex.exec(text)) !== null) found.add(m[1]);
  return Array.from(found);
}

function extractAllVars(bodyComponents: BodyComponent[], footerButtons: FooterButton[]): string[] {
  const found = new Set<string>();
  for (const c of bodyComponents) {
    extractVarsFromText(c.text).forEach((v) => found.add(v));
    for (const item of c.items) {
      extractVarsFromText(item.key).forEach((v) => found.add(v));
      extractVarsFromText(item.value).forEach((v) => found.add(v));
    }
  }
  for (const btn of footerButtons) {
    extractVarsFromText(btn.content).forEach((v) => found.add(v));
  }
  return Array.from(found);
}

function buildLayout(bodyComponents: BodyComponent[], footerButtons: FooterButton[]) {
  const layout = [];

  const bodyParts = bodyComponents
    .filter((c) => (c.type === "TABLE" ? c.items.length > 0 : c.text.trim()))
    .map((c) => {
      if (c.type === "TABLE") {
        return { type: "TABLE", items: c.items.filter((i) => i.key.trim() || i.value.trim()) };
      }
      return { type: c.type, text: c.text };
    });

  if (bodyParts.length > 0) {
    layout.push({ type: "BODY", components: bodyParts });
  }

  if (footerButtons.length > 0) {
    const items = footerButtons
      .filter((b) => b.title.trim() && b.content.trim())
      .map((b) => ({ title: b.title, type: b.type, content: b.content }));
    if (items.length > 0) {
      layout.push({ type: "FOOTER", components: [{ type: "BUTTONS", items }] });
    }
  }

  return layout;
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-1">{children}</p>;
}

interface BodyComponentEditorProps {
  comp: BodyComponent;
  index: number;
  onChange: (updated: BodyComponent) => void;
  onRemove: () => void;
}

function BodyComponentEditor({ comp, index, onChange, onRemove }: BodyComponentEditorProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-gray-400">#{index + 1}</span>
          <select
            value={comp.type}
            onChange={(e) => onChange({ ...comp, type: e.target.value as ComponentType, items: comp.items })}
            className="text-xs rounded border border-gray-200 px-2 py-1 bg-white outline-none focus:border-primary-400"
          >
            <option value="TITLE">TITLE</option>
            <option value="PARAGRAPH">PARAGRAPH</option>
            <option value="TABLE">TABLE</option>
          </select>
        </div>
        <button type="button" onClick={onRemove} className="text-gray-400 hover:text-red-500">
          <FiTrash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {comp.type === "TABLE" ? (
        <div className="space-y-1.5">
          {comp.items.map((item, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <input
                value={item.key}
                onChange={(e) => {
                  const items = [...comp.items];
                  items[i] = { ...item, key: e.target.value };
                  onChange({ ...comp, items });
                }}
                placeholder="Tên cột"
                className="flex-1 text-xs rounded border border-gray-200 px-2 py-1 outline-none focus:border-primary-400"
              />
              <input
                value={item.value}
                onChange={(e) => {
                  const items = [...comp.items];
                  items[i] = { ...item, value: e.target.value };
                  onChange({ ...comp, items });
                }}
                placeholder="Giá trị (có thể dùng {{biến}})"
                className="flex-1 text-xs rounded border border-gray-200 px-2 py-1 outline-none focus:border-primary-400"
              />
              <button
                type="button"
                onClick={() => {
                  const items = comp.items.filter((_, idx) => idx !== i);
                  onChange({ ...comp, items });
                }}
                className="text-gray-400 hover:text-red-500"
              >
                <FiX className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => onChange({ ...comp, items: [...comp.items, { key: "", value: "" }] })}
            className="text-xs text-primary-600 hover:underline flex items-center gap-1"
          >
            <FiPlus className="h-3 w-3" /> Thêm hàng
          </button>
        </div>
      ) : (
        <textarea
          value={comp.text}
          onChange={(e) => onChange({ ...comp, text: e.target.value })}
          placeholder={comp.type === "TITLE" ? "Tiêu đề" : "Nội dung đoạn văn. Dùng {{tên_biến}} cho giá trị động."}
          rows={comp.type === "PARAGRAPH" ? 3 : 1}
          className="w-full resize-none text-xs rounded border border-gray-200 px-2 py-1.5 outline-none focus:border-primary-400"
        />
      )}
    </div>
  );
}

// ─── Main modal ────────────────────────────────────────────────────────────────

interface CreateTemplateModalProps {
  isOpen: boolean;
  connections: OaConnection[];
  onClose: () => void;
  onCreated?: () => void;
}

const initialForm = (): FormState => ({
  oaId: "",
  template_name: "",
  template_type: "1",
  tag: "1",
  note: "",
  bodyComponents: [{ id: uid(), type: "TITLE", text: "", items: [] }],
  footerButtons: [],
  params: [],
});

export function CreateTemplateModal({ isOpen, connections, onClose, onCreated }: CreateTemplateModalProps) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const detectedVars = extractAllVars(form.bodyComponents, form.footerButtons);

  const syncParams = (bodyComponents: BodyComponent[], footerButtons: FooterButton[]) => {
    const vars = extractAllVars(bodyComponents, footerButtons);
    setForm((prev) => {
      const existing = new Map(prev.params.map((p) => [p.name, p]));
      const merged = vars.map(
        (v) => existing.get(v) ?? { id: uid(), name: v, type: "OTHER", sample_value: "" },
      );
      const extra = prev.params.filter((p) => !vars.includes(p.name));
      return { ...prev, params: [...merged, ...extra] };
    });
  };

  const updateBodyComponents = (updated: BodyComponent[]) => {
    setForm((prev) => ({ ...prev, bodyComponents: updated }));
    syncParams(updated, form.footerButtons);
  };

  const updateFooterButtons = (updated: FooterButton[]) => {
    setForm((prev) => ({ ...prev, footerButtons: updated }));
    syncParams(form.bodyComponents, updated);
  };

  const handleClose = () => {
    setForm(initialForm());
    setStep(1);
    setError("");
    setSuccess(false);
    onClose();
  };

  const validateStep1 = () => {
    if (!form.oaId) return "Vui lòng chọn OA.";
    if (!form.template_name.trim()) return "Tên template không được rỗng.";
    return "";
  };

  const validateStep2 = () => {
    const hasContent = form.bodyComponents.some((c) =>
      c.type === "TABLE" ? c.items.some((i) => i.key.trim()) : c.text.trim(),
    );
    if (!hasContent) return "Phần BODY cần có ít nhất một component có nội dung.";
    return "";
  };

  const validateStep3 = () => {
    for (const p of form.params) {
      if (!p.sample_value.trim()) return `Biến "${p.name}" chưa có giá trị mẫu.`;
    }
    const unusedExtra = form.params.filter((p) => !detectedVars.includes(p.name));
    if (unusedExtra.length > 0) {
      return `Biến "${unusedExtra[0].name}" được khai báo nhưng không dùng trong layout.`;
    }
    return "";
  };

  const handleNext = () => {
    let err = "";
    if (step === 1) err = validateStep1();
    if (step === 2) err = validateStep2();
    setError(err);
    if (!err) setStep((s) => (s < 3 ? ((s + 1) as 1 | 2 | 3) : s));
  };

  const handleSubmit = async () => {
    const err = validateStep3();
    setError(err);
    if (err) return;

    const conn = connections.find((c) => c.id === form.oaId);
    if (!conn || !conn.accessToken) { setError("Không tìm thấy OA đã chọn hoặc chưa có access token."); return; }

    const layout = buildLayout(form.bodyComponents, form.footerButtons);
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
        headers: {
          "Content-Type": "application/json",
          "x-oa-access-token": conn.accessToken as string,
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.error !== 0) {
        setError(json.message ?? "Zalo trả về lỗi không xác định.");
      } else {
        setSuccess(true);
        onCreated?.();
      }
    } catch {
      setError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const stepLabel = ["Thông tin cơ bản", "Thiết kế layout", "Biến & Xem trước"];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Tạo template Zalo"
      size="lg"
      footer={
        success ? (
          <Button variant="primary" onClick={handleClose}>Đóng</Button>
        ) : (
          <>
            <Button variant="secondary" onClick={handleClose}>Huỷ</Button>
            {step > 1 && (
              <Button variant="secondary" onClick={() => { setStep((s) => (s > 1 ? (s - 1) as 1 | 2 | 3 : s)); setError(""); }}>
                Quay lại
              </Button>
            )}
            {step < 3 ? (
              <Button variant="primary" onClick={handleNext}>Tiếp theo</Button>
            ) : (
              <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Đang gửi..." : "Gửi duyệt Zalo"}
              </Button>
            )}
          </>
        )
      }
    >
      {/* Step indicator */}
      <div className="flex items-center gap-1 mb-5">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-1 flex-1">
            <div
              className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                step === s
                  ? "bg-primary-600 text-white"
                  : s < step
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-400"
              }`}
            >
              {s}
            </div>
            <span className={`text-[11px] ${step === s ? "text-primary-700 font-semibold" : "text-gray-400"}`}>
              {stepLabel[s - 1]}
            </span>
            {s < 3 && <div className="flex-1 h-px bg-gray-200 mx-1" />}
          </div>
        ))}
      </div>

      {success ? (
        <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <span className="text-green-600 text-xl font-bold">✓</span>
          </div>
          <p className="font-semibold text-gray-800">Template đã được gửi lên Zalo để kiểm duyệt!</p>
          <p className="text-xs text-gray-500">Sau khi duyệt, template sẽ chuyển sang trạng thái "Đã duyệt" và có thể dùng để gửi tin.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* ── STEP 1 ── */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <FieldLabel>Zalo OA *</FieldLabel>
                <select
                  value={form.oaId}
                  onChange={(e) => setForm((f) => ({ ...f, oaId: e.target.value }))}
                  className="w-full text-sm rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100"
                >
                  <option value="">-- Chọn OA --</option>
                  {connections.map((c) => (
                    <option key={c.id} value={c.id}>{c.oaName}</option>
                  ))}
                </select>
              </div>

              <div>
                <FieldLabel>Tên template *</FieldLabel>
                <input
                  value={form.template_name}
                  onChange={(e) => setForm((f) => ({ ...f, template_name: e.target.value }))}
                  placeholder="VD: Xác nhận đơn hàng"
                  className="w-full text-sm rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel>Loại template *</FieldLabel>
                  <select
                    value={form.template_type}
                    onChange={(e) => setForm((f) => ({ ...f, template_type: e.target.value as TemplateType }))}
                    className="w-full text-sm rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-primary-400"
                  >
                    {TEMPLATE_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <FieldLabel>Tag (nhóm mục đích) *</FieldLabel>
                  <select
                    value={form.tag}
                    onChange={(e) => setForm((f) => ({ ...f, tag: e.target.value as TemplateTag }))}
                    className="w-full text-sm rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-primary-400"
                  >
                    {TEMPLATE_TAGS.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <FieldLabel>Ghi chú cho bộ phận kiểm duyệt</FieldLabel>
                <textarea
                  value={form.note}
                  onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                  rows={3}
                  placeholder="VD: Template dùng để thông báo xác nhận đơn hàng sau khi khách đặt hàng thành công..."
                  className="w-full resize-none text-sm rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100"
                />
              </div>
            </div>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <FieldLabel>BODY – Nội dung chính *</FieldLabel>
                  <button
                    type="button"
                    onClick={() => updateBodyComponents([...form.bodyComponents, { id: uid(), type: "PARAGRAPH", text: "", items: [] }])}
                    className="flex items-center gap-1 text-xs text-primary-600 hover:underline"
                  >
                    <FiPlus className="h-3 w-3" /> Thêm component
                  </button>
                </div>
                {form.bodyComponents.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4 rounded-lg border border-dashed border-gray-200">
                    Chưa có component nào. Nhấn "Thêm component" để bắt đầu.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {form.bodyComponents.map((comp, i) => (
                      <BodyComponentEditor
                        key={comp.id}
                        comp={comp}
                        index={i}
                        onChange={(updated) => {
                          const arr = [...form.bodyComponents];
                          arr[i] = updated;
                          updateBodyComponents(arr);
                        }}
                        onRemove={() => updateBodyComponents(form.bodyComponents.filter((_, idx) => idx !== i))}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <FieldLabel>FOOTER – Nút bấm (tuỳ chọn)</FieldLabel>
                  <button
                    type="button"
                    onClick={() => updateFooterButtons([...form.footerButtons, { id: uid(), title: "", type: "OPEN_URL", content: "" }])}
                    className="flex items-center gap-1 text-xs text-primary-600 hover:underline"
                  >
                    <FiPlus className="h-3 w-3" /> Thêm nút
                  </button>
                </div>
                {form.footerButtons.map((btn, i) => (
                  <div key={btn.id} className="flex items-center gap-2 mb-2 rounded-lg border border-gray-200 bg-gray-50 p-2">
                    <input
                      value={btn.title}
                      onChange={(e) => {
                        const arr = [...form.footerButtons];
                        arr[i] = { ...btn, title: e.target.value };
                        updateFooterButtons(arr);
                      }}
                      placeholder="Tên nút"
                      className="flex-1 text-xs rounded border border-gray-200 px-2 py-1 outline-none focus:border-primary-400"
                    />
                    <input
                      value={btn.content}
                      onChange={(e) => {
                        const arr = [...form.footerButtons];
                        arr[i] = { ...btn, content: e.target.value };
                        updateFooterButtons(arr);
                      }}
                      placeholder="URL (https://...)"
                      className="flex-[2] text-xs rounded border border-gray-200 px-2 py-1 outline-none focus:border-primary-400"
                    />
                    <button
                      type="button"
                      onClick={() => updateFooterButtons(form.footerButtons.filter((_, idx) => idx !== i))}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <FiX className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 text-xs text-blue-700">
                Dùng <code className="font-mono bg-blue-100 px-1 rounded">{"{{"}</code>tên_biến<code className="font-mono bg-blue-100 px-1 rounded">{"}}"}</code> để chèn giá trị động. Biến sẽ được khai báo ở bước tiếp theo.
              </div>
            </div>
          )}

          {/* ── STEP 3 ── */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <FieldLabel>Khai báo biến động</FieldLabel>
                {detectedVars.length === 0 ? (
                  <p className="text-xs text-gray-500 italic">Không phát hiện biến nào trong layout.</p>
                ) : (
                  <div className="space-y-2">
                    {form.params
                      .filter((p) => detectedVars.includes(p.name))
                      .map((param) => (
                        <div key={param.id} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-2">
                          <code className="text-xs font-mono text-primary-700 bg-primary-50 px-2 py-0.5 rounded w-36 truncate flex-shrink-0">
                            {`{{${param.name}}}`}
                          </code>
                          <select
                            value={param.type}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                params: f.params.map((p) => p.id === param.id ? { ...p, type: e.target.value } : p),
                              }))
                            }
                            className="text-xs rounded border border-gray-200 px-2 py-1 bg-white outline-none focus:border-primary-400 w-40 flex-shrink-0"
                          >
                            {PARAM_TYPES.map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                          <input
                            value={param.sample_value}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                params: f.params.map((p) => p.id === param.id ? { ...p, sample_value: e.target.value } : p),
                              }))
                            }
                            placeholder="Giá trị mẫu *"
                            className="flex-1 text-xs rounded border border-gray-200 px-2 py-1 outline-none focus:border-primary-400"
                          />
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Preview */}
              <div>
                <FieldLabel>Xem trước layout</FieldLabel>
                <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3 text-sm max-h-64 overflow-y-auto">
                  {form.bodyComponents.map((c, i) => {
                    if (c.type === "TITLE") return (
                      <p key={i} className="font-bold text-gray-900">{c.text || <span className="text-gray-300 italic">Tiêu đề trống</span>}</p>
                    );
                    if (c.type === "PARAGRAPH") return (
                      <p key={i} className="text-gray-700 whitespace-pre-wrap leading-relaxed">{c.text || <span className="text-gray-300 italic">Đoạn văn trống</span>}</p>
                    );
                    if (c.type === "TABLE") return (
                      <table key={i} className="w-full text-xs">
                        <tbody>
                          {c.items.map((item, j) => (
                            <tr key={j} className="border-b border-gray-100">
                              <td className="py-1 pr-3 font-medium text-gray-600 w-1/2">{item.key}</td>
                              <td className="py-1 text-gray-800">{item.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    );
                    return null;
                  })}
                  {form.footerButtons.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                      {form.footerButtons.map((btn, i) => (
                        <span key={i} className="px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-medium border border-primary-200">
                          {btn.title || "Nút"}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
