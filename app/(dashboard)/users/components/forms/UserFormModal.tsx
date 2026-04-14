"use client";

import { useState, useEffect } from "react";
import { UserProfile } from "@/types/user";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { formatDateForInput, formatPermissionName } from "@/lib/utils";

interface PermissionOption {
    id: string;
    name: string;
    code: string;
    group_code?: string;
}

interface UserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (user: Partial<UserProfile> & { password?: string }, roleCode: string | null) => void | Promise<void>;
    user?: UserProfile | null;
    permissions?: PermissionOption[];
}

const ALLOWED_ROLE_CODES = ["SITE_WORKER", "SITE_LEADER", "SITE_OWNER"];

export function UserFormModal({
    isOpen,
    onClose,
    onSave,
    user,
    permissions = [],
}: UserFormModalProps) {
    const isEditing = !!user;

    const [formData, setFormData] = useState<Partial<UserProfile>>({
        full_name: "",
        email: "",
        phone: "",
        avatar: "",
        is_active: true,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [password, setPassword] = useState("");
    const [selectedRoleCode, setSelectedRoleCode] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.full_name,
                email: user.email,
                phone: user.phone || "",
                avatar: user.avatar || "",
                birthday: user.birthday,
                is_active: user.is_active,
            });
        } else {
            setFormData({
                full_name: "",
                email: "",
                phone: "",
            });
        }

        setPassword("");
        setSelectedRoleCode("");
        setErrors({});
    }, [user, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.full_name?.trim()) {
            newErrors.full_name = "Họ tên là bắt buộc";
        }

        if (!formData.email?.trim()) {
            newErrors.email = "Email là bắt buộc";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
            newErrors.email = "Email không hợp lệ";
        }

        if (formData.phone && !/^[0-9]{10,11}$/.test(formData.phone.trim())) {
            newErrors.phone = "Số điện thoại không hợp lệ (10-11 chữ số)";
        }

        if (!isEditing) {
            if (!password.trim()) {
                newErrors.password = "Mật khẩu là bắt buộc";
            } else if (password.length < 8) {
                newErrors.password = "Mật khẩu ít nhất 8 ký tự";
            }
            if (!selectedRoleCode) {
                newErrors.roleCode = "Vui lòng chọn vai trò";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate() || isSubmitting) {
            return;
        }

        setIsSubmitting(true);
        try {
            await onSave(
                { ...formData, ...(isEditing ? {} : { password }) },
                isEditing ? null : selectedRoleCode,
            );
            onClose();
        } catch (error) {
            console.error("UserFormModal submit error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
            size="lg"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>Hủy</Button>
                    <Button variant="primary" onClick={() => void handleSubmit()} disabled={isSubmitting}>
                        {isSubmitting ? "Đang lưu..." : isEditing ? "Cập nhật" : "Thêm mới"}
                    </Button>
                </>
            }
        >
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên *</label>
                        <Input
                            name="full_name"
                            value={formData.full_name || ""}
                            onChange={handleChange}
                            placeholder="Nhập họ tên"
                            error={errors.full_name}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <Input
                            name="email"
                            type="email"
                            value={formData.email || ""}
                            onChange={handleChange}
                            placeholder="Nhập email"
                            error={errors.email}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                        <Input
                            name="phone"
                            value={formData.phone || ""}
                            onChange={handleChange}
                            placeholder="Nhập số điện thoại"
                            error={errors.phone}
                        />
                    </div>
                </div>

                {isEditing && (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                            <Input
                                name="birthday"
                                type="date"
                                value={formatDateForInput(formData.birthday)}
                                onChange={(e) => setFormData((prev) => ({ ...prev, birthday: e.target.value ? new Date(e.target.value) : undefined }))}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                            <Select
                                name="is_active"
                                value={formData.is_active ? "true" : "false"}
                                onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.value === "true" }))}
                                options={[
                                    { value: "true", label: "Hoạt động" },
                                    { value: "false", label: "Ngưng hoạt động" },
                                ]}
                            />
                        </div>
                    </div>
                )}

                {isEditing && (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL</label>
                            <Input
                                name="avatar"
                                value={formData.avatar || ""}
                                onChange={handleChange}
                                placeholder="URL ảnh đại diện"
                            />
                        </div>
                    </div>
                )}

                {!isEditing && (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu *</label>
                            <Input
                                name="password"
                                type="password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (errors.password) setErrors((prev) => { const n = { ...prev }; delete n.password; return n; });
                                }}
                                placeholder="Nhập mật khẩu (ít nhất 8 ký tự)"
                                error={errors.password}
                                disabled={isSubmitting}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò *</label>
                            <Select
                                name="roleCode"
                                value={selectedRoleCode}
                                onChange={(e) => {
                                    setSelectedRoleCode(e.target.value);
                                    if (errors.roleCode) setErrors((prev) => { const n = { ...prev }; delete n.roleCode; return n; });
                                }}
                                options={[
                                    ...permissions
                                        .filter((p) => ALLOWED_ROLE_CODES.includes(p.code))
                                        .map((p) => ({ value: p.code, label: formatPermissionName(p.name) })),
                                ]}
                                disabled={isSubmitting}
                            />
                            {errors.roleCode && <p className="mt-1 text-xs text-red-500">{errors.roleCode}</p>}
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}
