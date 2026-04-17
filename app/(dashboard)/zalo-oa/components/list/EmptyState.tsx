"use client";

export function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center gap-4 text-center select-none">
            <svg
                width="168"
                height="160"
                viewBox="0 0 168 160"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <rect x="4" y="26" width="52" height="38" rx="11" fill="#F5A623" />
                <polygon points="12,64 4,80 38,64" fill="#F5A623" />
                <rect x="38" y="8" width="92" height="56" rx="14" fill="#1C3661" />
                <polygon points="54,64 42,84 82,64" fill="#1C3661" />
                <rect x="112" y="26" width="52" height="38" rx="11" fill="#F5A623" />
                <polygon points="126,64 164,80 138,64" fill="#F5A623" />
                <circle cx="34" cy="108" r="12" fill="#F5A623" />
                <path d="M14 142 Q14 126 34 126 Q54 126 54 142" fill="#F5A623" />
                <circle cx="84" cy="102" r="16" fill="#1C3661" />
                <path d="M56 142 Q56 124 84 124 Q112 124 112 142" fill="#1C3661" />
                <circle cx="134" cy="108" r="12" fill="#F5A623" />
                <path d="M114 142 Q114 126 134 126 Q154 126 154 142" fill="#F5A623" />
            </svg>
            <p className="text-sm text-gray-400">Chọn một cuộc trò chuyện để bắt đầu</p>
        </div>
    );
}
