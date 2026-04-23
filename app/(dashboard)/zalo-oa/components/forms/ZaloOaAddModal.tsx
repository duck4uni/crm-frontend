"use client";

import { useEffect, useRef, useState } from "react";
import { FiX, FiCheck, FiAlertCircle, FiExternalLink } from "react-icons/fi";
import type { OaConnectionFormState, OaConnectStep } from "@/types/zalo-oa";

interface ZaloOaAddModalProps {
  open: boolean;
  onClose: () => void;
  onConnected: (form: OaConnectionFormState, authCode: string) => void;
}

const ZALO_OAUTH_URL = "https://oauth.zaloapp.com/v4/oa/permission";

const initialForm: OaConnectionFormState = {
  oaName: "",
  appId: "",
  secretKey: "",
};

export function ZaloOaAddModal({ open, onClose, onConnected }: ZaloOaAddModalProps) {
  const [form, setForm] = useState<OaConnectionFormState>(initialForm);
  const [step, setStep] = useState<OaConnectStep>("form");
  const [errorMsg, setErrorMsg] = useState("");
  const popupRef = useRef<Window | null>(null);

  useEffect(() => {
    if (!open) {
      setForm(initialForm);
      setStep("form");
      setErrorMsg("");
    }
  }, [open]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== "ZALO_OA_OAUTH_CALLBACK") return;

      if (event.data.error) {
        setStep("error");
        setErrorMsg("Người dùng từ chối cấp quyền hoặc có lỗi xảy ra.");
        return;
      }

      if (event.data.code) {
        setStep("success");
        onConnected(form, event.data.code);
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [form, onConnected]);

  const handleConnect = () => {
    if (!form.oaName.trim() || !form.appId.trim() || !form.secretKey.trim()) {
      setErrorMsg("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    setErrorMsg("");
    setStep("connecting");

    const redirectUri = `${window.location.origin}/zalo-oa/callback`;
    const state = `oa_${Date.now()}`;
    const params = new URLSearchParams({
      app_id: form.appId,
      redirect_uri: redirectUri,
      state,
    });

    const url = `${ZALO_OAUTH_URL}?${params.toString()}`;
    const popup = window.open(url, "zalo_oa_oauth", "width=600,height=700,scrollbars=yes");
    popupRef.current = popup;

    if (!popup) {
      setStep("error");
      setErrorMsg("Trình duyệt đã chặn popup. Vui lòng cho phép popup và thử lại.");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">Kết nối Zalo OA mới</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {step === "success" ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                <FiCheck className="h-7 w-7 text-green-600" />
              </div>
              <p className="font-semibold text-gray-800">Kết nối thành công!</p>
              <p className="text-sm text-gray-500">OA <span className="font-medium text-gray-700">{form.oaName}</span> đã được thêm vào hệ thống.</p>
              <button
                onClick={onClose}
                className="mt-2 rounded-lg bg-primary-600 px-5 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
              >
                Đóng
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500">
                Điền thông tin ứng dụng từ{" "}
                <a
                  href="https://developers.zalo.me/app"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-0.5 text-primary-600 hover:underline"
                >
                  Zalo Developers <FiExternalLink className="h-3 w-3" />
                </a>{" "}
                để ủy quyền kết nối.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Tên OA <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.oaName}
                    onChange={(e) => setForm({ ...form, oaName: e.target.value })}
                    placeholder="Ví dụ: Điện Lạnh Quận 7"
                    disabled={step === "connecting"}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none placeholder:text-gray-400 focus:border-primary-400 focus:ring-1 focus:ring-primary-100 disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    ID ứng dụng (App ID) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.appId}
                    onChange={(e) => setForm({ ...form, appId: e.target.value })}
                    placeholder="Ví dụ: 4463534486333155530"
                    disabled={step === "connecting"}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none placeholder:text-gray-400 focus:border-primary-400 focus:ring-1 focus:ring-primary-100 disabled:bg-gray-50 disabled:text-gray-400 font-mono"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Secret Key <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={form.secretKey}
                    onChange={(e) => setForm({ ...form, secretKey: e.target.value })}
                    placeholder="Secret key từ Zalo Developers"
                    disabled={step === "connecting"}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none placeholder:text-gray-400 focus:border-primary-400 focus:ring-1 focus:ring-primary-100 disabled:bg-gray-50 disabled:text-gray-400 font-mono"
                  />
                </div>
              </div>

              {(errorMsg || step === "error") && (
                <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-600">
                  <FiAlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>{errorMsg || "Kết nối thất bại. Vui lòng thử lại."}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={onClose}
                  disabled={step === "connecting"}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={step === "error" ? () => setStep("form") : handleConnect}
                  disabled={step === "connecting"}
                  className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors disabled:opacity-60"
                >
                  {step === "connecting" && (
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  )}
                  {step === "connecting" ? "Đang chờ xác thực..." : step === "error" ? "Thử lại" : "Kết nối với Zalo"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
