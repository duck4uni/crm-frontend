import { FiPlus, FiTrash2, FiX } from "react-icons/fi";
import type { BodyComponent, ComponentType } from "./types";

interface BodyEditorProps {
    comp: BodyComponent;
    index: number;
    onChange: (c: BodyComponent) => void;
    onRemove: () => void;
}

export function BodyEditor({ comp, index, onChange, onRemove }: BodyEditorProps) {
    return (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400">#{index + 1}</span>
                    <select
                        value={comp.type}
                        onChange={(e) =>
                            onChange({ ...comp, type: e.target.value as ComponentType })
                        }
                        className="text-xs rounded-md border border-gray-200 px-2 py-1 bg-white outline-none focus:border-primary-400"
                    >
                        <option value="TITLE">TITLE</option>
                        <option value="PARAGRAPH">PARAGRAPH</option>
                        <option value="TABLE">TABLE</option>
                    </select>
                </div>
                <button
                    type="button"
                    onClick={onRemove}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                >
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
                                className="flex-1 text-xs rounded-md border border-gray-200 px-2 py-1.5 outline-none focus:border-primary-400"
                            />
                            <input
                                value={item.value}
                                onChange={(e) => {
                                    const items = [...comp.items];
                                    items[i] = { ...item, value: e.target.value };
                                    onChange({ ...comp, items });
                                }}
                                placeholder="Giá trị (dùng {{biến}})"
                                className="flex-[2] text-xs rounded-md border border-gray-200 px-2 py-1.5 outline-none focus:border-primary-400"
                            />
                            <button
                                type="button"
                                onClick={() =>
                                    onChange({
                                        ...comp,
                                        items: comp.items.filter((_, j) => j !== i),
                                    })
                                }
                                className="text-gray-400 hover:text-red-500"
                            >
                                <FiX className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() =>
                            onChange({
                                ...comp,
                                items: [...comp.items, { key: "", value: "" }],
                            })
                        }
                        className="flex items-center gap-1 text-xs text-primary-600 hover:underline"
                    >
                        <FiPlus className="h-3 w-3" /> Thêm hàng
                    </button>
                </div>
            ) : (
                <textarea
                    value={comp.text}
                    onChange={(e) => onChange({ ...comp, text: e.target.value })}
                    placeholder={
                        comp.type === "TITLE"
                            ? "Tiêu đề hiển thị"
                            : "Nội dung đoạn văn. Dùng {{tên_biến}} cho giá trị động."
                    }
                    rows={comp.type === "PARAGRAPH" ? 3 : 1}
                    className="w-full resize-none text-sm rounded-md border border-gray-200 px-3 py-2 outline-none focus:border-primary-400"
                />
            )}
        </div>
    );
}
