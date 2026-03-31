"use client";

import { Permission, PermissionGroup } from "@/types/permission";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dialog, useDialog } from "@/components/ui/Dialog";
import {
    FiShield,
    FiCode,
    FiTag,
    FiEdit,
    FiTrash2,
    FiInfo,
} from "react-icons/fi";

interface PermissionDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    permission: Permission | null;
    onEdit?: (permission: Permission) => void;
    onDelete?: (permission: Permission) => void;
}

const GROUP_CONFIG: Record<string, { label: string; variant: "success" | "warning" | "danger" | "info" }> = {
    [PermissionGroup.USER]: { label: "Người dùng", variant: "info" },
    [PermissionGroup.CUSTOMER]: { label: "Khách hàng", variant: "success" },
    [PermissionGroup.DEAL]: { label: "Deal", variant: "warning" },
    [PermissionGroup.TASK]: { label: "Task", variant: "info" },
    [PermissionGroup.REPORT]: { label: "Báo cáo", variant: "warning" },
    [PermissionGroup.SETTING]: { label: "Cài đặt", variant: "danger" },
};

export function PermissionDetailModal({
    isOpen,
    onClose,
    permission,
    onEdit,
    onDelete,
}: PermissionDetailModalProps) {
    const { showDialog, DialogComponent } = useDialog();

    if (!permission) return null;

    const handleDelete = () => {
        showDialog({
            type: "danger",
            title: "Xóa quyền",
            description: `Bạn có chắc chắn muốn xóa quyền "${permission.name}"? Hành động này không thể hoàn tác.`,
            confirmText: "Xóa",
            cancelText: "Hủy",
            onConfirm: () => {
                onDelete?.(permission);
            },
        });
    };

    const groupConfig = GROUP_CONFIG[permission.group_code];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Chi tiết quyền"
            size="md"
            footer={
                <>
                    {onDelete && (
                        <Button variant="danger" onClick={handleDelete}>
                            <FiTrash2 className="w-4 h-4 mr-2" />
                            Xóa
                        </Button>
                    )}
                    <div className="flex-1" />
                    {onEdit && (
                        <Button variant="primary" onClick={() => onEdit(permission)}>
                            <FiEdit className="w-4 h-4 mr-2" />
                            Chỉnh sửa
                        </Button>
                    )}
                </>
            }
        >
            <div className="space-y-6">
                <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                        <FiShield className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{permission.name}</h3>
                        {groupConfig && <Badge variant={groupConfig.variant}>{groupConfig.label}</Badge>}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <FiCode className="w-5 h-5 text-gray-400" />
                        <div>
                            <p className="text-xs text-gray-500">Mã code</p>
                            <code className="text-sm bg-gray-200 px-2 py-0.5 rounded">{permission.code}</code>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <FiTag className="w-5 h-5 text-gray-400" />
                        <div>
                            <p className="text-xs text-gray-500">Nhóm quyền</p>
                            <p className="text-sm font-medium text-gray-900">
                                {groupConfig?.label || permission.group_code}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <FiInfo className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                            <p className="text-xs text-gray-500">Mô tả</p>
                            <p className="text-sm text-gray-900">{permission.description}</p>
                        </div>
                    </div>
                </div>
            </div>

            <DialogComponent />
        </Modal>
    );
}
