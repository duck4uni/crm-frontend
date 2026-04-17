"use client";

import { AccountSecurityCard } from "../account/AccountSecurityCard";
import { ChangePasswordModal } from "../account/ChangePasswordModal";
import { ProfileSettingsCard } from "../profile/ProfileSettingsCard";
import { EditProfileModal } from "../profile/EditProfileModal";
import { useSettingsPage } from "../../hooks/useSettingsPage";

export function SettingsView() {
    const {
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
    } = useSettingsPage();

    return (
        <div className="p-6 space-y-6">
            <div>
                <p className="mt-1 text-gray-500">
                    Quản lý tài khoản và các thiết lập hệ thống
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <ProfileSettingsCard
                    profile={profile}
                    isLoading={isLoading}
                    errorMessage={errorMessage}
                    onRetryLoadProfile={loadMyProfile}
                    onEditProfile={handleEditProfile}
                />

                <AccountSecurityCard onOpenChangePassword={handleOpenChangePassword} />
            </div>

            <ChangePasswordModal
                isOpen={isChangePasswordOpen}
                newPassword={newPassword}
                confirmPassword={confirmPassword}
                passwordError={passwordError}
                confirmPasswordError={confirmPasswordError}
                isUpdatingPassword={isUpdatingPassword}
                isLogoutPending={isLogoutPending}
                onClose={handleCloseChangePassword}
                onSubmit={handleUpdatePassword}
                onChangeNewPassword={handleChangeNewPassword}
                onChangeConfirmPassword={handleChangeConfirmPassword}
            />

            <EditProfileModal
                isOpen={isEditProfileOpen}
                profile={profile}
                isSaving={isSavingProfile}
                onClose={() => { if (!isSavingProfile) setIsEditProfileOpen(false); }}
                onSave={handleSaveProfile}
            />
        </div>
    );
}
