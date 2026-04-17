import { ReactNode } from "react";
import { Calendar, Clock, Mail, Pencil, Phone, Shield } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDateVN, formatDateVNDateOnly } from "@/lib/utils";
import { UserProfile } from "@/types/user";

type UserDetailSectionProps = {
    user: UserProfile;
    onEdit: () => void;
};

export function UserDetailSection({ user, onEdit }: UserDetailSectionProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center space-x-4">
                    <Avatar name={user.full_name} src={user.avatar} size="lg" />
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{user.full_name}</h3>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <div className="mt-1">
                            {user.is_delete ? (
                                <Badge variant="danger">Đã xóa</Badge>
                            ) : user.is_active ? (
                                <Badge variant="success">Hoạt động</Badge>
                            ) : (
                                <Badge variant="warning">Ngưng hoạt động</Badge>
                            )}
                        </div>
                    </div>
                </div>

                <Button variant="outline" onClick={onEdit}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Chỉnh sửa thông tin
                </Button>
            </div>

            <Section title="Thông tin liên hệ">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoItem icon={Mail} label="Email" value={user.email} />
                    <InfoItem icon={Phone} label="Số điện thoại" value={user.phone || "-"} />
                </div>
            </Section>

            <Section title="Thông tin tài khoản">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoItem icon={Calendar} label="Ngày sinh" value={user.birthday ? formatDateVNDateOnly(user.birthday) : "-"} />
                    <InfoItem
                        icon={Shield}
                        label="Trạng thái"
                        value={user.is_delete ? "Đã xóa" : user.is_active ? "Hoạt động" : "Ngưng hoạt động"}
                    />
                    <InfoItem icon={Clock} label="Ngày tạo" value={formatDateVN(user.created_at)} />
                    <InfoItem icon={Clock} label="Cập nhật lần cuối" value={formatDateVN(user.updated_at)} />
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

function InfoItem({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Icon className="w-5 h-5 text-gray-400" />
            <div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-sm font-medium text-gray-900 break-words">{value}</p>
            </div>
        </div>
    );
}
