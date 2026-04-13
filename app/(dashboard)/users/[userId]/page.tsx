"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  Calendar,
  Clock,
  Mail,
  Pencil,
  Phone,
  Shield,
  Trash2,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { useToast } from "@/components/ui/ToastProvider";
import { formatDateVN, formatDateVNDateOnly } from "@/lib/utils";
import { userHistoryService } from "@/services/user-history";
import { usersService } from "@/services/users";
import { UpdateUserPayload, UserApiRow, UserHistoryApiRow } from "@/types/api";
import { UserProfile } from "@/types/user";
import { UserEditorForm } from "../components/forms/UserEditorForm";

type UserTab = "detail" | "activity";

function mapApiRowToProfile(row: UserApiRow): UserProfile {
  return {
    id: row.id,
    email: row.email,
    full_name: row.full_name,
    phone: row.phone || undefined,
    avatar: row.avatar || undefined,
    birthday: row.birthday ? new Date(row.birthday) : undefined,
    is_active: row.is_active,
    is_delete: row.is_delete,
    created_at: row.created_at ? new Date(row.created_at) : new Date(),
    created_by: row.created_by || undefined,
    updated_at: row.updated_at ? new Date(row.updated_at) : new Date(),
    updated_by: row.updated_by || undefined,
  };
}

function normalizeWhitespace(value?: string): string {
  return (value || "").replace(/\s+/g, " ").trim();
}

function formatDateForApi(date?: Date): string | undefined {
  if (!date) {
    return undefined;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildUpdatePayload(nextData: Partial<UserProfile>, currentUser: UserProfile): UpdateUserPayload {
  const payload: UpdateUserPayload = {};

  const fullName = normalizeWhitespace(nextData.full_name);
  const email = normalizeWhitespace(nextData.email).toLowerCase();
  const phone = normalizeWhitespace(nextData.phone);
  const avatar = normalizeWhitespace(nextData.avatar);

  if (fullName && fullName !== currentUser.full_name) {
    payload.full_name = fullName;
  }

  if (email && email !== currentUser.email) {
    payload.email = email;
  }

  if (phone && phone !== (currentUser.phone || "")) {
    payload.phone = phone;
  }

  if (avatar && avatar !== (currentUser.avatar || "")) {
    payload.avatar = avatar;
  }

  if (typeof nextData.is_active === "boolean" && nextData.is_active !== currentUser.is_active) {
    payload.is_active = nextData.is_active;
  }

  const nextBirthday = formatDateForApi(nextData.birthday);
  const currentBirthday = formatDateForApi(currentUser.birthday);
  if (nextBirthday && nextBirthday !== currentBirthday) {
    payload.birthday = nextBirthday;
  }

  return payload;
}

export default function UserDetailPage() {
  const params = useParams<{ userId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  const userId = params.userId;
  const requestedTab = searchParams.get("tab") as UserTab | null;
  const requestedMode = searchParams.get("mode");

  const [activeTab, setActiveTab] = useState<UserTab>(
    requestedTab === "activity" || requestedTab === "detail" ? requestedTab : "detail",
  );
  const [isEditing, setIsEditing] = useState(requestedMode === "edit");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activities, setActivities] = useState<UserHistoryApiRow[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);

  useEffect(() => {
    if (requestedTab === "activity" || requestedTab === "detail") {
      setActiveTab(requestedTab);
    }
  }, [requestedTab]);

  useEffect(() => {
    setIsEditing(requestedMode === "edit");
  }, [requestedMode]);

  const loadUser = useCallback(async () => {
    if (!userId) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await usersService.getUser(userId);
      const row = response.responseData;

      if (!row) {
        toast.error("Không tìm thấy người dùng", "Người dùng không còn tồn tại.");
        router.push("/users");
        return;
      }

      setUser(mapApiRowToProfile(row));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể tải chi tiết người dùng.";
      toast.error("Tải dữ liệu thất bại", message);
    } finally {
      setIsLoading(false);
    }
  }, [router, toast, userId]);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (!user?.id) {
      setActivities([]);
      return;
    }

    let isDisposed = false;

    const loadActivities = async () => {
      setIsLoadingActivities(true);
      try {
        const response = await userHistoryService.getUserHistories({
          pageSize: "100",
          sortField: "created_at",
          sortOrder: "DESC",
          filters: `user_id==${user.id}`,
        });

        if (isDisposed) {
          return;
        }

        setActivities(response.responseData?.rows || []);
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
  }, [user?.id]);

  const tabs = useMemo(
    () => [
      { id: "detail", label: "Thông tin chi tiết" },
      { id: "activity", label: "Lịch sử hoạt động", badge: activities.length },
    ],
    [activities.length],
  );

  const handleUpdate = async (formData: Partial<UserProfile>) => {
    if (!user) {
      return;
    }

    const payload = buildUpdatePayload(formData, user);

    if (Object.keys(payload).length === 0) {
      toast.success("Không có thay đổi", "Thông tin người dùng giữ nguyên.");
      setIsEditing(false);
      return;
    }

    try {
      await usersService.updateUser(user.id, payload);
      toast.success("Cập nhật thành công", `Người dùng "${user.full_name}" đã được cập nhật.`);
      setIsEditing(false);
      await loadUser();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể cập nhật thông tin người dùng.";
      toast.error("Cập nhật thất bại", message);
    }
  };

  const handleDelete = async () => {
    if (!user) {
      return;
    }

    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa người dùng "${user.full_name}"? Hành động này không thể hoàn tác.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await usersService.deleteUser(user.id);
      toast.success("Xóa thành công", `Người dùng "${user.full_name}" đã bị xóa.`);
      router.push("/users");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể xóa người dùng.";
      toast.error("Xóa thất bại", message);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="p-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-sm text-gray-600">
          Đang tải chi tiết người dùng...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{user.full_name}</h1>
          <p className="text-sm text-gray-500 mt-1">Mã người dùng: {user.id}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" onClick={() => router.push("/users")}> 
            <ArrowLeft className="w-4 h-4 mr-2" />
            Danh sách người dùng
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Xóa
          </Button>
        </div>
      </div>

      <Card>
        <CardContent>
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={(tabId) => setActiveTab(tabId as UserTab)}
          />

          <div className="pt-6">
            {activeTab === "detail" &&
              (isEditing ? (
                <UserEditorForm
                  mode="edit"
                  initialData={user}
                  submitText="Lưu thay đổi"
                  onSubmit={handleUpdate}
                  onCancel={() => setIsEditing(false)}
                />
              ) : (
                <UserDetailSection user={user} onEdit={() => setIsEditing(true)} />
              ))}

            {activeTab === "activity" && (
              <div className="space-y-3">
                {isLoadingActivities && (
                  <div className="text-sm text-gray-500">Đang tải lịch sử hoạt động...</div>
                )}

                {!isLoadingActivities && activities.length === 0 && (
                  <div className="border border-dashed border-gray-300 rounded-lg p-6 text-sm text-gray-500">
                    Chưa có dữ liệu lịch sử hoạt động cho người dùng này.
                  </div>
                )}

                {!isLoadingActivities &&
                  activities.map((item) => (
                    <div key={item.id} className="rounded-lg border border-gray-200 p-3 bg-white">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                        <span className="text-xs text-gray-500 flex items-center">
                          <Activity className="w-3.5 h-3.5 mr-1" />
                          {item.created_at ? formatDateVN(new Date(item.created_at)) : "-"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{item.note || "-"}</p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function UserDetailSection({ user, onEdit }: { user: UserProfile; onEdit: () => void }) {
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
