import type { BodyComponent, FooterButton } from "./types";

interface TemplatePreviewProps {
    body: BodyComponent[];
    footer: FooterButton[];
}

export function TemplatePreview({ body, footer }: TemplatePreviewProps) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="bg-primary-600 px-4 py-2">
                <p className="text-xs font-semibold text-white/80">Xem trước template</p>
            </div>
            <div className="p-4 space-y-3 min-h-[120px]">
                {body.map((c, i) => {
                    if (c.type === "TITLE")
                        return (
                            <p key={i} className="font-bold text-gray-900 text-sm">
                                {c.text || (
                                    <span className="text-gray-300 italic text-xs">
                                        Tiêu đề trống
                                    </span>
                                )}
                            </p>
                        );
                    if (c.type === "PARAGRAPH")
                        return (
                            <p
                                key={i}
                                className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed"
                            >
                                {c.text || (
                                    <span className="text-gray-300 italic text-xs">
                                        Đoạn văn trống
                                    </span>
                                )}
                            </p>
                        );
                    if (c.type === "TABLE")
                        return (
                            <table key={i} className="w-full text-xs">
                                <tbody>
                                    {c.items.map((item, j) => (
                                        <tr key={j} className="border-b border-gray-100">
                                            <td className="py-1.5 pr-3 font-medium text-gray-500 w-2/5">
                                                {item.key || "—"}
                                            </td>
                                            <td className="py-1.5 text-gray-800">
                                                {item.value || "—"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        );
                    return null;
                })}
                {body.length === 0 && (
                    <p className="text-xs text-gray-300 italic text-center pt-4">
                        Chưa có nội dung
                    </p>
                )}
            </div>
            {footer.length > 0 && (
                <div className="border-t border-gray-100 px-4 py-3 flex flex-wrap gap-2">
                    {footer.map((btn, i) => (
                        <span
                            key={i}
                            className="px-3 py-1.5 rounded-full bg-primary-50 text-primary-700 text-xs font-medium border border-primary-200"
                        >
                            {btn.title || "Nút"}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
