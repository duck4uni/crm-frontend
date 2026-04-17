import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { permissionsService } from "@/services/permissions";
import { usersService } from "@/services/users";
import { PermissionApiRow } from "@/types/api";
import { UserProfile } from "@/types/user";
import { useStableToastRef } from "@/hooks/useStableToastRef";
import { normalizeWhitespace } from "@/lib/utils";
import {
    mapPermissionOptions,
    PAGE_SIZE,
    PermissionOption,
} from "../utils/newUserHelpers";

export function useNewUserPage() {
    const router = useRouter();
    const toastRef = useStableToastRef();

    const [permissions, setPermissions] = useState<PermissionOption[]>([]);

    const loadPermissions = useCallback(async () => {
        try {
            const response = await permissionsService.getPermissions({ pageSize: PAGE_SIZE });
            const rows = (response.responseData?.rows ?? []) as PermissionApiRow[];
            setPermissions(mapPermissionOptions(rows));
        } catch (error) {
            const message = error instanceof Error ? error.message : "Không thể tải danh sách vai trò.";
            toastRef.current.error("Tải vai trò thất bại", message);
        }
    }, [toastRef]);

    useEffect(() => {
        void loadPermissions();
    }, [loadPermissions]);

    const handleCreateUser = useCallback(
        async (userData: Partial<UserProfile> & { password?: string }, roleCode: string | null) => {
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

            toastRef.current.success("Thêm mới thành công", `Người dùng "${fullName}" đã được tạo.`);
            router.push("/users");
        },
        [router, toastRef],
    );

    const goToUsers = useCallback(() => {
        router.push("/users");
    }, [router]);

    return {
        permissions,
        handleCreateUser,
        goToUsers,
    };
}
