"use client";

import { useState, useEffect } from "react";
import { UserProfile } from "@/types/user";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

interface PermissionOption {
    id: string;
    name: string;
    code: string;
    group_code?: string;
}

interface UserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (user: Partial<UserProfile>, permissionIds: string[]) => void | Promise<void>;
    user?: UserProfile | null;
    permissions?: PermissionOption[];
    initialPermissionIds?: string[];
}

const GROUP_LABELS: Record<string, string> = {
    user: "Người dùng",
    customer: "Khách hàng",
    deal: "Thương vụ",
    task: "Công việc",
    report: "Báo cáo",
    setting: "Cài đặt",
};

export function UserFormModal({
    isOpen,
    onClose,
    onSave,
    user,
    permissions = [],
    initialPermissionIds = [],
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
    const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);
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
                avatar: "",
                is_active: true,
            });
        }

        setSelectedPermissionIds(initialPermissionIds);
        setErrors({});
    }, [user, isOpen, initialPermissionIds]);

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

    const togglePermission = (permissionId: string) => {
        setSelectedPermissionIds((prev) =>
            prev.includes(permissionId)
                ? prev.filter((id) => id !== permissionId)
                : [...prev, permissionId],
        );
    };

    const handleSubmit = async () => {
        if (!validate() || isSubmitting) {
            return;
        }

        setIsSubmitting(true);
        try {
            await onSave(formData, selectedPermissionIds);
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    const permissionGroups = permissions.reduce<Record<string, PermissionOption[]>>((acc, permission) => {
        const groupCode = permission.group_code || "other";
        if (!acc[groupCode]) {
            acc[groupCode] = [];
        }
        acc[groupCode].push(permission);
        return acc;
    }, {});

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

                <div className="rounded-lg border border-gray-200 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-800">Phân quyền người dùng</p>
                            <p className="text-xs text-gray-500 mt-0.5">Chọn nhiều quyền trực tiếp khi tạo/sửa người dùng.</p>
                        </div>
                        <span className="text-xs text-gray-500">Đã chọn {selectedPermissionIds.length}</span>
                    </div>

                    {permissions.length === 0 && (
                        <p className="text-sm text-gray-500">Chưa có dữ liệu quyền để gán.</p>
                    )}

                    {permissions.length > 0 && (
                        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                            {Object.entries(permissionGroups).map(([groupCode, groupedPermissions]) => (
                                <div key={groupCode} className="space-y-2">
                                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                        {GROUP_LABELS[groupCode] || groupCode}
                                    </p>
                                    <div className="grid grid-cols-1 gap-2">
                                        {groupedPermissions.map((permission) => {
                                            const checked = selectedPermissionIds.includes(permission.id);
                                            return (
                                                <label
                                                    key={permission.id}
                                                    className={`
                                                        flex items-start gap-2.5 rounded-md border px-3 py-2 cursor-pointer transition-colors
                                                        ${checked ? "border-blue-300 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}
                                                    `}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={() => togglePermission(permission.id)}
                                                        className="mt-0.5 rounded border-gray-300"
                                                        disabled={isSubmitting}
                                                    />
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 leading-tight">{permission.name}</p>
                                                        <p className="text-xs text-gray-500 font-mono mt-0.5">{permission.code}</p>
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}
