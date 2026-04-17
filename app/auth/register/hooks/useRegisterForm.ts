"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";
import { authService } from "@/services/auth";
import type {
    RegisterFormBindings,
    RegisterFormState,
} from "../utils/registerForm.types";

export function useRegisterForm(): RegisterFormBindings {
    const router = useRouter();
    const toast = useToast();
    const [isPending, startTransition] = useTransition();
    const [form, setForm] = useState<RegisterFormState>({
        full_name: "",
        email: "",
        phone: "",
        password: "",
    });
    const [errors, setErrors] = useState<Partial<RegisterFormState>>({});

    const canSubmit = useMemo(() => {
        return (
            form.full_name.trim().length > 0 &&
            form.email.trim().length > 0 &&
            form.phone.trim().length > 0 &&
            form.password.trim().length > 0
        );
    }, [form.full_name, form.email, form.phone, form.password]);

    const handleInputChange = (key: keyof RegisterFormState, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        if (errors[key]) {
            setErrors((prev) => ({ ...prev, [key]: undefined }));
        }
    };

    const validate = (): boolean => {
        const nextErrors: Partial<RegisterFormState> = {};

        if (!form.full_name.trim()) {
            nextErrors.full_name = "Vui lòng nhập họ và tên";
        }

        if (!form.email.trim()) {
            nextErrors.email = "Vui lòng nhập email";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
            nextErrors.email = "Email không hợp lệ";
        }

        if (!form.phone.trim()) {
            nextErrors.phone = "Vui lòng nhập số điện thoại";
        } else if (!/^[0-9]{10,11}$/.test(form.phone.trim())) {
            nextErrors.phone = "Số điện thoại phải có 10-11 chữ số";
        }

        if (!form.password.trim()) {
            nextErrors.password = "Vui lòng nhập mật khẩu";
        } else if (form.password.trim().length < 8) {
            nextErrors.password = "Mật khẩu tối thiểu 8 ký tự";
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit: RegisterFormBindings["handleSubmit"] = (event) => {
        event.preventDefault();

        if (!validate()) {
            return;
        }

        startTransition(async () => {
            try {
                const response = await authService.register({
                    full_name: form.full_name.trim(),
                    email: form.email.trim(),
                    phone: form.phone.trim(),
                    password: form.password,
                });

                toast.success("Đăng ký thành công", response.message_en || response.message);
                router.replace("/auth/login");
            } catch (error) {
                const message =
                    error instanceof Error ? error.message : "Không thể đăng ký. Vui lòng thử lại.";
                toast.error("Đăng ký thất bại", message);
            }
        });
    };

    return {
        form,
        errors,
        isPending,
        canSubmit,
        handleInputChange,
        handleSubmit,
    };
}
