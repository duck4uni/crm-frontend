"use client";

import { Customer } from "@/types/customer";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Dialog, useDialog } from "@/components/ui/Dialog";
import { formatDateVN } from "@/lib/utils";
import {
    FiPhone,
    FiMail,
    FiMapPin,
    FiUser,
    FiCalendar,
    FiUsers,
    FiTarget,
    FiEdit,
    FiTrash2,
} from "react-icons/fi";

interface CustomerDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    customer: Customer | null;
    onEdit?: (customer: Customer) => void;
    onDelete?: (customer: Customer) => void;
}

const SALUTATION_LABELS: Record<string, string> = {
    Mr: "Ông",
    Mrs: "Bà",
    Ms: "Cô",
};

const SOURCE_LABELS: Record<string, string> = {
    Referral: "Giới thiệu",
    "Google Ads": "Quảng cáo Google",
    "Walk-in": "Khách đến trực tiếp",
    Website: "Trang web",
    Email: "Thư điện tử",
};

const CUSTOMER_SOURCE_LABELS: Record<string, string> = {
    "Data Import": "Nhập dữ liệu",
    "Google Ads": "Quảng cáo Google",
    "Walk-in": "Khách đến trực tiếp",
    "Email Marketing": "Tiếp thị email",
    Website: "Trang web",
    Email: "Thư điện tử",
};

const ASSIGNEE_LABELS: Record<string, string> = {
    "Getfly Admin": "Quản trị viên Getfly",
};

const RELATIONSHIP_LABELS: Record<string, string> = {
    Data2: "Dữ liệu nhóm 2",
    Data3: "Dữ liệu nhóm 3",
};

export function CustomerDetailModal({
    isOpen,
    onClose,
    customer,
    onEdit,
    onDelete,
}: CustomerDetailModalProps) {
    const { showDialog, DialogComponent } = useDialog();

    if (!customer) return null;

    const handleEdit = () => {
        onEdit?.(customer);
    };

    const handleDelete = () => {
        showDialog({
            type: "danger",
            title: "Xóa khách hàng",
            description: `Bạn có chắc chắn muốn xóa khách hàng "${customer.customerName}"? Hành động này không thể hoàn tác.`,
            confirmText: "Xóa",
            cancelText: "Hủy",
            onConfirm: () => {
                onDelete?.(customer);
            },
        });
    };

    const salutation = SALUTATION_LABELS[customer.salutation] ?? customer.salutation;
    const source = SOURCE_LABELS[customer.source] ?? customer.source;
    const customerSource = CUSTOMER_SOURCE_LABELS[customer.customerSource || ""] ?? customer.customerSource;
    const assignee = ASSIGNEE_LABELS[customer.assignee] ?? customer.assignee;
    const relationship = RELATIONSHIP_LABELS[customer.relationship || ""] ?? customer.relationship;

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<
            string,
            { label: string; variant: "success" | "warning" | "danger" | "info" }
        > = {
            new: { label: "Đang mới", variant: "info" },
            quoted: { label: "Dự báo giá", variant: "warning" },
            contacted: { label: "Đã liên hệ", variant: "success" },
            not_contacted: { label: "Chưa liên hệ được", variant: "danger" },
            tested: { label: "Đã test đầu vào", variant: "info" },
            registered: { label: "Đã đăng ký", variant: "success" },
            considering: { label: "Đang cân nhắc", variant: "warning" },
            upsell: { label: "Bán thêm", variant: "success" },
            approached: { label: "Đã tiếp cận", variant: "info" },
            surveyed: { label: "Khảo sát", variant: "info" },
        };

        const config = statusConfig[status] || {
            label: status,
            variant: "info" as const,
        };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Chi tiết khách hàng"
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
                    <Button variant="outline" onClick={onClose}>
                        Đóng
                    </Button>
                </>
            }
        >
            <div className="space-y-6">
                {/* Header with Avatar and Basic Info */}
                <div className="flex items-start gap-4 pb-6 border-b border-gray-200">
                    <Avatar
                        name={customer.customerName}
                        src={customer.avatar}
                        size="lg"
                    />
                    <div className="flex-1">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-2xl font-semibold text-gray-900">
                                    {salutation} {customer.customerName}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Mã KH: #{customer.id}
                                </p>
                            </div>
                            <div>{getStatusBadge(customer.status)}</div>
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                        Thông tin liên hệ
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                        <InfoItem
                            icon={<FiPhone className="w-5 h-5" />}
                            label="Số điện thoại"
                            value={customer.phone || "Chưa cập nhật"}
                        />
                        <InfoItem
                            icon={<FiMail className="w-5 h-5" />}
                            label="Email"
                            value={customer.email || "Chưa cập nhật"}
                        />
                        <InfoItem
                            icon={<FiPhone className="w-5 h-5" />}
                            label="Số di động"
                            value={customer.mobilePhone}
                        />
                        <InfoItem
                            icon={<FiMapPin className="w-5 h-5" />}
                            label="Địa chỉ"
                            value={customer.address || "Chưa cập nhật"}
                            className="col-span-2"
                        />
                    </div>
                </div>

                {/* Personal Information */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                        Thông tin cá nhân
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                        <InfoItem
                            icon={<FiUser className="w-5 h-5" />}
                            label="Giới tính"
                            value={
                                customer.gender === "Male"
                                    ? "Nam"
                                    : customer.gender === "Female"
                                        ? "Nữ"
                                        : "Khác"
                            }
                        />
                        <InfoItem
                            icon={<FiUser className="w-5 h-5" />}
                            label="Danh xưng"
                            value={customer.salutation}
                        />
                    </div>
                </div>

                {/* Source & Assignment */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                        Nguồn & Phân công
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                        <InfoItem
                            icon={<FiTarget className="w-5 h-5" />}
                            label="Nguồn"
                            value={source}
                        />
                        <InfoItem
                            icon={<FiTarget className="w-5 h-5" />}
                            label="Nguồn khách hàng"
                            value={customerSource || "Chưa cập nhật"}
                        />
                        <InfoItem
                            icon={<FiUsers className="w-5 h-5" />}
                            label="Người phụ trách"
                            value={assignee}
                        />
                        <InfoItem
                            icon={<FiUsers className="w-5 h-5" />}
                            label="Mối quan hệ"
                            value={relationship || "Chưa cập nhật"}
                        />
                    </div>
                </div>

                {/* Sessions Information */}
                {(customer.sessionCount !== undefined ||
                    customer.remainingSessions !== undefined) && (
                        <div>
                            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                                Thông tin buổi học
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <InfoItem
                                    icon={<FiCalendar className="w-5 h-5" />}
                                    label="Tổng số buổi học"
                                    value={customer.sessionCount?.toString() || "0"}
                                />
                                <InfoItem
                                    icon={<FiCalendar className="w-5 h-5" />}
                                    label="Số buổi còn lại"
                                    value={customer.remainingSessions?.toString() || "0"}
                                />
                            </div>
                        </div>
                    )}

                {/* Timeline */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                        Lịch sử
                    </h4>
                    <div className="space-y-3">
                        <InfoItem
                            icon={<FiCalendar className="w-5 h-5" />}
                            label="Ngày tạo"
                            value={formatDateVN(customer.createdDate)}
                        />
                        {customer.lastContactDate && (
                            <InfoItem
                                icon={<FiCalendar className="w-5 h-5" />}
                                label="Liên hệ lần cuối"
                                value={formatDateVN(customer.lastContactDate)}
                            />
                        )}
                    </div>
                </div>
            </div>
            <DialogComponent />
        </Modal>
    );
}

// Helper component for displaying info items
interface InfoItemProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    className?: string;
}

function InfoItem({ icon, label, value, className = "" }: InfoItemProps) {
    return (
        <div className={`flex items-start gap-3 ${className}`}>
            <div className="text-gray-400 mt-0.5">{icon}</div>
            <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                <p className="text-sm text-gray-900 font-medium break-words">
                    {value}
                </p>
            </div>
        </div>
    );
}
