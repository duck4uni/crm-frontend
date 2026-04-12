"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Mail, KeyRound, Lock, RefreshCw, CheckCircle2, ArrowLeft } from "lucide-react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/ToastProvider";
import { authService } from "@/services/auth";
import { clearAuthSession, setAuthSession } from "@/lib/auth-session";
import { useRouter } from "next/navigation";

type ForgotStep = "request" | "verify" | "reset" | "done";

const OTP_LENGTH = 6;

function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function OtpInput({
    value,
    onChange,
    disabled,
}: {
    value: string;
    onChange: (v: string) => void;
    disabled: boolean;
}) {
    const refs = useRef<(HTMLInputElement | null)[]>([]);
    const digits = value.padEnd(OTP_LENGTH, "").slice(0, OTP_LENGTH).split("");

    const update = (idx: number, char: string) => {
        const next = digits.slice();
        next[idx] = char;
        onChange(next.join("").trimEnd());
    };

    const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace") {
            if (digits[idx]) {
                update(idx, "");
            } else if (idx > 0) {
                refs.current[idx - 1]?.focus();
                update(idx - 1, "");
            }
        } else if (e.key === "ArrowLeft" && idx > 0) {
            refs.current[idx - 1]?.focus();
        } else if (e.key === "ArrowRight" && idx < OTP_LENGTH - 1) {
            refs.current[idx + 1]?.focus();
        }
    };

    const handleChange = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, "");
        if (!val) return;
        if (val.length > 1) {
            const chars = val.slice(0, OTP_LENGTH - idx).split("");
            const next = digits.slice();
            chars.forEach((c, i) => {
                if (idx + i < OTP_LENGTH) next[idx + i] = c;
            });
            onChange(next.join("").trimEnd());
            const focusIdx = Math.min(idx + chars.length, OTP_LENGTH - 1);
            refs.current[focusIdx]?.focus();
            return;
        }
        update(idx, val);
        if (idx < OTP_LENGTH - 1) refs.current[idx + 1]?.focus();
    };

    return (
        <div className="flex items-center justify-center gap-2">
            {Array.from({ length: OTP_LENGTH }).map((_, i) => (
                <input
                    key={i}
                    ref={(el) => {
                        refs.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={OTP_LENGTH}
                    value={digits[i] ?? ""}
                    disabled={disabled}
                    onChange={(e) => handleChange(i, e)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onFocus={(e) => e.target.select()}
                    className="h-12 w-11 rounded-lg border border-gray-200 bg-gray-50 text-center text-lg font-bold text-indigo-700 caret-transparent focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/25 disabled:opacity-50 transition"
                />
            ))}
        </div>
    );
}

const STEPS: ForgotStep[] = ["request", "verify", "reset"];

const stepMeta: Record<ForgotStep, { title: string; sub: string; icon: React.ReactNode }> = {
    request: {
        title: "Quên mật khẩu",
        sub: "Nhập email đã đăng ký để nhận mã OTP xác thực.",
        icon: <Mail className="h-5 w-5 text-indigo-600" />,
    },
    verify: {
        title: "Nhập mã OTP",
        sub: "Kiểm tra email và nhập mã 6 chữ số bên dưới.",
        icon: <KeyRound className="h-5 w-5 text-indigo-600" />,
    },
    reset: {
        title: "Đặt mật khẩu mới",
        sub: "OTP đã xác thực. Nhập mật khẩu mới của bạn.",
        icon: <Lock className="h-5 w-5 text-indigo-600" />,
    },
    done: {
        title: "Hoàn tất",
        sub: "Mật khẩu đã được cập nhật thành công.",
        icon: <CheckCircle2 className="h-5 w-5 text-teal-600" />,
    },
};

export function ForgotPasswordView() {
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
            const response = await authService.verifyOtp({ email: normalizedEmail, otp: normalizedOtp });
            if (!response.responseData?.accessToken) throw new Error(response.message || "Không thể xác thực OTP.");
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

    const meta = stepMeta[step];
    const activeStepIndex = STEPS.indexOf(step as (typeof STEPS)[number]);

    return (
        <div className="relative min-h-screen overflow-hidden bg-indigo-950">
            {/* Background blobs */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-indigo-700/20 blur-3xl" />
                <div className="absolute -bottom-32 -left-32 h-[500px] w-[500px] rounded-full bg-teal-600/15 blur-3xl" />
            </div>

            <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
                <div className="grid w-full items-center gap-12 lg:grid-cols-[1fr_440px]">
                    {/* Hero section */}
                    <section className="hidden lg:flex lg:flex-col">
                        <div>
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-400/30 bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-300">
                                <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
                                Khôi phục tài khoản
                            </span>
                            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-white">
                                Quên mật khẩu?<br />
                                <span className="text-indigo-300">Đừng lo,</span> chúng tôi giúp bạn.
                            </h1>
                            <p className="mt-4 max-w-md text-base leading-relaxed text-indigo-200/70">
                                Chỉ cần nhập email đã đăng ký, chúng tôi sẽ gửi mã OTP để xác thực và bạn có thể đặt mật khẩu mới ngay lập tức.
                            </p>
                        </div>
                        <div className="mt-12 flex flex-col gap-3">
                            {["Bảo mật OTP 6 chữ số qua email", "Mã OTP hết hạn sau 5 phút", "Mật khẩu được mã hóa an toàn"].map((text) => (
                                <div key={text} className="flex items-center gap-3 text-sm text-indigo-200/80">
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-500/20 text-teal-400">
                                        <svg viewBox="0 0 12 12" fill="currentColor" className="h-3 w-3">
                                            <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                    {text}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Form card */}
                    <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-1 shadow-2xl backdrop-blur-xl">
                        <div className="rounded-xl bg-white px-8 py-10">
                            {/* Logo */}
                            <div className="mb-6 flex justify-center">
                                <Image src="/logo.png" alt="CRM Logo" width={130} height={40} className="object-contain" priority />
                            </div>

                            {/* Step indicator */}
                            {step !== "done" && (
                                <div className="mb-6 flex items-center gap-1.5">
                                    {STEPS.map((s, i) => (
                                        <div
                                            key={s}
                                            className={`h-1.5 flex-1 rounded-full transition-colors ${
                                                i < activeStepIndex
                                                    ? "bg-teal-400"
                                                    : i === activeStepIndex
                                                    ? "bg-indigo-600"
                                                    : "bg-gray-200"
                                            }`}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Step header */}
                            <div className="mb-6 flex items-center gap-3">
                                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${step === "done" ? "bg-teal-100" : "bg-indigo-100"}`}>
                                    {meta.icon}
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">{meta.title}</h2>
                                    <p className="text-sm text-gray-500">{meta.sub}</p>
                                </div>
                            </div>

                            {/* Step: request */}
                            {step === "request" && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="email"
                                                placeholder="example@domain.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                disabled={isPending}
                                                autoComplete="email"
                                                onKeyDown={(e) => e.key === "Enter" && handleRequestOtp()}
                                                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60 transition"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleRequestOtp}
                                        disabled={isPending || !email.trim()}
                                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition"
                                    >
                                        {isPending && <Spinner size="sm" className="border-2 border-white/40 border-t-white" />}
                                        Gửi mã OTP
                                    </button>
                                </div>
                            )}

                            {/* Step: verify */}
                            {step === "verify" && (
                                <div className="space-y-5">
                                    <div className="rounded-xl bg-indigo-50 border border-indigo-100 px-4 py-3 text-sm text-indigo-700">
                                        Đã gửi mã OTP tới <span className="font-semibold">{email}</span>
                                    </div>
                                    <div>
                                        <label className="mb-3 block text-center text-sm font-medium text-gray-700">Nhập mã OTP</label>
                                        <OtpInput value={otp} onChange={setOtp} disabled={isPending} />
                                    </div>
                                    <div className="text-center">
                                        {countdown > 0 ? (
                                            <p className="text-sm text-gray-400">
                                                Gửi lại sau <span className="font-semibold text-indigo-600">{countdown}s</span>
                                            </p>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={handleResendOtp}
                                                disabled={isPending}
                                                className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
                                            >
                                                <RefreshCw className="h-3.5 w-3.5" />
                                                Gửi lại OTP
                                            </button>
                                        )}
                                    </div>
                                    <button
                                        onClick={handleVerifyOtp}
                                        disabled={isPending || otp.trim().length < OTP_LENGTH}
                                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition"
                                    >
                                        {isPending && <Spinner size="sm" className="border-2 border-white/40 border-t-white" />}
                                        Xác thực OTP
                                    </button>
                                </div>
                            )}

                            {/* Step: reset */}
                            {step === "reset" && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700">Mật khẩu mới</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type={showPw ? "text" : "password"}
                                                placeholder="Tối thiểu 8 ký tự"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                disabled={isPending}
                                                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-11 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60 transition"
                                            />
                                            <button type="button" onClick={() => setShowPw((p) => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                                                {showPw ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700">Xác nhận mật khẩu mới</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type={showConfirm ? "text" : "password"}
                                                placeholder="Nhập lại mật khẩu mới"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                disabled={isPending}
                                                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-11 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60 transition"
                                            />
                                            <button type="button" onClick={() => setShowConfirm((p) => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                                                {showConfirm ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleResetPassword}
                                        disabled={isPending || !password.trim() || !confirmPassword.trim()}
                                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition"
                                    >
                                        {isPending && <Spinner size="sm" className="border-2 border-white/40 border-t-white" />}
                                        Cập nhật mật khẩu
                                    </button>
                                </div>
                            )}

                            {/* Step: done */}
                            {step === "done" && (
                                <div className="space-y-5 text-center">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-100">
                                        <CheckCircle2 className="h-8 w-8 text-teal-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">Đổi mật khẩu thành công!</p>
                                        <p className="mt-1 text-sm text-gray-500">Bạn có thể đăng nhập lại bằng mật khẩu mới.</p>
                                    </div>
                                    <button
                                        onClick={() => router.replace("/login")}
                                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition"
                                    >
                                        Đăng nhập ngay
                                    </button>
                                </div>
                            )}

                            {/* Back to login */}
                            {step !== "done" && (
                                <div className="mt-6 text-center">
                                    <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600">
                                        <ArrowLeft className="h-3.5 w-3.5" />
                                        Quay lại đăng nhập
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
