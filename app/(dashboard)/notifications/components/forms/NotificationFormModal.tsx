"use client";

import { useState, useEffect } from "react";
import { Notification, NotificationCategory } from "@/types/notification";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

interface NotificationFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (notification: Partial<Notification>) => void;
    notification?: Notification | null;
}

export function NotificationFormModal({ isOpen, onClose, onSave, notification }: NotificationFormModalProps) {
    const isEditing = !!notification;

    const [formData, setFormData] = useState<Partial<Notification>>({
        title: "",
        content: "",
        category: NotificationCategory.SYSTEM,
        sub_category: "",
        belongs_to_user_id: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (notification) {
            setFormData({
                title: notification.title,
                content: notification.content,
                category: notification.category,
                sub_category: notification.sub_category || "",
                belongs_to_user_id: notification.belongs_to_user_id,
            });
        } else {
            setFormData({
                title: "",
                content: "",
                category: NotificationCategory.SYSTEM,
                sub_category: "",
                belongs_to_user_id: "",
            });
        }
        setErrors({});
    }, [notification, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
        if (!formData.title?.trim()) newErrors.title = "Tiêu đề là bắt buộc";
        if (!formData.content?.trim()) newErrors.content = "Nội dung là bắt buộc";
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
            title={isEditing ? "Chỉnh sửa thông báo" : "Tạo thông báo mới"}
            size="lg"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>Hủy</Button>
                    <Button variant="primary" onClick={handleSubmit}>
                        {isEditing ? "Cập nhật" : "Tạo mới"}
                    </Button>
                </>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề *</label>
                    <Input
                        name="title"
                        value={formData.title || ""}
                        onChange={handleChange}
                        placeholder="Nhập tiêu đề thông báo"
                        error={errors.title}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung *</label>
                    <textarea
                        name="content"
                        value={formData.content || ""}
                        onChange={handleChange}
                        placeholder="Nhập nội dung thông báo"
                        rows={4}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.content ? "border-red-500" : "border-gray-300"
                            }`}
                    />
                    {errors.content && <p className="text-xs text-red-500 mt-1">{errors.content}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                        <Select
                            name="category"
                            value={formData.category || ""}
                            onChange={handleChange}
                            options={[
                                { value: NotificationCategory.SYSTEM, label: "Hệ thống" },
                                { value: NotificationCategory.TASK, label: "Công việc" },
                                { value: NotificationCategory.DEAL, label: "Thương vụ" },
                                { value: NotificationCategory.CUSTOMER, label: "Khách hàng" },
                                { value: NotificationCategory.REMINDER, label: "Nhắc nhở" },
                            ]}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục phụ</label>
                        <Input
                            name="sub_category"
                            value={formData.sub_category || ""}
                            onChange={handleChange}
                            placeholder="Ví dụ: thuong_vu_moi, qua_han..."
                        />
                    </div>
                </div>
            </div>
        </Modal>
    );
}
