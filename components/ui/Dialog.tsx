"use client";

import { cn } from "@/lib/utils";
import React, { useEffect } from "react";
import { FiAlertTriangle, FiInfo, FiCheckCircle, FiX } from "react-icons/fi";
import { Button } from "./Button";

interface DialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm?: () => void;
    title: string;
    description?: string;
    type?: "info" | "warning" | "success" | "danger";
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
}

export function Dialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    type = "info",
    confirmText = "Xác nhận",
    cancelText = "Hủy",
    isLoading = false,
}: DialogProps) {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen && !isLoading) {
                onClose();
            }
        };

        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose, isLoading]);

    if (!isOpen) return null;

    const icons = {
        info: <FiInfo className="w-6 h-6 text-blue-600" />,
        warning: <FiAlertTriangle className="w-6 h-6 text-yellow-600" />,
        success: <FiCheckCircle className="w-6 h-6 text-green-600" />,
        danger: <FiAlertTriangle className="w-6 h-6 text-red-600" />,
    };

    const bgColors = {
        info: "bg-blue-100",
        warning: "bg-yellow-100",
        success: "bg-green-100",
        danger: "bg-red-100",
    };

    const buttonVariant = {
        info: "primary" as const,
        warning: "primary" as const,
        success: "primary" as const,
        danger: "danger" as const,
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={!isLoading ? onClose : undefined}
            />

            {/* Dialog */}
            <div className="relative bg-white rounded-lg shadow-xl w-full mx-4 max-w-md">
                {/* Content */}
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className={cn("flex-shrink-0 rounded-full p-2", bgColors[type])}>
                            {icons[type]}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {title}
                            </h3>
                            {description && (
                                <p className="text-sm text-gray-600">{description}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        {cancelText}
                    </Button>
                    {onConfirm && (
                        <Button
                            variant={buttonVariant[type]}
                            onClick={onConfirm}
                            disabled={isLoading}
                        >
                            {isLoading ? "Đang xử lý..." : confirmText}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

// Hook để sử dụng Dialog dễ dàng hơn
export function useDialog() {
    const [isOpen, setIsOpen] = React.useState(false);
    const [config, setConfig] = React.useState<Omit<DialogProps, "isOpen" | "onClose">>({
        title: "",
        onConfirm: undefined,
    });

    const showDialog = (dialogConfig: Omit<DialogProps, "isOpen" | "onClose">) => {
        setConfig(dialogConfig);
        setIsOpen(true);
    };

    const closeDialog = () => {
        setIsOpen(false);
    };

    const DialogComponent = () => (
        <Dialog isOpen={isOpen} onClose={closeDialog} {...config} />
    );

    return { showDialog, closeDialog, DialogComponent };
}
