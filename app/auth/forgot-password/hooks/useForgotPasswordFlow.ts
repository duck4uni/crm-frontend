"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";
import { clearAuthSession, setAuthSession } from "@/lib/auth-session";
import { authService } from "@/services/auth";
import {
    FORGOT_PASSWORD_STEPS,
    OTP_LENGTH,
} from "../utils/forgotPassword.types";
import type { ForgotStep } from "../utils/forgotPassword.types";
import { isValidEmail } from "../utils/forgotPassword.validators";

export function useForgotPasswordFlow() {
    const toast = useToast();
    const router = useRouter();

    const [step, setStep] = useState<ForgotStep>("request");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        if (countdown <= 0) return;
        const t = window.setTimeout(() => setCountdown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [countdown]);

    const handleRequestOtp = async () => {
        const normalizedEmail = email.trim();
        if (!isValidEmail(normalizedEmail)) {
            toast.error("Email không hợp lệ", "Vui lòng nhập đúng định dạng email.");
            return;
        }

        setIsPending(true);
        try {
            await authService.forgotPassword({ email: normalizedEmail });
            setStep("verify");
            setCountdown(60);
            toast.success("Đã gửi OTP", "Vui lòng kiểm tra email để lấy mã xác thực.");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Không thể gửi OTP.";
            toast.error("Gửi OTP thất bại", message);
        } finally {
            setIsPending(false);
        }
    };

    const handleResendOtp = async () => {
        const normalizedEmail = email.trim();
        if (!isValidEmail(normalizedEmail)) return;

        setIsPending(true);
        try {
            await authService.resendOtp({ email: normalizedEmail });
            setCountdown(60);
            toast.success("Đã gửi lại OTP", "Mã OTP mới đã được gửi đến email của bạn.");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Không thể gửi lại OTP.";
            toast.error("Gửi lại OTP thất bại", message);
        } finally {
            setIsPending(false);
        }
    };

    const handleVerifyOtp = async () => {
        const normalizedEmail = email.trim();
        const normalizedOtp = otp.trim();
        if (normalizedOtp.length < OTP_LENGTH) {
            toast.error("Thiếu OTP", `Vui lòng nhập đủ ${OTP_LENGTH} chữ số.`);
            return;
        }

        setIsPending(true);
        try {
            const response = await authService.verifyOtp({
                email: normalizedEmail,
                otp: normalizedOtp,
            });
            if (!response.responseData?.accessToken) {
                throw new Error(response.message || "Không thể xác thực OTP.");
            }
            setAuthSession(response.responseData);
            setStep("reset");
            toast.success("Xác thực thành công", "Bạn có thể đặt mật khẩu mới ngay bây giờ.");
        } catch (error) {
            const message = error instanceof Error ? error.message : "OTP không hợp lệ.";
            toast.error("Xác thực OTP thất bại", message);
        } finally {
            setIsPending(false);
        }
    };

    const handleResetPassword = async () => {
        const normalizedPassword = password.trim();
        if (normalizedPassword.length < 8) {
            toast.error("Mật khẩu chưa hợp lệ", "Mật khẩu cần tối thiểu 8 ký tự.");
            return;
        }

        if (normalizedPassword !== confirmPassword.trim()) {
            toast.error("Xác nhận mật khẩu không khớp", "Vui lòng nhập lại mật khẩu xác nhận.");
            return;
        }

        setIsPending(true);
        try {
            await authService.updatePassword({ password: normalizedPassword });
            clearAuthSession();
            setStep("done");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Không thể cập nhật mật khẩu.";
            toast.error("Đổi mật khẩu thất bại", message);
        } finally {
            setIsPending(false);
        }
    };

    const goToLogin = () => {
        router.replace("/auth/login");
    };

    const activeStepIndex = FORGOT_PASSWORD_STEPS.indexOf(
        step as (typeof FORGOT_PASSWORD_STEPS)[number],
    );

    return {
        step,
        email,
        setEmail,
        otp,
        setOtp,
        password,
        setPassword,
        confirmPassword,
        setConfirmPassword,
        showPw,
        setShowPw,
        showConfirm,
        setShowConfirm,
        isPending,
        countdown,
        activeStepIndex,
        handleRequestOtp,
        handleResendOtp,
        handleVerifyOtp,
        handleResetPassword,
        goToLogin,
    };
}
