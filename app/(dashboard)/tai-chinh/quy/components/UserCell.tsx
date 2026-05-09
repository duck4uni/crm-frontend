"use client";

import type { NguoiDung } from "@/services/finance/types";

export function UserCell({ user }: { user: NguoiDung | undefined }) {
  if (!user) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <span className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
          </svg>
        </span>
      </span>
    );
  }
  const initials = user.ten
    .split(" ")
    .map((w) => w[0])
    .slice(-2)
    .join("")
    .toUpperCase();
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center shrink-0 border border-primary-200">
        {initials}
      </span>
      <span className="text-gray-700">{user.ten}</span>
    </span>
  );
}
