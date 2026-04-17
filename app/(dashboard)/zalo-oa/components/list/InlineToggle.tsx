"use client";

interface InlineToggleProps {
    label: string;
    checked: boolean;
    onChange: (v: boolean) => void;
}

export function InlineToggle({ label, checked, onChange }: InlineToggleProps) {
    return (
        <label className="flex items-center justify-between gap-4 cursor-pointer select-none">
            <span className="text-sm text-gray-700">{label}</span>
            <div className="relative flex-shrink-0">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    className="sr-only peer"
                />
                <div
                    className={`w-10 h-5 rounded-full transition-colors duration-200 ${checked ? "bg-primary-600" : "bg-gray-300"
                        }`}
                />
                <div
                    className={`absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0"
                        }`}
                />
            </div>
        </label>
    );
}
