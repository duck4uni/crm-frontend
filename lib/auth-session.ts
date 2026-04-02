import { AuthTokenResponse, MyInfoResponseData } from "@/types/api";

export const ACCESS_TOKEN_STORAGE_KEY = "crm_access_token";
export const REFRESH_TOKEN_STORAGE_KEY = "crm_refresh_token";
export const TOKEN_EXPIRES_IN_STORAGE_KEY = "crm_token_expires_in";
export const CURRENT_USER_STORAGE_KEY = "crm_current_user";

function isBrowser(): boolean {
    return typeof window !== "undefined";
}

export function getAccessToken(): string | null {
    if (!isBrowser()) {
        return null;
    }

    return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
}

export function getRefreshToken(): string | null {
    if (!isBrowser()) {
        return null;
    }

    return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
}

export function setAuthSession(tokens: AuthTokenResponse): void {
    if (!isBrowser()) {
        return;
    }

    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, tokens.refreshToken);
    localStorage.setItem(TOKEN_EXPIRES_IN_STORAGE_KEY, tokens.expiresIn);
}

export function setAccessTokenSession(accessToken: string, expiresIn: string): void {
    if (!isBrowser()) {
        return;
    }

    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
    localStorage.setItem(TOKEN_EXPIRES_IN_STORAGE_KEY, expiresIn);
}

export function setCurrentUserSession(user: MyInfoResponseData): void {
    if (!isBrowser()) {
        return;
    }

    localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user));
}

export function getCurrentUserSession(): MyInfoResponseData | null {
    if (!isBrowser()) {
        return null;
    }

    const currentUser = localStorage.getItem(CURRENT_USER_STORAGE_KEY);

    if (!currentUser) {
        return null;
    }

    try {
        return JSON.parse(currentUser) as MyInfoResponseData;
    } catch {
        localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
        return null;
    }
}

export function clearAuthSession(): void {
    if (!isBrowser()) {
        return;
    }

    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    localStorage.removeItem(TOKEN_EXPIRES_IN_STORAGE_KEY);
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
}

export function hasAuthSession(): boolean {
    return Boolean(getAccessToken());
}
