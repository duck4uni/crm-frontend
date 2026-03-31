"use client";

import { UserProfile } from "@/types/user";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Dialog, useDialog } from "@/components/ui/Dialog";
import { formatDateVN } from "@/lib/utils";
import {
    FiPhone,
    FiMail,
    FiCalendar,
    FiEdit,
    FiTrash2,
    FiShield,
    FiClock,
} from "react-icons/fi";

interface UserDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: UserProfile | null;
    onEdit?: (user: UserProfile) => void;
    onDelete?: (user: UserProfile) => void;
}

export function UserDetailModal({
    isOpen,
    onClose,
    user,
    onEdit,
    onDelete,
}: UserDetailModalProps) {
    const { showDialog, DialogComponent } = useDialog();

    if (!user) return null;

    const handleEdit = () => {
        onEdit?.(user);
    };

    const handleDelete = () => {
        showDialog({
            type: "danger",
            title: "Xóa người dùng",
            description: `Bạn có chắc chắn muốn xóa người dùng "${user.full_name}"? Hành động này không thể hoàn tác.`,
            confirmText: "Xóa",
            cancelText: "Hủy",
            onConfirm: () => {
                onDelete?.(user);
            },
        });
    };

    const getStatusBadge = () => {
        if (user.is_delete) return <Badge variant="danger">Đã xóa</Badge>;
        if (user.is_active) return <Badge variant="success">Hoạt động</Badge>;
        return <Badge variant="warning">Ngưng hoạt động</Badge>;
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Chi tiết người dùng"
            size="lg"
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
                        <Button variant="primary" onClick={handleEdit}>
                            <FiEdit className="w-4 h-4 mr-2" />
                            Chỉnh sửa
                        </Button>
                    )}
                </>
            }
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center space-x-4">
                    <Avatar name={user.full_name} src={user.avatar} size="lg" />
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{user.full_name}</h3>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <div className="mt-1">{getStatusBadge()}</div>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <FiMail className="w-5 h-5 text-gray-400" />
                        <div>
                            <p className="text-xs text-gray-500">Email</p>
                            <p className="text-sm font-medium text-gray-900">{user.email}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <FiPhone className="w-5 h-5 text-gray-400" />
                        <div>
                            <p className="text-xs text-gray-500">Số điện thoại</p>
                            <p className="text-sm font-medium text-gray-900">{user.phone || "-"}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <FiCalendar className="w-5 h-5 text-gray-400" />
                        <div>
                            <p className="text-xs text-gray-500">Ngày sinh</p>
                            <p className="text-sm font-medium text-gray-900">
                                {user.birthday ? formatDateVN(user.birthday) : "-"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <FiShield className="w-5 h-5 text-gray-400" />
                        <div>
                            <p className="text-xs text-gray-500">Trạng thái</p>
                            <p className="text-sm font-medium text-gray-900">
                                {user.is_delete ? "Đã xóa" : user.is_active ? "Hoạt động" : "Ngưng hoạt động"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <FiClock className="w-5 h-5 text-gray-400" />
                        <div>
                            <p className="text-xs text-gray-500">Ngày tạo</p>
                            <p className="text-sm font-medium text-gray-900">{formatDateVN(user.created_at)}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <FiClock className="w-5 h-5 text-gray-400" />
                        <div>
                            <p className="text-xs text-gray-500">Cập nhật lần cuối</p>
                            <p className="text-sm font-medium text-gray-900">{formatDateVN(user.updated_at)}</p>
                        </div>
                    </div>
                </div>
            </div>

            <DialogComponent />
        </Modal>
    );
}
