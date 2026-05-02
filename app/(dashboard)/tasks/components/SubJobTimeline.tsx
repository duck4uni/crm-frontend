"use client";

import { useEffect, useRef, useState } from "react";
import { FiCalendar, FiCheckCircle, FiPlus, FiTrash2, FiUsers, FiX } from "react-icons/fi";
import type { SubJob, SubJobStatus } from "../types";
import { computeSubJobsProgress } from "../utils/tasksHelpers";

const STATUS_META: Record<
    SubJobStatus,
    { label: string; dot: string; ring: string; chip: string }
> = {
    todo: {
        label: "Chưa làm",
        dot: "bg-gray-300",
        ring: "ring-gray-200",
        chip: "bg-gray-100 text-gray-600",
    },
    in_progress: {
        label: "Đang làm",
        dot: "bg-blue-500",
        ring: "ring-blue-200",
        chip: "bg-blue-100 text-blue-700",
    },
    done: {
        label: "Hoàn thành",
        dot: "bg-emerald-500",
        ring: "ring-emerald-200",
        chip: "bg-emerald-100 text-emerald-700",
    },
    blocked: {
        label: "Tạm dừng",
        dot: "bg-amber-500",
        ring: "ring-amber-200",
        chip: "bg-amber-100 text-amber-700",
    },
};

const STATUS_OPTIONS: { value: SubJobStatus; label: string }[] = [
    { value: "todo", label: "Chưa làm" },
    { value: "in_progress", label: "Đang làm" },
    { value: "done", label: "Hoàn thành" },
    { value: "blocked", label: "Tạm dừng" },
];

export interface UserOption {
    value: string;
    label: string;
}

interface OwnerMultiSelectProps {
    options: UserOption[];
    value: string[];
    onChange: (next: string[]) => void;
    placeholder?: string;
}

function OwnerMultiSelect({ options, value, onChange, placeholder }: OwnerMultiSelectProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
                setSearch("");
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    const selectedOptions = options.filter((opt) => value.includes(opt.value));
    const filteredOptions = options.filter((opt) => {
        if (value.includes(opt.value)) return false;
        if (!search.trim()) return true;
        return opt.label.toLowerCase().includes(search.toLowerCase());
    });

    const toggleOption = (id: string) => {
        if (value.includes(id)) {
            onChange(value.filter((v) => v !== id));
        } else {
            onChange([...value, id]);
        }
    };

    const removeOne = (id: string) => onChange(value.filter((v) => v !== id));

    return (
        <div ref={ref} className="relative flex-1 min-w-[180px]">
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="w-full min-h-[28px] flex flex-wrap items-center gap-1 px-1.5 py-0.5 border border-gray-200 rounded text-xs bg-white hover:border-primary-300 focus:outline-none focus:border-primary-400"
            >
                {selectedOptions.length === 0 ? (
                    <span className="flex items-center gap-1 text-gray-400 px-1 py-0.5">
                        <FiUsers className="h-3 w-3" />
                        {placeholder ?? "Chọn người phụ trách"}
                    </span>
                ) : (
                    selectedOptions.map((opt) => (
                        <span
                            key={opt.value}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-primary-50 text-primary-700 rounded text-[11px] font-medium"
                        >
                            {opt.label}
                            <span
                                role="button"
                                tabIndex={0}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeOne(opt.value);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        removeOne(opt.value);
                                    }
                                }}
                                className="hover:text-red-500 cursor-pointer"
                            >
                                <FiX className="h-3 w-3" />
                            </span>
                        </span>
                    ))
                )}
            </button>

            {open && (
                <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-hidden flex flex-col">
                    <input
                        type="text"
                        autoFocus
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Tìm người..."
                        className="px-2 py-1.5 border-b border-gray-100 text-xs outline-none"
                    />
                    <div className="overflow-y-auto">
                        {filteredOptions.length === 0 ? (
                            <p className="px-2 py-3 text-xs text-gray-400 text-center">
                                Không có kết quả
                            </p>
                        ) : (
                            filteredOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => toggleOption(opt.value)}
                                    className="w-full text-left px-2 py-1.5 text-xs hover:bg-primary-50 hover:text-primary-700"
                                >
                                    {opt.label}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

interface SubJobTimelineProps {
    subJobs: SubJob[];
    onChange: (next: SubJob[]) => void;
    userOptions: UserOption[];
}

export function SubJobTimeline({ subJobs, onChange, userOptions }: SubJobTimelineProps) {
    const [draftName, setDraftName] = useState("");
    const [draftDue, setDraftDue] = useState("");
    const [draftOwners, setDraftOwners] = useState<string[]>([]);

    const progress = computeSubJobsProgress(subJobs);
    const doneCount = subJobs.filter((s) => s.status === "done").length;

    const addSubJob = () => {
        const name = draftName.trim();
        if (!name) return;
        const newSub: SubJob = {
            id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            name,
            due_date: draftDue || undefined,
            owner_ids: draftOwners,
            status: "todo",
        };
        onChange([...subJobs, newSub]);
        setDraftName("");
        setDraftDue("");
        setDraftOwners([]);
    };

    const updateSub = (id: string, patch: Partial<SubJob>) => {
        onChange(subJobs.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    };

    const removeSub = (id: string) => {
        onChange(subJobs.filter((s) => s.id !== id));
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-700">Công việc con</p>
                    <p className="text-xs text-gray-500">
                        {subJobs.length === 0
                            ? "Chia nhỏ công việc thành các bước thực hiện."
                            : `${doneCount}/${subJobs.length} hoàn thành`}
                    </p>
                </div>
                {subJobs.length > 0 && (
                    <div className="flex items-center gap-2 min-w-[140px]">
                        <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-primary-500 to-emerald-500 transition-all"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <span className="text-xs font-semibold text-gray-700 w-10 text-right">
                            {progress}%
                        </span>
                    </div>
                )}
            </div>

            {subJobs.length > 0 && (
                <ol className="relative">
                    <span
                        className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-200"
                        aria-hidden
                    />
                    {subJobs.map((sub, index) => {
                        const meta = STATUS_META[sub.status];
                        const isLast = index === subJobs.length - 1;
                        return (
                            <li key={sub.id} className={`relative pl-6 ${isLast ? "" : "pb-3"}`}>
                                <span
                                    className={`absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full ring-4 ${meta.dot} ${meta.ring}`}
                                />
                                <div className="rounded-lg border border-gray-200 bg-white p-3 hover:border-primary-200 transition-colors">
                                    <div className="flex items-start gap-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                updateSub(sub.id, {
                                                    status: sub.status === "done" ? "todo" : "done",
                                                })
                                            }
                                            className={`mt-0.5 flex-shrink-0 ${
                                                sub.status === "done"
                                                    ? "text-emerald-500"
                                                    : "text-gray-300 hover:text-emerald-500"
                                            }`}
                                            title={
                                                sub.status === "done"
                                                    ? "Bỏ hoàn thành"
                                                    : "Đánh dấu hoàn thành"
                                            }
                                        >
                                            <FiCheckCircle className="h-4 w-4" />
                                        </button>
                                        <input
                                            type="text"
                                            value={sub.name}
                                            onChange={(e) =>
                                                updateSub(sub.id, { name: e.target.value })
                                            }
                                            className={`flex-1 bg-transparent text-sm font-medium text-gray-800 outline-none border-b border-transparent focus:border-primary-300 ${
                                                sub.status === "done"
                                                    ? "line-through text-gray-400"
                                                    : ""
                                            }`}
                                        />
                                        <span
                                            className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[11px] font-medium ${meta.chip}`}
                                        >
                                            {meta.label}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => removeSub(sub.id)}
                                            className="flex-shrink-0 text-gray-300 hover:text-red-500"
                                            title="Xóa"
                                        >
                                            <FiTrash2 className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                        <label className="flex items-center gap-1">
                                            <FiCalendar className="h-3.5 w-3.5" />
                                            <input
                                                type="date"
                                                value={sub.due_date ?? ""}
                                                onChange={(e) =>
                                                    updateSub(sub.id, {
                                                        due_date: e.target.value || undefined,
                                                    })
                                                }
                                                className="bg-transparent outline-none border-b border-transparent focus:border-primary-300 text-xs"
                                            />
                                        </label>

                                        <OwnerMultiSelect
                                            options={userOptions}
                                            value={sub.owner_ids}
                                            onChange={(next) =>
                                                updateSub(sub.id, { owner_ids: next })
                                            }
                                        />

                                        <select
                                            value={sub.status}
                                            onChange={(e) =>
                                                updateSub(sub.id, {
                                                    status: e.target.value as SubJobStatus,
                                                })
                                            }
                                            className="ml-auto bg-transparent border border-gray-200 rounded px-1.5 py-0.5 text-xs outline-none focus:border-primary-400"
                                        >
                                            {STATUS_OPTIONS.map((opt) => (
                                                <option key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ol>
            )}

            <div className="rounded-lg border border-dashed border-gray-300 p-3 bg-gray-50/50">
                <div className="flex items-center gap-2 flex-wrap">
                    <input
                        type="text"
                        value={draftName}
                        onChange={(e) => setDraftName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                addSubJob();
                            }
                        }}
                        placeholder="Tên công việc con..."
                        className="flex-1 min-w-[180px] bg-white px-2.5 py-1.5 border border-gray-200 rounded text-sm outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100"
                    />
                    <input
                        type="date"
                        value={draftDue}
                        onChange={(e) => setDraftDue(e.target.value)}
                        className="bg-white px-2 py-1.5 border border-gray-200 rounded text-sm outline-none focus:border-primary-400"
                    />
                    <div className="min-w-[200px] flex-1">
                        <OwnerMultiSelect
                            options={userOptions}
                            value={draftOwners}
                            onChange={setDraftOwners}
                            placeholder="Chọn người phụ trách"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={addSubJob}
                        disabled={!draftName.trim()}
                        className="flex items-center gap-1 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FiPlus className="h-3.5 w-3.5" /> Thêm
                    </button>
                </div>
            </div>
        </div>
    );
}
