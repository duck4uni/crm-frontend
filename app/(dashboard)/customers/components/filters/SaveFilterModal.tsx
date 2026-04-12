"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface SaveFilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string, description?: string) => void;
}

export function SaveFilterModal({ isOpen, onClose, onSave }: SaveFilterModalProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState("");

    const handleSave = () => {
        if (!name.trim()) {
            setError("Vui lòng nhập tên bộ lọc");
            return;
        }

        onSave(name.trim(), description.trim() || undefined);
        handleClose();
    };

    const handleClose = () => {
        setName("");
        setDescription("");
        setError("");
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Lưu bộ lọc"
            size="md"
            footer={
                <div className="flex gap-3 justify-end">
                    <Button variant="outline" onClick={handleClose}>
                        Hủy
                    </Button>
                    <Button variant="primary" onClick={handleSave}>
                        Lưu bộ lọc
                    </Button>
                </div>
            }
        >
            <div className="space-y-4">
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                    <p className="text-sm text-primary-800">
                        Bộ lọc sẽ lưu các điều kiện bạn đã chọn để sử dụng lại sau này
                    </p>
                </div>

                <Input
                    label="Tên bộ lọc *"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                        if (error) setError("");
                    }}
                    error={error}
                    placeholder="VD: Khách hàng tiềm năng tháng này"
                    autoFocus
                />

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mô tả (tùy chọn)
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Thêm mô tả để dễ nhớ hơn..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                        rows={3}
                    />
                </div>
            </div>
        </Modal>
    );
}
