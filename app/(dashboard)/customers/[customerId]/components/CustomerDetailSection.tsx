import { ReactNode } from "react";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDateVNDateOnly } from "@/lib/utils";
import { Customer } from "@/types/customer";

type CustomerDetailSectionProps = {
    customer: Customer;
    onEdit: () => void;
};

export function CustomerDetailSection({ customer, onEdit }: CustomerDetailSectionProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {customer.is_active === false ? (
                        <Badge variant="warning">Ngưng hoạt động</Badge>
                    ) : (
                        <Badge variant="success">Hoạt động</Badge>
                    )}
                    {customer.type && <Badge variant="info">{customer.type === "company" ? "Doanh nghiệp" : "Cá nhân"}</Badge>}
                </div>
                <Button variant="outline" onClick={onEdit}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Chỉnh sửa thông tin
                </Button>
            </div>

            <Section title="Thông tin liên hệ">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoItem label="Số điện thoại" value={customer.phone || "-"} />
                    <InfoItem label="Email" value={customer.email || "-"} />
                    <InfoItem label="Địa chỉ" value={customer.address || "-"} className="md:col-span-2" />
                    <InfoItem label="Website" value={customer.website || "-"} />
                    <InfoItem label="Leader" value={customer.leader_assignee || "-"} />
                    <InfoItem label="Worker" value={customer.worker_assignee || "-"} />
                </div>
            </Section>

            <Section title="Thông tin cá nhân">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoItem
                        label="Giới tính"
                        value={customer.gender === "Male" ? "Nam" : customer.gender === "Female" ? "Nữ" : "Khác"}
                    />
                    <InfoItem
                        label="Ngày sinh"
                        value={customer.day_of_birth ? formatDateVNDateOnly(customer.day_of_birth) : "-"}
                    />
                    <InfoItem label="Ngành nghề" value={customer.major || "-"} />
                </div>
            </Section>

            <Section title="Thông tin doanh nghiệp">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoItem label="Tên công ty" value={customer.company_name || "-"} />
                    <InfoItem label="Mã số thuế" value={customer.tax_code || "-"} />
                    <InfoItem
                        label="Ngày thành lập"
                        value={customer.company_establish_date ? formatDateVNDateOnly(customer.company_establish_date) : "-"}
                    />
                </div>
            </Section>

            {(customer.description || customer.note) && (
                <Section title="Ghi chú">
                    <div className="space-y-3">
                        {customer.description && <InfoItem label="Mô tả" value={customer.description} />}
                        {customer.note && <InfoItem label="Ghi chú" value={customer.note} />}
                    </div>
                </Section>
            )}

            {customer.groups && customer.groups.length > 0 && (
                <Section title="Nhóm khách hàng">
                    <div className="flex flex-wrap gap-2">
                        {customer.groups.map((groupName) => (
                            <Badge key={groupName} variant="info">
                                {groupName}
                            </Badge>
                        ))}
                    </div>
                </Section>
            )}

            <Section title="Mốc thời gian">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoItem label="Ngày tạo" value={customer.createdDate ? formatDateVNDateOnly(customer.createdDate) : "-"} />
                    <InfoItem
                        label="Cập nhật lần cuối"
                        value={customer.lastContactDate ? formatDateVNDateOnly(customer.lastContactDate) : "-"}
                    />
                </div>
            </Section>
        </div>
    );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <div>
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 border-b border-gray-100 pb-2">
                {title}
            </h4>
            {children}
        </div>
    );
}

function InfoItem({ label, value, className = "" }: { label: string; value: string; className?: string }) {
    return (
        <div className={className}>
            <p className="text-xs text-gray-500 mb-0.5">{label}</p>
            <p className="text-sm text-gray-900 font-medium break-words">{value}</p>
        </div>
    );
}
