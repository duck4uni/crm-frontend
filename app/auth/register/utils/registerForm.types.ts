import type { FormEvent } from "react";

export type RegisterFormState = {
    full_name: string;
    email: string;
    phone: string;
    password: string;
};

export interface RegisterFormBindings {
    form: RegisterFormState;
    errors: Partial<RegisterFormState>;
    isPending: boolean;
    canSubmit: boolean;
    handleInputChange: (key: keyof RegisterFormState, value: string) => void;
    handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
}
