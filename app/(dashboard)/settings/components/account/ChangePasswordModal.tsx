import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

interface ChangePasswordModalProps {
    isOpen: boolean;
    newPassword: string;
    confirmPassword: string;
    passwordError: string | null;
    confirmPasswordError: string | null;
    isUpdatingPassword: boolean;
    isLogoutPending: boolean;
    onClose: () => void;
    onSubmit: () => void;
    onChangeNewPassword: (value: string) => void;
    onChangeConfirmPassword: (value: string) => void;
}

export function ChangePasswordModal({
    isOpen,
    newPassword,
    confirmPassword,
    passwordError,
    confirmPasswordError,
    isUpdatingPassword,
    isLogoutPending,
    onClose,
    onSubmit,
    onChangeNewPassword,
    onChangeConfirmPassword,
}: ChangePasswordModalProps) {
    const isDisabled = isUpdatingPassword || isLogoutPending;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Thay đổi mật khẩu"
            size="sm"
            footer={(
                <>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isDisabled}
                    >
                        Hủy
                    </Button>
                    <Button onClick={onSubmit} disabled={isDisabled}>
                        {isUpdatingPassword
                            ? "Đang cập nhật..."
                            : isLogoutPending
                                ? "Đang đăng xuất..."
                                : "Lưu mật khẩu"}
                    </Button>
                </>
            )}
        >
            <div className="space-y-4">
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                    Sau khi thay đổi mật khẩu thành công, bạn sẽ được đăng xuất để đăng nhập lại.
                </div>

                <Input
                    label="Mật khẩu mới"
                    type="password"
                    value={newPassword}
                    onChange={(event) => onChangeNewPassword(event.target.value)}
                    placeholder="Nhập mật khẩu mới"
                    error={passwordError || undefined}
                    autoComplete="new-password"
                    disabled={isDisabled}
                    onKeyDown={(event) => {
                        if (event.key === "Enter") {
                            event.preventDefault();
                            onSubmit();
                        }
                    }}
                />

                <Input
                    label="Xác nhận mật khẩu mới"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => onChangeConfirmPassword(event.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    error={confirmPasswordError || undefined}
                    autoComplete="new-password"
                    disabled={isDisabled}
                    onKeyDown={(event) => {
                        if (event.key === "Enter") {
                            event.preventDefault();
                            onSubmit();
                        }
                    }}
                />
            </div>
        </Modal>
    );
}
