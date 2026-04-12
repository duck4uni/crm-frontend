"use client";

import { ToastProvider } from "@/components/ui/ToastProvider";
import { ForgotPasswordView } from "./ForgotPasswordView";

export default function ForgotPasswordPage() {
    return (
        <ToastProvider>
            <ForgotPasswordView />
        </ToastProvider>
    );
}
