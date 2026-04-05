"use client";

import { Notification, NotificationCategory } from "@/types/notification";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDateVN } from "@/lib/utils";
import {
    FiBell,
    FiClock,
    FiCheckCircle,
    FiTag,
    FiTrash2,
} from "react-icons/fi";

interface NotificationDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    notification: Notification | null;
    onDelete?: (notification: Notification) => void;
}

const CATEGORY_CONFIG: Record<string, { label: string; variant: "success" | "warning" | "danger" | "info" }> = {
    [NotificationCategory.SYSTEM]: { label: "Hệ thống", variant: "info" },
    [NotificationCategory.TASK]: { label: "Công việc", variant: "warning" },
    [NotificationCategory.DEAL]: { label: "Thương vụ", variant: "success" },
    [NotificationCategory.CUSTOMER]: { label: "Khách hàng", variant: "info" },
    [NotificationCategory.REMINDER]: { label: "Nhắc nhở", variant: "danger" },
    [NotificationCategory.EXAM]: { label: "Thi cử", variant: "warning" },
};

export function NotificationDetailModal({
    isOpen,
    onClose,
    notification,
    onDelete,
}: NotificationDetailModalProps) {
    if (!notification) return null;

    const categoryConfig = CATEGORY_CONFIG[notification.category];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Chi tiết thông báo"
            size="lg"
            footer={
                <>
                    {onDelete && (
                        <Button variant="danger" onClick={() => onDelete(notification)}>
                            <FiTrash2 className="w-4 h-4 mr-2" />
                            Xóa
                        </Button>
                    )}
                    <div className="flex-1" />
                </>
            }
        >
            <div className="space-y-6">
                {/* Title and Category */}
                <div>
                    <div className="flex items-center space-x-3 mb-2">
                        <FiBell className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">{notification.title}</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                        {categoryConfig && <Badge variant={categoryConfig.variant}>{categoryConfig.label}</Badge>}
                        {notification.sub_category && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                {notification.sub_category}
                            </span>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700 leading-relaxed">{notification.content}</p>
                </div>

                {/* Status Info */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <FiCheckCircle className="w-5 h-5 text-gray-400" />
                        <div>
                            <p className="text-xs text-gray-500">Trạng thái đọc</p>
                            <div className="mt-0.5">
                                {notification.has_user_read ? (
                                    <Badge variant="success">Đã đọc</Badge>
                                ) : (
                                    <Badge variant="warning">Chưa đọc</Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <FiClock className="w-5 h-5 text-gray-400" />
                        <div>
                            <p className="text-xs text-gray-500">Hết hạn</p>
                            <p className="text-sm font-medium text-gray-900">
                                {notification.expired_at ? formatDateVN(notification.expired_at) : "-"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <FiClock className="w-5 h-5 text-gray-400" />
                        <div>
                            <p className="text-xs text-gray-500">Ngày nhận</p>
                            <p className="text-sm font-medium text-gray-900">{formatDateVN(notification.created_at)}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <FiTag className="w-5 h-5 text-gray-400" />
                        <div>
                            <p className="text-xs text-gray-500">Danh mục phụ</p>
                            <p className="text-sm font-medium text-gray-900">{notification.sub_category || "-"}</p>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
