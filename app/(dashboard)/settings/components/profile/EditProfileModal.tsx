"use client";

import { useEffect, useState } from "react";
import { MyInfoResponseData } from "@/types/api";

interface EditProfileFormData {
    full_name: string;
    phone: string;
    birthday: string;
    avatar?: string;
}

interface EditProfileModalProps {
    isOpen: boolean;
    profile: MyInfoResponseData | null;
    isSaving: boolean;
    onClose: () => void;
    onSave: (data: EditProfileFormData) => void;
}

export function EditProfileModal({
    isOpen,
    profile,
    isSaving,
    onClose,
    onSave,
}: EditProfileModalProps) {
    const [form, setForm] = useState<EditProfileFormData>({
        full_name: "",
        phone: "",
        birthday: "",
        avatar: "",
    });
    const [errors, setErrors] = useState<Partial<EditProfileFormData>>({});

    useEffect(() => {
        if (isOpen && profile) {
            setForm({
                full_name: profile.full_name || "",
                phone: profile.phone || "",
                birthday: profile.birthday ? profile.birthday.substring(0, 10) : "",
                avatar: profile.avatar || "",
            });
            setErrors({});
        }
    }, [isOpen, profile]);

    if (!isOpen) return null;

    const validate = (): boolean => {
        const newErrors: Partial<EditProfileFormData> = {};

        if (!form.full_name.trim()) {
            newErrors.full_name = "Vui lòng nhập họ và tên";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSave({
                full_name: form.full_name.trim(),
                phone: form.phone.trim(),
                birthday: form.birthday || "",
                avatar: form.avatar?.trim() || undefined,
            });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                    <h2 className="text-base font-semibold text-gray-900">Chỉnh sửa thông tin</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSaving}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                    {/* Full name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Họ và tên <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.full_name}
                            onChange={(e) => setForm((prev) => ({ ...prev, full_name: e.target.value }))}
                            disabled={isSaving}
                            className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                            placeholder="Nhập họ và tên"
                        />
                        {errors.full_name && (
                            <p className="mt-1 text-xs text-red-600">{errors.full_name}</p>
                        )}
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Số điện thoại
                        </label>
                        <input
                            type="tel"
                            value={form.phone}
                            onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                            disabled={isSaving}
                            className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                            placeholder="Nhập số điện thoại"
                        />
                    </div>

                    {/* Birthday */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ngày sinh
                        </label>
                        <input
                            type="date"
                            value={form.birthday}
                            onChange={(e) => setForm((prev) => ({ ...prev, birthday: e.target.value }))}
                            disabled={isSaving}
                            className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                        />
                    </div>

                    {/* Avatar */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            URL ảnh đại diện
                        </label>
                        <input
                            type="text"
                            value={form.avatar}
                            onChange={(e) => setForm((prev) => ({ ...prev, avatar: e.target.value }))}
                            disabled={isSaving}
                            className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                            placeholder="Nhập URL ảnh đại diện"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSaving}
                            className="h-9 px-4 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="h-9 px-4 rounded-lg bg-primary-600 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
