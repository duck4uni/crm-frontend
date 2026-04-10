"use client";

import { useEffect, useState } from "react";
import { UserProfile } from "@/types/user";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Tabs } from "@/components/ui/Tabs";
import { useDialog } from "@/components/ui/Dialog";
import { formatDateVN } from "@/lib/utils";
import { userHistoryService } from "@/services/user-history";
import {
    FiPhone,
    FiMail,
    FiCalendar,
    FiEdit,
    FiTrash2,
    FiShield,
    FiClock,
    FiActivity,
} from "react-icons/fi";

interface UserDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: UserProfile | null;
    onEdit?: (user: UserProfile) => void;
    onDelete?: (user: UserProfile) => void;
    permissionNames?: string[];
}

interface ActivityItem {
    id: string;
    title: string;
    note: string;
    createdAt: Date;
}

type DetailTab = "detail" | "activity";

export function UserDetailModal({
    isOpen,
    onClose,
    user,
    onEdit,
    onDelete,
    permissionNames = [],
}: UserDetailModalProps) {
    const { showDialog, DialogComponent } = useDialog();
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [isLoadingActivities, setIsLoadingActivities] = useState(false);
    const [activeTab, setActiveTab] = useState<DetailTab>("detail");

    useEffect(() => {
        if (!isOpen || !user?.id) {
            setActivities([]);
            return;
        }

        let isDisposed = false;

        const loadActivities = async () => {
            setIsLoadingActivities(true);
            try {
                const response = await userHistoryService.getUserHistories({
                    pageSize: "50",
                    sortField: "created_at",
                    sortOrder: "DESC",
                    filters: `user_id==${user.id}`,
                });

                if (isDisposed) {
                    return;
                }

                const mapped = (response.responseData?.rows || []).map((row) => ({
                    id: row.id,
                    title: row.title,
                    note: row.note,
                    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
                }));

                setActivities(mapped);
            } catch {
                if (!isDisposed) {
                    setActivities([]);
                }
            } finally {
                if (!isDisposed) {
                    setIsLoadingActivities(false);
                }
            }
        };

        void loadActivities();

        return () => {
            isDisposed = true;
        };
    }, [isOpen, user?.id]);

    useEffect(() => {
        if (isOpen) {
            setActiveTab("detail");
        }
    }, [isOpen, user?.id]);

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

    const tabs = [
        { id: "detail", label: "Thông tin chi tiết" },
        { id: "activity", label: "Lịch sử hoạt động", badge: activities.length },
    ];

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
                <div>
                    <Tabs tabs={tabs} activeTab={activeTab} onChange={(tabId) => setActiveTab(tabId as DetailTab)} />
                </div>

                {activeTab === "detail" && (
                    <>
                        <div className="flex items-center space-x-4">
                            <Avatar name={user.full_name} src={user.avatar} size="lg" />
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">{user.full_name}</h3>
                                <p className="text-sm text-gray-500">{user.email}</p>
                                <div className="mt-1">{getStatusBadge()}</div>
                            </div>
                        </div>

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

                        <div className="rounded-lg border border-gray-200 p-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold text-gray-800">Quyền đã gán</h4>
                                <span className="text-xs text-gray-500">{permissionNames.length} quyền</span>
                            </div>

                            {permissionNames.length === 0 ? (
                                <p className="text-sm text-gray-500">Người dùng này chưa được gán quyền nào.</p>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {permissionNames.map((permissionName) => (
                                        <Badge key={permissionName} variant="info">{permissionName}</Badge>
                                    ))}
                                </div>
                            )}

                            <div className="pt-2 border-t border-gray-100">
                                <p className="text-xs text-gray-500">Để gán/gỡ quyền, bấm &quot;Chỉnh sửa&quot; và cập nhật tại form người dùng.</p>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === "activity" && (
                    <div className="rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-gray-800">Lịch sử hoạt động của người dùng</h4>
                            <span className="text-xs text-gray-500">{activities.length} mục</span>
                        </div>

                        {isLoadingActivities && (
                            <p className="text-sm text-gray-500">Đang tải lịch sử hoạt động...</p>
                        )}

                        {!isLoadingActivities && activities.length === 0 && (
                            <p className="text-sm text-gray-500">Chưa có dữ liệu lịch sử hoạt động cho người dùng này.</p>
                        )}

                        {!isLoadingActivities && activities.length > 0 && (
                            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                {activities.map((activity) => (
                                    <div key={activity.id} className="rounded-md border border-gray-100 bg-gray-50 p-3">
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                                            <span className="text-xs text-gray-500 flex items-center">
                                                <FiActivity className="w-3.5 h-3.5 mr-1" />
                                                {formatDateVN(activity.createdAt)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">{activity.note}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <DialogComponent />
        </Modal>
    );
}
