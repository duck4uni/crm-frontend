"use client";

import { Customer } from "@/types/customer";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { useDeleteConfirmation } from "@/components/ui/useDeleteConfirmation";
import { formatDateVNDateOnly } from "@/lib/utils";
import {
    FiPhone,
    FiMail,
    FiMapPin,
    FiUser,
    FiCalendar,
    FiUsers,
    FiEdit,
    FiTrash2,
    FiBriefcase,
    FiFileText,
    FiGlobe,
} from "react-icons/fi";

interface CustomerDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    customer: Customer | null;
    onEdit?: (customer: Customer) => void;
    onDelete?: (customer: Customer) => void;
}

const TYPE_LABELS: Record<string, string> = {
    individual: "Cá nhân",
    company: "Doanh nghiệp",
};

const GENDER_LABELS: Record<string, string> = {
    Male: "Nam",
    Female: "Nữ",
    Other: "Khác",
};

export function CustomerDetailModal({
    isOpen,
    onClose,
    customer,
    onEdit,
    onDelete,
}: CustomerDetailModalProps) {
    const { requestDeleteConfirmation, DeleteConfirmationDialog } = useDeleteConfirmation();

    if (!customer) return null;

    const handleEdit = () => {
        onEdit?.(customer);
    };

    const handleDelete = () => {
        requestDeleteConfirmation({
            title: "Xóa khách hàng",
            description: `Bạn có chắc chắn muốn xóa khách hàng "${customer.customerName}"? Hành động này không thể hoàn tác.`,
            onConfirm: () => {
                onDelete?.(customer);
            },
        });
    };

    const getStatusBadge = () => {
        if (customer.is_active === false) return <Badge variant="warning">Ngưng hoạt động</Badge>;
        return <Badge variant="success">Hoạt động</Badge>;
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
                {/* Header */}
                <div className="flex items-start gap-4 pb-4 border-b border-gray-200">
                    <Avatar name={customer.customerName} src={customer.avatar} size="lg" />
                    <div className="flex-1">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">{customer.customerName}</h3>
                                <p className="text-sm text-gray-500 mt-0.5">Mã KH: #{customer.id.slice(0, 8)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {getStatusBadge()}
                                {customer.type && (
                                    <Badge variant="info">{TYPE_LABELS[customer.type] ?? customer.type}</Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <Section title="Thông tin liên hệ">
                    <div className="grid grid-cols-2 gap-4">
                        <InfoItem icon={<FiPhone className="w-4 h-4" />} label="Số điện thoại" value={customer.phone || "-"} />
                        <InfoItem icon={<FiMail className="w-4 h-4" />} label="Email" value={customer.email || "-"} />
                        <InfoItem icon={<FiMapPin className="w-4 h-4" />} label="Địa chỉ" value={customer.address || "-"} className="col-span-2" />
                        <InfoItem icon={<FiGlobe className="w-4 h-4" />} label="Website" value={customer.website || "-"} />
                        <InfoItem icon={<FiUsers className="w-4 h-4" />} label="Người phụ trách" value={customer.assignee || "-"} />
                    </div>
                </Section>

                <Section title="Thông tin cá nhân">
                    <div className="grid grid-cols-2 gap-4">
                        <InfoItem icon={<FiUser className="w-4 h-4" />} label="Giới tính" value={GENDER_LABELS[customer.gender] ?? customer.gender} />
                        <InfoItem
                            icon={<FiCalendar className="w-4 h-4" />}
                            label="Ngày sinh"
                            value={customer.day_of_birth ? formatDateVNDateOnly(customer.day_of_birth) : "-"}
                        />
                        <InfoItem icon={<FiBriefcase className="w-4 h-4" />} label="Ngành nghề" value={customer.major || "-"} />
                    </div>
                </Section>

                {(customer.company_name || customer.tax_code || customer.company_establish_date) && (
                    <Section title="Thông tin doanh nghiệp">
                        <div className="grid grid-cols-2 gap-4">
                            <InfoItem icon={<FiBriefcase className="w-4 h-4" />} label="Tên công ty" value={customer.company_name || "-"} />
                            <InfoItem icon={<FiFileText className="w-4 h-4" />} label="Mã số thuế" value={customer.tax_code || "-"} />
                            <InfoItem
                                icon={<FiCalendar className="w-4 h-4" />}
                                label="Ngày thành lập"
                                value={customer.company_establish_date ? formatDateVNDateOnly(customer.company_establish_date) : "-"}
                            />
                        </div>
                    </Section>
                )}

                {(customer.description || customer.note) && (
                    <Section title="Ghi chú">
                        <div className="space-y-3">
                            {customer.description && (
                                <InfoItem icon={<FiFileText className="w-4 h-4" />} label="Mô tả" value={customer.description} />
                            )}
                            {customer.note && (
                                <InfoItem icon={<FiFileText className="w-4 h-4" />} label="Ghi chú" value={customer.note} />
                            )}
                        </div>
                    </Section>
                )}

                {customer.groups && customer.groups.length > 0 && (
                    <Section title="Nhóm khách hàng">
                        <div className="flex flex-wrap gap-2">
                            {customer.groups.map((groupName) => (
                                <Badge key={groupName} variant="info">{groupName}</Badge>
                            ))}
                        </div>
                    </Section>
                )}

                {/* Lịch sử */}
                <Section title="Lịch sử">
                    <div className="grid grid-cols-2 gap-4">
                        <InfoItem
                            icon={<FiCalendar className="w-4 h-4" />}
                            label="Ngày tạo"
                            value={customer.createdDate ? formatDateVNDateOnly(customer.createdDate) : "-"}
                        />
                        {customer.lastContactDate && (
                            <InfoItem
                                icon={<FiCalendar className="w-4 h-4" />}
                                label="Cập nhật lần cuối"
                                value={formatDateVNDateOnly(customer.lastContactDate)}
                            />
                        )}
                    </div>
                </Section>
            </div>
            <DeleteConfirmationDialog />
        </Modal>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 border-b border-gray-100 pb-2">
                {title}
            </h4>
            {children}
        </div>
    );
}

interface InfoItemProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    className?: string;
}

function InfoItem({ icon, label, value, className = "" }: InfoItemProps) {
    return (
        <div className={`flex items-start gap-3 ${className}`}>
            <div className="text-gray-400 mt-0.5 flex-shrink-0">{icon}</div>
            <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                <p className="text-sm text-gray-900 font-medium break-words">{value}</p>
            </div>
        </div>
    );
}
