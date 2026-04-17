export type ForgotStep = "request" | "verify" | "reset" | "done";

export const OTP_LENGTH = 6;

export const FORGOT_PASSWORD_STEPS: Array<Exclude<ForgotStep, "done">> = [
    "request",
    "verify",
    "reset",
];
