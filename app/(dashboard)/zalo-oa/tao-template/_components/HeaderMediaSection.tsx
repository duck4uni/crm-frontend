"use client";

import { useRef, useState } from "react";
import { FiImage, FiTrash2, FiUploadCloud } from "react-icons/fi";
import type { HeaderState, HeaderVariant } from "./types";

interface HeaderMediaSectionProps {
    header: HeaderState;
    onChange: (header: HeaderState) => void;
    oaAccessToken: string;
}

// ─── Upload zone subcomponent ─────────────────────────────────────────────────

interface UploadZoneProps {
    label: string;
    hint: string;
    preview: string;
    uploading: boolean;
    onFile: (file: File) => void;
    onClear: () => void;
}

function UploadZone({ label, hint, preview, uploading, onFile, onClear }: UploadZoneProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) onFile(file);
    };

    return (
        <div className="flex-1">
            <p className="text-[11px] font-medium text-gray-600 mb-1.5">
                {label} <span className="text-red-500">*</span>
            </p>
            {preview ? (
                <div className="relative rounded-lg border border-gray-200 bg-gray-50 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview} alt={label} className="w-full h-24 object-contain" />
                    <button
                        type="button"
                        onClick={onClear}
                        className="absolute top-1.5 right-1.5 p-1 bg-white rounded-full shadow text-red-500 hover:bg-red-50 transition-colors"
                    >
                        <FiTrash2 className="h-3.5 w-3.5" />
                    </button>
                </div>
            ) : (
                <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => inputRef.current?.click()}
                    className="relative flex flex-col items-center justify-center gap-2 h-24 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-primary-300 cursor-pointer transition-colors"
                >
                    {uploading ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-primary-600" />
                    ) : (
                        <>
                            <FiUploadCloud className="h-5 w-5 text-gray-400" />
                            <p className="text-[11px] text-gray-500">
                                Kéo thả hoặc{" "}
                                <span className="text-primary-600 underline">tải ảnh lên</span>
                            </p>
                            <p className="text-[10px] text-gray-400">{hint}</p>
                        </>
                    )}
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) onFile(file);
                        }}
                    />
                </div>
            )}
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function HeaderMediaSection({ header, onChange, oaAccessToken }: HeaderMediaSectionProps) {
    const [lightUploading, setLightUploading] = useState(false);
    const [darkUploading, setDarkUploading] = useState(false);
    const [imageUploading, setImageUploading] = useState(false);
    const [uploadError, setUploadError] = useState("");

    const emptyHeader = (): HeaderState => ({
        variant: null,
        lightFile: null, lightPreview: "", lightMediaId: "",
        darkFile: null, darkPreview: "", darkMediaId: "",
        imageFile: null, imagePreview: "", imageMediaId: "",
    });

    const setVariant = (v: HeaderVariant | null) => {
        onChange({ ...emptyHeader(), variant: v });
        setUploadError("");
    };

    const uploadFile = async (
        file: File,
        setUploading: (v: boolean) => void,
    ): Promise<string> => {
        setUploading(true);
        setUploadError("");
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await fetch("/api/zalo/templates/upload-media", {
                method: "POST",
                headers: { "x-oa-access-token": oaAccessToken },
                body: formData,
            });
            const json = await res.json();
            if (json.error !== 0 || !json.data?.media_id) {
                throw new Error(json.message ?? "Upload thất bại");
            }
            return json.data.media_id as string;
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Lỗi upload ảnh";
            setUploadError(msg);
            return "";
        } finally {
            setUploading(false);
        }
    };

    const handleLightFile = async (file: File) => {
        const preview = URL.createObjectURL(file);
        const mediaId = await uploadFile(file, setLightUploading);
        onChange({ ...header, lightFile: file, lightPreview: preview, lightMediaId: mediaId });
    };

    const handleDarkFile = async (file: File) => {
        const preview = URL.createObjectURL(file);
        const mediaId = await uploadFile(file, setDarkUploading);
        onChange({ ...header, darkFile: file, darkPreview: preview, darkMediaId: mediaId });
    };

    const handleImageFile = async (file: File) => {
        const preview = URL.createObjectURL(file);
        const mediaId = await uploadFile(file, setImageUploading);
        onChange({ ...header, imageFile: file, imagePreview: preview, imageMediaId: mediaId });
    };

    return (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            {/* Title row */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div>
                    <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                        <FiImage className="h-4 w-4 text-gray-500" />
                        Logo, hình ảnh
                    </h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                        Chỉ được thêm tối đa 1 logo hoặc tối đa 3 hình ảnh
                    </p>
                </div>
                {header.variant && (
                    <button
                        type="button"
                        onClick={() => setVariant(null)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xoá header"
                    >
                        <FiTrash2 className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
                {/* LOGO */}
                {header.variant === "LOGO" && (
                    <div className="rounded-lg border border-gray-200 p-4 space-y-3">
                        <p className="text-xs font-semibold text-gray-700">Logo</p>
                        <p className="text-[11px] text-gray-400 -mt-1">
                            Logo sau khi được duyệt sẽ được tự động cập nhật cho các mẫu ZBS của OA.
                        </p>
                        <div className="flex gap-4">
                            <UploadZone
                                label="Giao diện sáng"
                                hint="Định dạng PNG. Kích thước 400x96 px."
                                preview={header.lightPreview}
                                uploading={lightUploading}
                                onFile={handleLightFile}
                                onClear={() =>
                                    onChange({ ...header, lightFile: null, lightPreview: "", lightMediaId: "" })
                                }
                            />
                            <UploadZone
                                label="Giao diện tối"
                                hint="Định dạng PNG. Kích thước 400x96 px."
                                preview={header.darkPreview}
                                uploading={darkUploading}
                                onFile={handleDarkFile}
                                onClear={() =>
                                    onChange({ ...header, darkFile: null, darkPreview: "", darkMediaId: "" })
                                }
                            />
                        </div>
                    </div>
                )}

                {/* IMAGE */}
                {header.variant === "IMAGE" && (
                    <div className="rounded-lg border border-gray-200 p-4 space-y-3">
                        <p className="text-xs font-semibold text-gray-700">Hình ảnh</p>
                        <UploadZone
                            label="Ảnh banner"
                            hint="Định dạng JPG/PNG. Tỷ lệ 16:9."
                            preview={header.imagePreview}
                            uploading={imageUploading}
                            onFile={handleImageFile}
                            onClear={() =>
                                onChange({ ...header, imageFile: null, imagePreview: "", imageMediaId: "" })
                            }
                        />
                    </div>
                )}

                {/* Upload error */}
                {uploadError && (
                    <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                        {uploadError}
                    </p>
                )}

                {/* Add buttons */}
                <div className="flex items-center gap-2 pt-1">
                    <button
                        type="button"
                        disabled={header.variant !== null}
                        onClick={() => setVariant("LOGO")}
                        className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${header.variant === "LOGO"
                                ? "border-primary-400 bg-primary-50 text-primary-700"
                                : header.variant !== null
                                    ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed"
                                    : "border-gray-200 bg-white text-gray-600 hover:border-primary-300 hover:text-primary-700"
                            }`}
                    >
                        <span className="text-base leading-none">⊕</span> Logo
                    </button>
                    <button
                        type="button"
                        disabled={header.variant !== null}
                        onClick={() => setVariant("IMAGE")}
                        className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${header.variant === "IMAGE"
                                ? "border-primary-400 bg-primary-50 text-primary-700"
                                : header.variant !== null
                                    ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed"
                                    : "border-gray-200 bg-white text-gray-600 hover:border-primary-300 hover:text-primary-700"
                            }`}
                    >
                        <span className="text-base leading-none">⊕</span> Hình ảnh
                    </button>
                </div>
            </div>
        </div>
    );
}
