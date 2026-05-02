"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";

function CallbackHandler() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    const oaId = searchParams.get("oa_id");

    console.group("[Zalo OA Callback]");
    console.log("authorization_code:", code);
    console.log("state:", state);
    console.log("oa_id:", oaId);
    console.log("error:", error);
    console.log("full url:", window.location.href);
    console.groupEnd();

    if (window.opener) {
      window.opener.postMessage(
        { type: "ZALO_OA_OAUTH_CALLBACK", code, state, error, oaId },
        window.location.origin,
      );
      window.close();
    }
  }, [searchParams]);

  return null;
}

export default function ZaloOaCallbackPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
        <p className="text-sm text-gray-500">Đang xử lý kết nối Zalo OA...</p>
      </div>
      <Suspense fallback={null}>
        <CallbackHandler />
      </Suspense>
    </div>
  );
}
