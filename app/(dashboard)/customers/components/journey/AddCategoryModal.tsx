"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";

interface AddCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (name: string, color: string) => void;
}

const colorOptions = [
    { value: "blue", label: "Xanh dương" },
    { value: "green", label: "Xanh lá" },
    { value: "yellow", label: "Vàng" },
    { value: "red", label: "Đỏ" },
    { value: "purple", label: "Tím" },
    { value: "pink", label: "Hồng" },
    { value: "orange", label: "Cam" },
    { value: "gray", label: "Xám" },
];

export function AddCategoryModal({ isOpen, onClose, onAdd }: AddCategoryModalProps) {
    const [name, setName] = useState("");
    const [color, setColor] = useState("blue");
    const [error, setError] = useState("");

    const handleAdd = () => {
        if (!name.trim()) {
            setError("Vui lòng nhập tên thư mục");
            return;
        }

        onAdd(name.trim(), color);
        handleClose();
    };

    const handleClose = () => {
        setName("");
        setColor("blue");
        setError("");
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Thêm thư mục mới"
            size="md"
            footer={
                <div className="flex gap-3 justify-end">
                    <Button variant="outline" onClick={handleClose}>
                        Hủy
                    </Button>
                    <Button variant="primary" onClick={handleAdd}>
                        Thêm thư mục
                    </Button>
                </div>
            }
        >
            <div className="space-y-4">
                <Input
                    label="Tên thư mục *"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                        if (error) setError("");
                    }}
                    error={error}
                    placeholder="VD: Giai đoạn tìm hiểu"
                    autoFocus
                />

                <Select
                    label="Màu sắc"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    options={colorOptions}
                />

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700">
                        📌 Thư mục sẽ chứa các giai đoạn trong hành trình khách hàng
                    </p>
                </div>
            </div>
        </Modal>
    );
}
