"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useToast } from "@/components/ui/ToastProvider";
import { permissionsService } from "@/services/permissions";
import { usersService } from "@/services/users";
import { PermissionApiRow } from "@/types/api";
import { UserProfile } from "@/types/user";
import { UserEditorForm } from "../components/forms/UserEditorForm";

interface PermissionOption {
  id: string;
  name: string;
  code: string;
  group_code: string;
}

const PAGE_SIZE = "500";
const ALLOWED_ROLE_CODES = ["SITE_WORKER", "SITE_LEADER", "SITE_OWNER"];

function normalizeWhitespace(value?: string): string {
  return (value || "").replace(/\s+/g, " ").trim();
}

export default function NewUserPage() {
  const router = useRouter();
  const toast = useToast();

  const [permissions, setPermissions] = useState<PermissionOption[]>([]);

  const loadPermissions = useCallback(async () => {
    try {
      const response = await permissionsService.getPermissions({ pageSize: PAGE_SIZE });
      const rows = (response.responseData?.rows ?? []) as PermissionApiRow[];

      const options = rows
        .filter((permission) => ALLOWED_ROLE_CODES.includes(permission.code))
        .map((permission) => ({
          id: permission.id,
          name: permission.name,
          code: permission.code,
          group_code: permission.group_code,
        }));

      setPermissions(options);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể tải danh sách vai trò.";
      toast.error("Tải vai trò thất bại", message);
    }
  }, [toast]);

  useEffect(() => {
    void loadPermissions();
  }, [loadPermissions]);

  const handleCreateUser = async (
    userData: Partial<UserProfile> & { password?: string },
    roleCode: string | null,
  ) => {
    if (!roleCode) {
      throw new Error("Vui lòng chọn vai trò.");
    }

    const fullName = normalizeWhitespace(userData.full_name);
    const email = normalizeWhitespace(userData.email).toLowerCase();
    const phone = normalizeWhitespace(userData.phone);

    await usersService.createAdminUsers(
      [
        {
          email,
          full_name: fullName,
          phone: phone || undefined,
          password: userData.password || "",
        },
      ],
      roleCode,
    );

    toast.success("Thêm mới thành công", `Người dùng "${fullName}" đã được tạo.`);
    router.push("/users");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thêm người dùng mới</h1>
          <p className="text-sm text-gray-500 mt-1">Tạo tài khoản người dùng trực tiếp trên trang quản lý.</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/users")}> 
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại danh sách
        </Button>
      </div>

      <Card>
        <CardContent>
          <UserEditorForm
            mode="create"
            submitText="Thêm mới"
            permissions={permissions}
            onSubmit={handleCreateUser}
            onCancel={() => router.push("/users")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
