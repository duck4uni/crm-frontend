"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";
import {
    hasAuthSession,
    setAuthSession,
    setCurrentUserSession,
} from "@/lib/auth-session";
import { authService } from "@/services/auth";
import { usersService } from "@/services/users";

export type LoginFormState = {
    identifier: string;
    password: string;
};

export interface LoginFormBindings {
    form: LoginFormState;
    errors: Partial<LoginFormState>;
    isPending: boolean;
    isRedirecting: boolean;
    canSubmit: boolean;
    handleInputChange: (key: keyof LoginFormState, value: string) => void;
    handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}

const LOGIN_REDIRECT_DELAY_MS = 900;

export function useLoginForm(): LoginFormBindings {
    const router = useRouter();
    const toast = useToast();
    const [form, setForm] = useState<LoginFormState>({
        identifier: "",
        password: "",
    });
    const [errors, setErrors] = useState<Partial<LoginFormState>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);

    useEffect(() => {
        if (hasAuthSession()) {
            router.replace("/");
        }

        router.prefetch("/");
    }, [router]);

    const canSubmit = useMemo(() => {
        return form.identifier.trim().length > 0 && form.password.trim().length > 0;
    }, [form.identifier, form.password]);

    const handleInputChange = (key: keyof LoginFormState, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        if (errors[key]) {
            setErrors((prev) => ({ ...prev, [key]: undefined }));
        }
    };

    const validateForm = (): boolean => {
        const nextErrors: Partial<LoginFormState> = {};

        if (!form.identifier.trim()) {
            nextErrors.identifier = "Vui lòng nhập email, số điện thoại hoặc tên Zalo";
        }

        if (!form.password.trim()) {
            nextErrors.password = "Vui lòng nhập mật khẩu";
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setIsRedirecting(false);

        try {
            const response = await authService.login({
                identifier: form.identifier.trim(),
                password: form.password,
            });

            if (!response.responseData?.accessToken) {
                throw new Error(response.message || "Đăng nhập thất bại");
            }

            setAuthSession(response.responseData);

            try {
                const myInfoResponse = await usersService.getMyInfo();

                if (myInfoResponse.responseData) {
                    setCurrentUserSession(myInfoResponse.responseData);
                }
            } catch (profileError) {
                console.error("Load current user profile failed:", profileError);
            }

            toast.success("Đăng nhập thành công", response.message_en || response.message);
            setIsSubmitting(false);
            setIsRedirecting(true);

            await new Promise<void>((resolve) => {
                window.setTimeout(() => resolve(), LOGIN_REDIRECT_DELAY_MS);
            });

            router.replace("/");
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Không thể đăng nhập. Vui lòng thử lại.";
            toast.error("Đăng nhập thất bại", message);
            setIsSubmitting(false);
            setIsRedirecting(false);
        }
    };

    return {
        form,
        errors,
        isPending: isSubmitting || isRedirecting,
        isRedirecting,
        canSubmit,
        handleInputChange,
        handleSubmit,
    };
}
