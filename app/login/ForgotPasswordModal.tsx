"use client";

import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/ToastProvider";
import { authService } from "@/services/auth";
import { clearAuthSession, setAuthSession } from "@/lib/auth-session";

type ForgotStep = "request" | "verify" | "reset";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const toast = useToast();
  const [step, setStep] = useState<ForgotStep>("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setStep("request");
      setEmail("");
      setOtp("");
      setPassword("");
      setConfirmPassword("");
      setIsPending(false);
    }
  }, [isOpen]);

  const modalTitle = useMemo(() => {
    if (step === "request") return "Quên mật khẩu";
    if (step === "verify") return "Xác thực OTP";
    return "Đặt mật khẩu mới";
  }, [step]);

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

    if (!isValidEmail(normalizedEmail)) {
      toast.error("Email không hợp lệ", "Vui lòng nhập đúng định dạng email.");
      return;
    }

    setIsPending(true);
    try {
      await authService.resendOtp({ email: normalizedEmail });
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

    if (!isValidEmail(normalizedEmail)) {
      toast.error("Email không hợp lệ", "Vui lòng nhập đúng định dạng email.");
      return;
    }

    if (!normalizedOtp) {
      toast.error("Thiếu OTP", "Vui lòng nhập mã OTP.");
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
    const normalizedConfirmPassword = confirmPassword.trim();

    if (normalizedPassword.length < 8) {
      toast.error("Mật khẩu chưa hợp lệ", "Mật khẩu cần tối thiểu 8 ký tự.");
      return;
    }

    if (normalizedPassword !== normalizedConfirmPassword) {
      toast.error("Xác nhận mật khẩu không khớp", "Vui lòng nhập lại mật khẩu xác nhận.");
      return;
    }

    setIsPending(true);
    try {
      await authService.updatePassword({ password: normalizedPassword });
      clearAuthSession();
      toast.success("Đổi mật khẩu thành công", "Bạn có thể đăng nhập lại bằng mật khẩu mới.");
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể cập nhật mật khẩu.";
      toast.error("Đổi mật khẩu thất bại", message);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Đóng
          </Button>
          {step === "request" ? (
            <Button variant="primary" onClick={handleRequestOtp} disabled={isPending}>
              {isPending ? <Spinner size="sm" className="mr-2" /> : null}
              Gửi OTP
            </Button>
          ) : null}
          {step === "verify" ? (
            <Button variant="primary" onClick={handleVerifyOtp} disabled={isPending}>
              {isPending ? <Spinner size="sm" className="mr-2" /> : null}
              Xác thực OTP
            </Button>
          ) : null}
          {step === "reset" ? (
            <Button variant="primary" onClick={handleResetPassword} disabled={isPending}>
              {isPending ? <Spinner size="sm" className="mr-2" /> : null}
              Cập nhật mật khẩu
            </Button>
          ) : null}
        </>
      }
    >
      <div className="space-y-4">
        {step === "request" ? (
          <>
            <p className="text-sm text-gray-600">
              Nhập email đã đăng ký để nhận mã OTP đặt lại mật khẩu.
            </p>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="example@domain.com"
              disabled={isPending}
            />
          </>
        ) : null}

        {step === "verify" ? (
          <>
            <p className="text-sm text-gray-600">
              Nhập mã OTP đã gửi tới email của bạn.
            </p>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="example@domain.com"
              disabled={isPending}
            />
            <Input
              label="Mã OTP"
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
              placeholder="Nhập mã OTP"
              disabled={isPending}
            />
            <div className="flex justify-end">
              <Button variant="ghost" onClick={handleResendOtp} disabled={isPending}>
                Gửi lại OTP
              </Button>
            </div>
          </>
        ) : null}

        {step === "reset" ? (
          <>
            <p className="text-sm text-gray-600">
              OTP đã xác thực thành công. Nhập mật khẩu mới của bạn.
            </p>
            <Input
              label="Mật khẩu mới"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Tối thiểu 8 ký tự"
              disabled={isPending}
            />
            <Input
              label="Xác nhận mật khẩu mới"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Nhập lại mật khẩu mới"
              disabled={isPending}
            />
          </>
        ) : null}
      </div>
    </Modal>
  );
}
