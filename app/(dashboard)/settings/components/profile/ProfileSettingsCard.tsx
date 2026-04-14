import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatPermissionName } from "@/lib/utils";
import { MyInfoResponseData } from "@/types/api";

interface ProfileSettingsCardProps {
    profile: MyInfoResponseData | null;
    isLoading: boolean;
    errorMessage: string | null;
    onRetryLoadProfile: () => void;
    onEditProfile: () => void;
}

function formatDateTime(value: string | null): string {
    if (!value) {
        return "Chưa cập nhật";
    }

    const parsedDate = new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
        return value;
    }

    return parsedDate.toLocaleString("vi-VN");
}

function formatDate(value: string | null): string {
    if (!value) {
        return "Chưa cập nhật";
    }

    const parsedDate = new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
        return value;
    }

    return parsedDate.toLocaleDateString("vi-VN");
}

export function ProfileSettingsCard({
    profile,
    isLoading,
    errorMessage,
    onRetryLoadProfile,
    onEditProfile,
}: ProfileSettingsCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>Thiết lập hồ sơ</CardTitle>
                <Button variant="outline" onClick={onEditProfile}>
                    Chỉnh sửa thông tin
                </Button>
            </CardHeader>
            <CardContent className="space-y-6">
                {isLoading && !profile ? (
                    <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-gray-500">
                        Đang tải thông tin hồ sơ...
                    </div>
                ) : null}

                {errorMessage ? (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        <p>{errorMessage}</p>
                        <button
                            type="button"
                            onClick={onRetryLoadProfile}
                            className="mt-3 font-medium text-red-800 underline underline-offset-2"
                        >
                            Thử tải lại
                        </button>
                    </div>
                ) : null}

                {profile ? (
                    <>
                        <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                                <Avatar
                                    src={profile.avatar ?? undefined}
                                    name={profile.full_name || "Người dùng"}
                                    size="lg"
                                />
                                <div>
                                    <p className="text-lg font-semibold text-gray-900">{profile.full_name || "Chưa cập nhật"}</p>
                                    <p className="text-sm text-gray-600">{profile.email || "Chưa cập nhật"}</p>
                                </div>
                            </div>

                            <Badge variant={profile.is_active ? "success" : "danger"}>
                                {profile.is_active ? "Đang hoạt động" : "Tạm ngưng"}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="rounded-lg border border-gray-200 p-4">
                                <p className="text-xs uppercase tracking-wide text-gray-500">Họ và tên</p>
                                <p className="mt-1 text-sm font-medium text-gray-900">{profile.full_name || "Chưa cập nhật"}</p>
                            </div>

                            <div className="rounded-lg border border-gray-200 p-4">
                                <p className="text-xs uppercase tracking-wide text-gray-500">Email</p>
                                <p className="mt-1 text-sm font-medium text-gray-900">{profile.email || "Chưa cập nhật"}</p>
                            </div>

                            <div className="rounded-lg border border-gray-200 p-4">
                                <p className="text-xs uppercase tracking-wide text-gray-500">Vai trò</p>
                                <p className="mt-1 text-sm font-medium text-gray-900">
                                    {profile.user_permisions && profile.user_permisions.length > 0
                                        ? formatPermissionName(profile.user_permisions[0].permision.name)
                                        : "Chưa gán vai trò"}
                                </p>
                            </div>

                            <div className="rounded-lg border border-gray-200 p-4">
                                <p className="text-xs uppercase tracking-wide text-gray-500">Số điện thoại</p>
                                <p className="mt-1 text-sm font-medium text-gray-900">{profile.phone || "Chưa cập nhật"}</p>
                            </div>

                            <div className="rounded-lg border border-gray-200 p-4">
                                <p className="text-xs uppercase tracking-wide text-gray-500">Sinh nhật</p>
                                <p className="mt-1 text-sm font-medium text-gray-900">{formatDate(profile.birthday)}</p>
                            </div>

                            <div className="rounded-lg border border-gray-200 p-4">
                                <p className="text-xs uppercase tracking-wide text-gray-500">Ngày tạo</p>
                                <p className="mt-1 text-sm font-medium text-gray-900">{formatDateTime(profile.created_at)}</p>
                            </div>

                            <div className="rounded-lg border border-gray-200 p-4">
                                <p className="text-xs uppercase tracking-wide text-gray-500">Ngày cập nhật</p>
                                <p className="mt-1 text-sm font-medium text-gray-900">{formatDateTime(profile.updated_at)}</p>
                            </div>
                        </div>
                    </>
                ) : null}
            </CardContent>
        </Card>
    );
}
