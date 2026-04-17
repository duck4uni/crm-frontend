import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    clearAuthSession,
    getCurrentUserSession,
    setCurrentUserSession,
} from "@/lib/auth-session";
import { authService } from "@/services/auth";
import { usersService } from "@/services/users";
import { MyInfoResponseData } from "@/types/api";
import { useStableToastRef } from "@/hooks/useStableToastRef";

interface SaveProfilePayload {
    full_name: string;
    phone: string;
    birthday: string;
    avatar?: string;
}

export function useSettingsPage() {
    const router = useRouter();
    const toastRef = useStableToastRef();
    const [profile, setProfile] = useState<MyInfoResponseData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [isLogoutPending, setIsLogoutPending] = useState(false);

    const loadMyProfile = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage(null);

        try {
            const response = await usersService.getMyInfo();

            if (!response.responseData) {
                throw new Error("Không có dữ liệu hồ sơ");
            }

            setProfile(response.responseData);
            setCurrentUserSession(response.responseData);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Không thể tải thông tin hồ sơ. Vui lòng thử lại.";

            setErrorMessage(message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const cachedUser = getCurrentUserSession();

        if (cachedUser) {
            setProfile(cachedUser);
        }

        void loadMyProfile();
    }, [loadMyProfile]);

    const handleEditProfile = useCallback(() => {
        setIsEditProfileOpen(true);
    }, []);

    const handleSaveProfile = useCallback(async (data: SaveProfilePayload) => {
        if (!profile?.id) {
            return;
        }

        setIsSavingProfile(true);
        try {
            await usersService.updateUser(profile.id, {
                full_name: data.full_name,
                phone: data.phone || undefined,
                birthday: data.birthday || undefined,
                avatar: data.avatar || undefined,
            });

            const updated: typeof profile = {
                ...profile,
                full_name: data.full_name,
                phone: data.phone,
                birthday: data.birthday || null,
                avatar: data.avatar ?? profile.avatar,
            };

            setProfile(updated);
            setCurrentUserSession(updated);
            setIsEditProfileOpen(false);
            toastRef.current.success("Cập nhật thành công", "Thông tin hồ sơ đã được lưu.");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Không thể cập nhật thông tin";
            toastRef.current.error("Cập nhật thất bại", message);
        } finally {
            setIsSavingProfile(false);
        }
    }, [profile, toastRef]);

    const handleOpenChangePassword = useCallback(() => {
        setNewPassword("");
        setConfirmPassword("");
        setPasswordError(null);
        setConfirmPasswordError(null);
        setIsChangePasswordOpen(true);
    }, []);

    const handleCloseChangePassword = useCallback(() => {
        if (isUpdatingPassword || isLogoutPending) {
            return;
        }

        setIsChangePasswordOpen(false);
    }, [isLogoutPending, isUpdatingPassword]);

    const handleChangeNewPassword = useCallback((value: string) => {
        setNewPassword(value);

        if (passwordError) {
            setPasswordError(null);
        }
    }, [passwordError]);

    const handleChangeConfirmPassword = useCallback((value: string) => {
        setConfirmPassword(value);

        if (confirmPasswordError) {
            setConfirmPasswordError(null);
        }
    }, [confirmPasswordError]);

    const handleUpdatePassword = useCallback(async () => {
        const normalizedPassword = newPassword.trim();
        const normalizedConfirmPassword = confirmPassword.trim();

        setPasswordError(null);
        setConfirmPasswordError(null);

        if (!normalizedPassword) {
            setPasswordError("Vui lòng nhập mật khẩu mới");
            return;
        }

        if (normalizedPassword.length < 8) {
            setPasswordError("Mật khẩu mới cần tối thiểu 8 ký tự");
            return;
        }

        if (!normalizedConfirmPassword) {
            setConfirmPasswordError("Vui lòng xác nhận mật khẩu mới");
            return;
        }

        if (normalizedPassword !== normalizedConfirmPassword) {
            setConfirmPasswordError("Mật khẩu xác nhận không khớp");
            return;
        }

        setIsLogoutPending(false);
        setIsUpdatingPassword(true);

        try {
            const response = await authService.updatePassword({ password: normalizedPassword });

            toastRef.current.success(
                response.message || "Đổi mật khẩu thành công",
                "Bạn sẽ được đăng xuất sau vài giây để đăng nhập lại bằng mật khẩu mới.",
            );

            setNewPassword("");
            setConfirmPassword("");
            setIsLogoutPending(true);

            await new Promise<void>((resolve) => {
                window.setTimeout(() => resolve(), 1800);
            });

            try {
                await authService.logout();
            } catch (logoutError) {
                console.warn("Logout after password update failed:", logoutError);
            } finally {
                setIsChangePasswordOpen(false);
                clearAuthSession();
                router.replace("/auth/login");
            }
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Thay đổi mật khẩu thất bại. Vui lòng thử lại.";

            setPasswordError(message);
            toastRef.current.error("Không thể đổi mật khẩu", message);
        } finally {
            setIsUpdatingPassword(false);
            setIsLogoutPending(false);
        }
    }, [confirmPassword, newPassword, router, toastRef]);

    return {
        profile,
        isLoading,
        errorMessage,
        isChangePasswordOpen,
        isEditProfileOpen,
        isSavingProfile,
        newPassword,
        confirmPassword,
        passwordError,
        confirmPasswordError,
        isUpdatingPassword,
        isLogoutPending,
        loadMyProfile,
        handleEditProfile,
        handleSaveProfile,
        handleOpenChangePassword,
        handleCloseChangePassword,
        handleChangeNewPassword,
        handleChangeConfirmPassword,
        handleUpdatePassword,
        setIsEditProfileOpen,
    };
}
