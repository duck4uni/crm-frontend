"use client";

import { FormEvent, useEffect, useMemo, useState, useTransition } from "react";
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
    canSubmit: boolean;
    handleInputChange: (key: keyof LoginFormState, value: string) => void;
    handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function useLoginForm(): LoginFormBindings {
    const router = useRouter();
    const toast = useToast();
    const [isPending, startTransition] = useTransition();
    const [form, setForm] = useState<LoginFormState>({
        identifier: "",
        password: "",
    });
    const [errors, setErrors] = useState<Partial<LoginFormState>>({});

    useEffect(() => {
        if (hasAuthSession()) {
            router.replace("/");
        }
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

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        startTransition(async () => {
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
                router.replace("/");
            } catch (error) {
                const message =
                    error instanceof Error ? error.message : "Không thể đăng nhập. Vui lòng thử lại.";
                toast.error("Đăng nhập thất bại", message);
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
