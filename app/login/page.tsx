"use client";

import { ToastProvider } from "@/components/ui/ToastProvider";
import { LoginFormView } from "./LoginFormView";
import { useLoginForm } from "./useLoginForm";

function LoginPageContent() {
    const loginFormBindings = useLoginForm();
    return <LoginFormView {...loginFormBindings} />;
}

export default function LoginPage() {
    return (
        <ToastProvider>
            <LoginPageContent />
        </ToastProvider>
    );
}
