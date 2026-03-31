"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface AddStageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (name: string, description: string) => void;
    categoryName: string;
}

export function AddStageModal({ isOpen, onClose, onAdd, categoryName }: AddStageModalProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState("");

    const handleAdd = () => {
        if (!name.trim()) {
            setError("Vui lòng nhập tên giai đoạn");
            return;
        }

        onAdd(name.trim(), description.trim());
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
            title={`Thêm giai đoạn mới vào "${categoryName}"`}
            size="md"
            footer={
                <div className="flex gap-3 justify-end">
                    <Button variant="outline" onClick={handleClose}>
                        Hủy
                    </Button>
                    <Button variant="primary" onClick={handleAdd}>
                        Thêm giai đoạn
                    </Button>
                </div>
            }
        >
            <div className="space-y-4">
                <Input
                    label="Tên giai đoạn *"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                        if (error) setError("");
                    }}
                    error={error}
                    placeholder="VD: Đã tư vấn"
                    autoFocus
                />

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mô tả (tùy chọn)
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Mô tả chi tiết giai đoạn này..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                        rows={3}
                    />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                        💡 Giai đoạn đại diện cho một bước trong hành trình khách hàng
                    </p>
                </div>
            </div>
        </Modal>
    );
}
