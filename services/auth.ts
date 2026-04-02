import { apiClient } from "@/lib/api-client";
import {
    LoginPayload,
    LoginResponse,
    LogoutResponse,
    RefreshAccessTokenPayload,
    RefreshAccessTokenResponse,
    RegisterPayload,
    RegisterResponse,
} from "@/types/api";

const AUTH_LOGIN_ENDPOINT = "/api/v1.0/auth/login";
const AUTH_REGISTER_ENDPOINT = "/api/v1.0/auth/register";
const AUTH_LOGOUT_ENDPOINT = "/api/v1.0/auth/logout";
const AUTH_REFRESH_ENDPOINT = "/api/v1.0/auth/genNewAccessToken";

export const authService = {
    async login(payload: LoginPayload): Promise<LoginResponse> {
        return apiClient.post<LoginResponse>(AUTH_LOGIN_ENDPOINT, payload);
    },

    async register(payload: RegisterPayload): Promise<RegisterResponse> {
        return apiClient.post<RegisterResponse>(AUTH_REGISTER_ENDPOINT, payload);
    },

    async logout(): Promise<LogoutResponse> {
        return apiClient.post<LogoutResponse>(AUTH_LOGOUT_ENDPOINT);
    },

    async genNewAccessToken(
        payload: RefreshAccessTokenPayload,
    ): Promise<RefreshAccessTokenResponse> {
        return apiClient.post<RefreshAccessTokenResponse>(AUTH_REFRESH_ENDPOINT, payload);
    },
};
