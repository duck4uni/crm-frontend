"use client";

import { ToastProvider } from "@/components/ui/ToastProvider";
import { RegisterFormView } from "./components/RegisterFormView";
import { useRegisterForm } from "./hooks/useRegisterForm";

function RegisterPageContent() {
    const registerFormBindings = useRegisterForm();
    return <RegisterFormView {...registerFormBindings} />;
}

export default function RegisterPage() {
    return (
        <ToastProvider>
            <RegisterPageContent />
        </ToastProvider>
    );
}
