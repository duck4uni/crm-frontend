"use client";

import { useEffect, useRef, useState } from "react";
import {
    FiFileText,
    FiImage,
    FiPlus,
    FiTrash2,
    FiUpload,
    FiX,
} from "react-icons/fi";
import {
    CustomerImage,
    CustomerMediaStore,
    CustomerNote,
    fileToDataUrl,
    generateId,
    loadCustomerMedia,
    saveCustomerMedia,
} from "../utils/customerMedia";

interface CustomerMediaTabProps {
    customerId: string;
}

export function CustomerMediaTab({ customerId }: CustomerMediaTabProps) {
    const [media, setMedia] = useState<CustomerMediaStore>({
        workImages: [],
        invoiceImages: [],
        notes: [],
    });
    const [draftNote, setDraftNote] = useState("");
    const [previewImage, setPreviewImage] = useState<CustomerImage | null>(null);

    useEffect(() => {
        if (!customerId) return;
        setMedia(loadCustomerMedia(customerId));
    }, [customerId]);

    const persist = (next: CustomerMediaStore) => {
        setMedia(next);
        saveCustomerMedia(customerId, next);
    };

    const handleAddImages = async (
        files: FileList | null,
        type: "workImages" | "invoiceImages",
    ) => {
        if (!files || files.length === 0) return;
        const newImages: CustomerImage[] = [];
        for (const file of Array.from(files)) {
            if (!file.type.startsWith("image/")) continue;
            try {
                const dataUrl = await fileToDataUrl(file);
                newImages.push({
                    id: generateId("img"),
                    dataUrl,
                    caption: file.name.replace(/\.[^.]+$/, ""),
                    uploadedAt: new Date().toISOString(),
                });
            } catch {
                // ignore single file failure
            }
        }
        if (newImages.length === 0) return;
        persist({ ...media, [type]: [...newImages, ...media[type]] });
    };

    const updateImageCaption = (
        type: "workImages" | "invoiceImages",
        id: string,
        caption: string,
    ) => {
        persist({
            ...media,
            [type]: media[type].map((img) => (img.id === id ? { ...img, caption } : img)),
        });
    };

    const removeImage = (type: "workImages" | "invoiceImages", id: string) => {
        persist({ ...media, [type]: media[type].filter((img) => img.id !== id) });
    };

    const addNote = () => {
        const content = draftNote.trim();
        if (!content) return;
        const newNote: CustomerNote = {
            id: generateId("note"),
            content,
            createdAt: new Date().toISOString(),
        };
        persist({ ...media, notes: [newNote, ...media.notes] });
        setDraftNote("");
    };

    const removeNote = (id: string) => {
        persist({ ...media, notes: media.notes.filter((n) => n.id !== id) });
    };

    return (
        <div className="space-y-6">
            <ImageGallery
                title="Hình ảnh công việc"
                description="Lưu lại hình ảnh các công việc đã thực hiện cho khách hàng này."
                icon={<FiImage className="h-4 w-4" />}
                images={media.workImages}
                onAdd={(files) => handleAddImages(files, "workImages")}
                onUpdateCaption={(id, caption) =>
                    updateImageCaption("workImages", id, caption)
                }
                onRemove={(id) => removeImage("workImages", id)}
                onPreview={setPreviewImage}
            />

            <ImageGallery
                title="Hoá đơn đã làm"
                description="Tải lên ảnh hoá đơn / chứng từ đã lập cho khách hàng."
                icon={<FiFileText className="h-4 w-4" />}
                images={media.invoiceImages}
                onAdd={(files) => handleAddImages(files, "invoiceImages")}
                onUpdateCaption={(id, caption) =>
                    updateImageCaption("invoiceImages", id, caption)
                }
                onRemove={(id) => removeImage("invoiceImages", id)}
                onPreview={setPreviewImage}
            />

            <div className="bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-800">Ghi chú khách hàng</h3>
                        <p className="text-xs text-gray-500">
                            Lưu thông tin nhắc nhở, lịch sử trao đổi, lưu ý đặc biệt.
                        </p>
                    </div>
                    <span className="text-xs text-gray-500">{media.notes.length} ghi chú</span>
                </div>

                <div className="p-4 space-y-3">
                    <div className="flex gap-2 items-start">
                        <textarea
                            value={draftNote}
                            onChange={(e) => setDraftNote(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                                    e.preventDefault();
                                    addNote();
                                }
                            }}
                            placeholder="Nhập ghi chú cho khách hàng... (Ctrl+Enter để lưu nhanh)"
                            rows={3}
                            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 resize-none"
                        />
                        <button
                            type="button"
                            onClick={addNote}
                            disabled={!draftNote.trim()}
                            className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FiPlus className="h-3.5 w-3.5" />
                            Lưu
                        </button>
                    </div>

                    {media.notes.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-6">
                            Chưa có ghi chú nào.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {media.notes.map((note) => (
                                <div
                                    key={note.id}
                                    className="rounded-lg border border-gray-100 bg-gray-50/40 p-3 group"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="flex-1 text-sm text-gray-700 whitespace-pre-line">
                                            {note.content}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => removeNote(note.id)}
                                            className="flex-shrink-0 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Xóa ghi chú"
                                        >
                                            <FiTrash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <p className="mt-1 text-[11px] text-gray-400">
                                        {new Date(note.createdAt).toLocaleString("vi-VN", {
                                            hour12: false,
                                        })}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {previewImage && (
                <ImagePreviewModal
                    image={previewImage}
                    onClose={() => setPreviewImage(null)}
                />
            )}
        </div>
    );
}

interface ImageGalleryProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    images: CustomerImage[];
    onAdd: (files: FileList | null) => void;
    onUpdateCaption: (id: string, caption: string) => void;
    onRemove: (id: string) => void;
    onPreview: (image: CustomerImage) => void;
}

function ImageGallery({
    title,
    description,
    icon,
    images,
    onAdd,
    onUpdateCaption,
    onRemove,
    onPreview,
}: ImageGalleryProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    return (
        <div className="bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <span className="text-primary-600">{icon}</span>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
                        <p className="text-xs text-gray-500">{description}</p>
                    </div>
                </div>
                <span className="text-xs text-gray-500">{images.length} ảnh</span>
            </div>

            <div className="p-4 space-y-3">
                <div
                    onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        onAdd(e.dataTransfer.files);
                    }}
                    onClick={() => inputRef.current?.click()}
                    className={`cursor-pointer rounded-lg border-2 border-dashed py-4 text-center transition-colors ${
                        isDragging
                            ? "border-primary-400 bg-primary-50"
                            : "border-gray-300 hover:border-primary-300 bg-gray-50/50"
                    }`}
                >
                    <FiUpload className="mx-auto h-5 w-5 text-gray-400 mb-1" />
                    <p className="text-xs text-gray-600">
                        Kéo thả hoặc{" "}
                        <span className="text-primary-600 font-medium">chọn ảnh để tải lên</span>
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">JPG, PNG, WEBP — có thể chọn nhiều ảnh</p>
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                            onAdd(e.target.files);
                            e.target.value = "";
                        }}
                        className="hidden"
                    />
                </div>

                {images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {images.map((img) => (
                            <div
                                key={img.id}
                                className="group rounded-lg border border-gray-200 overflow-hidden bg-white"
                            >
                                <div
                                    onClick={() => onPreview(img)}
                                    className="relative aspect-square bg-gray-100 cursor-zoom-in overflow-hidden"
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={img.dataUrl}
                                        alt={img.caption}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
                                    />
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRemove(img.id);
                                        }}
                                        className="absolute top-1 right-1 bg-white/90 hover:bg-red-500 hover:text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all"
                                        title="Xóa ảnh"
                                    >
                                        <FiTrash2 className="h-3 w-3" />
                                    </button>
                                </div>
                                <div className="p-2">
                                    <input
                                        type="text"
                                        value={img.caption}
                                        onChange={(e) => onUpdateCaption(img.id, e.target.value)}
                                        placeholder="Mô tả..."
                                        className="w-full text-xs bg-transparent outline-none border-b border-transparent focus:border-primary-300 truncate"
                                    />
                                    <p className="mt-0.5 text-[10px] text-gray-400">
                                        {new Date(img.uploadedAt).toLocaleDateString("vi-VN")}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

interface ImagePreviewModalProps {
    image: CustomerImage;
    onClose: () => void;
}

function ImagePreviewModal({ image, onClose }: ImagePreviewModalProps) {
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={onClose}
        >
            <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:bg-white/10 rounded-full p-2"
                title="Đóng"
            >
                <FiX className="h-5 w-5" />
            </button>
            <div
                className="relative max-w-5xl max-h-[90vh] w-full"
                onClick={(e) => e.stopPropagation()}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={image.dataUrl}
                    alt={image.caption}
                    className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
                />
                {image.caption && (
                    <p className="text-center text-white text-sm mt-3">{image.caption}</p>
                )}
            </div>
        </div>
    );
}
