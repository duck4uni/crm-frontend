import type { FormEvent } from "react";

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

export const LOGIN_REDIRECT_DELAY_MS = 900;
