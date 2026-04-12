"use client";

import { cn } from "@/lib/utils";
import { FiCheckCircle, FiAlertTriangle, FiInfo, FiXCircle, FiX } from "react-icons/fi";
import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
    type: ToastType;
    title: string;
    description?: string;
    onClose: () => void;
}

export function Toast({ type, title, description, onClose }: ToastProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger animation
        setTimeout(() => setIsVisible(true), 10);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation to complete
    };

    const config = {
        success: {
            icon: <FiCheckCircle className="w-5 h-5" />,
            bgColor: "bg-green-50",
            borderColor: "border-green-200",
            iconColor: "text-green-600",
            titleColor: "text-green-900",
            descColor: "text-green-700",
        },
        error: {
            icon: <FiXCircle className="w-5 h-5" />,
            bgColor: "bg-red-50",
            borderColor: "border-red-200",
            iconColor: "text-red-600",
            titleColor: "text-red-900",
            descColor: "text-red-700",
        },
        warning: {
            icon: <FiAlertTriangle className="w-5 h-5" />,
            bgColor: "bg-yellow-50",
            borderColor: "border-yellow-200",
            iconColor: "text-yellow-600",
            titleColor: "text-yellow-900",
            descColor: "text-yellow-700",
        },
        info: {
            icon: <FiInfo className="w-5 h-5" />,
            bgColor: "bg-primary-50",
            borderColor: "border-primary-200",
            iconColor: "text-primary-600",
            titleColor: "text-primary-900",
            descColor: "text-primary-700",
        },
    };

    const { icon, bgColor, borderColor, iconColor, titleColor, descColor } = config[type];

    return (
        <div
            className={cn(
                "w-full rounded-lg border shadow-lg p-4 transition-all duration-300 transform",
                bgColor,
                borderColor,
                isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
            )}
        >
            <div className="flex items-start gap-3">
                <div className={cn("flex-shrink-0", iconColor)}>{icon}</div>
                <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-semibold", titleColor)}>{title}</p>
                    {description && (
                        <p className={cn("text-sm mt-1", descColor)}>{description}</p>
                    )}
                </div>
                <button
                    onClick={handleClose}
                    className={cn(
                        "flex-shrink-0 rounded-md p-1 hover:bg-black hover:bg-opacity-10 transition-colors",
                        iconColor
                    )}
                >
                    <FiX className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
