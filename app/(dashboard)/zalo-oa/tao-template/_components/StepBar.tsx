import { FiCheck } from "react-icons/fi";
import { STEPS } from "./constants";

interface StepBarProps {
    step: number;
}

export function StepBar({ step }: StepBarProps) {
    return (
        <div className="flex items-center gap-0">
            {STEPS.map((label, i) => {
                const s = i + 1;
                const active = step === s;
                const done = step > s;
                return (
                    <div key={s} className="flex items-center flex-1 last:flex-none">
                        <div className="flex flex-col items-center gap-1">
                            <div
                                className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${active
                                        ? "bg-primary-600 text-white"
                                        : done
                                            ? "bg-green-500 text-white"
                                            : "bg-gray-100 text-gray-400"
                                    }`}
                            >
                                {done ? <FiCheck className="h-3.5 w-3.5" /> : s}
                            </div>
                            <span
                                className={`text-[11px] font-medium whitespace-nowrap ${active
                                        ? "text-primary-700"
                                        : done
                                            ? "text-green-600"
                                            : "text-gray-400"
                                    }`}
                            >
                                {label}
                            </span>
                        </div>
                        {s < STEPS.length && (
                            <div className="flex-1 h-px bg-gray-200 mx-2 mb-4" />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
