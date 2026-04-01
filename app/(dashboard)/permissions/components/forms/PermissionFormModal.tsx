"use client";

import { useState, useEffect } from "react";
import { Permission, PermissionGroup } from "@/types/permission";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

interface PermissionFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (permission: Partial<Permission>) => void;
    permission?: Permission | null;
}

export function PermissionFormModal({ isOpen, onClose, onSave, permission }: PermissionFormModalProps) {
    const isEditing = !!permission;

    const [formData, setFormData] = useState<Partial<Permission>>({
        name: "",
        code: "",
        description: "",
        group_code: PermissionGroup.USER,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (permission) {
            setFormData({
                name: permission.name,
                code: permission.code,
                description: permission.description,
                group_code: permission.group_code,
            });
        } else {
            setFormData({
                name: "",
                code: "",
                description: "",
                group_code: PermissionGroup.USER,
            });
        }
        setErrors({});
    }, [permission, isOpen]);

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
        if (!formData.name?.trim()) newErrors.name = "Tên quyền là bắt buộc";
        if (!formData.code?.trim()) newErrors.code = "Mã code là bắt buộc";
        else if (formData.code.length > 25) newErrors.code = "Mã code tối đa 25 ký tự";
        if (!formData.description?.trim()) newErrors.description = "Mô tả là bắt buộc";
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
            title={isEditing ? "Chỉnh sửa quyền" : "Thêm quyền mới"}
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên quyền *</label>
                        <Input
                            name="name"
                            value={formData.name || ""}
                            onChange={handleChange}
                            placeholder="Ví dụ: Xem danh sách người dùng"
                            error={errors.name}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mã code * (tối đa 25 ký tự)</label>
                        <Input
                            name="code"
                            value={formData.code || ""}
                            onChange={handleChange}
                            placeholder="Ví dụ: user_view"
                            error={errors.code}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nhóm quyền</label>
                    <Select
                        name="group_code"
                        value={formData.group_code || ""}
                        onChange={handleChange}
                        options={[
                            { value: PermissionGroup.USER, label: "Người dùng" },
                            { value: PermissionGroup.CUSTOMER, label: "Khách hàng" },
                            { value: PermissionGroup.DEAL, label: "Thương vụ" },
                            { value: PermissionGroup.TASK, label: "Công việc" },
                            { value: PermissionGroup.REPORT, label: "Báo cáo" },
                            { value: PermissionGroup.SETTING, label: "Cài đặt" },
                        ]}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả *</label>
                    <Input
                        name="description"
                        value={formData.description || ""}
                        onChange={handleChange}
                        placeholder="Mô tả chi tiết về quyền này"
                        error={errors.description}
                    />
                </div>
            </div>
        </Modal>
    );
}
