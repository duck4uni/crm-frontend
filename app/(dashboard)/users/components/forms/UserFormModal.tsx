"use client";

import { useState, useEffect } from "react";
import { UserProfile } from "@/types/user";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

interface UserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (user: Partial<UserProfile>) => void;
    user?: UserProfile | null;
}

export function UserFormModal({ isOpen, onClose, onSave, user }: UserFormModalProps) {
    const isEditing = !!user;

    const [formData, setFormData] = useState<Partial<UserProfile>>({
        full_name: "",
        email: "",
        phone: "",
        avatar: "",
        is_active: true,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

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
                avatar: "",
                is_active: true,
            });
        }
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

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;
        onSave(formData);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
            size="lg"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>Hủy</Button>
                    <Button variant="primary" onClick={handleSubmit}>
                        {isEditing ? "Cập nhật" : "Thêm mới"}
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
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                        <Input
                            name="birthday"
                            type="date"
                            value={formData.birthday ? new Date(formData.birthday).toISOString().split("T")[0] : ""}
                            onChange={(e) => setFormData((prev) => ({ ...prev, birthday: e.target.value ? new Date(e.target.value) : undefined }))}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
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
            </div>
        </Modal>
    );
}
