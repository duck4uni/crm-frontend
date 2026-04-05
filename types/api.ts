import { Contact, Company, Deal, Task } from "./index";

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FilterParams {
  search?: string;
  status?: string;
  tags?: string[];
  dateFrom?: Date;
  dateTo?: Date;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export type ApiResponse<T> =
  | {
    success: true;
    data: T;
  }
  | {
    success: false;
    error: string;
    message: string;
  };

export interface ContactsFilters
  extends FilterParams, SortParams, PaginationParams {
  companyId?: string;
}

export interface CompaniesFilters
  extends FilterParams, SortParams, PaginationParams {
  industry?: string;
  size?: string;
}

export interface DealsFilters
  extends FilterParams, SortParams, PaginationParams {
  stage?: string;
  ownerId?: string;
  minValue?: number;
  maxValue?: number;
}

export interface TasksFilters
  extends FilterParams, SortParams, PaginationParams {
  assignedTo?: string;
  priority?: string;
  relatedToType?: string;
  relatedToId?: string;
}

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface UpdatePasswordPayload {
  password: string;
}

export interface AuthTokenResponse {
  accessToken: string;
  expiresIn: string;
  refreshToken: string;
}

export interface RefreshAccessTokenPayload {
  refreshToken: string;
}

export interface RefreshAccessTokenData {
  accessToken: string;
  expiresIn: string;
}

export interface RegisterPayload {
  full_name: string;
  email: string;
  phone: string;
  password: string;
}

export interface RegisterUserResponse {
  id: string;
  is_active: boolean;
  is_delete: boolean;
  full_name: string;
  email: string;
  phone: string;
  created_at: string | null;
  created_by: string | null;
  updated_at: string | null;
  updated_by: string | null;
  avatar: string | null;
  birthday: string | null;
}

export interface MyInfoResponseData {
  id: string;
  email: string;
  created_at: string | null;
  created_by: string | null;
  updated_at: string | null;
  updated_by: string | null;
  full_name: string;
  phone: string;
  avatar: string | null;
  is_active: boolean;
  birthday: string | null;
  is_delete: boolean;
}

export interface NotificationApiRow {
  id: string;
  title: string;
  content: string;
  category: string;
  sub_category: string | null;
  belongs_to_user_id: string;
  has_user_read: boolean;
  sent_time: string | null;
  has_noti_sent: boolean;
  expired_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface NotificationsResponseData {
  count: number;
  rows: NotificationApiRow[];
  totalPages: number;
  currentPage: number;
}

export interface ApiEnvelope<T> {
  message: string;
  message_en: string;
  responseData: T;
  status: string;
  timeStamp: string;
  violations: Record<string, string[]> | null;
}

export type LoginResponse = ApiEnvelope<AuthTokenResponse>;
export type RegisterResponse = ApiEnvelope<RegisterUserResponse>;
export type LogoutResponse = ApiEnvelope<number>;
export type RefreshAccessTokenResponse = ApiEnvelope<RefreshAccessTokenData>;
export type GetMyInfoResponse = ApiEnvelope<MyInfoResponseData>;
export type UpdatePasswordResponse = ApiEnvelope<Record<string, never>>;
export type GetNotificationsResponse = ApiEnvelope<NotificationsResponseData>;
export type MarkAllNotificationsAsReadResponse = ApiEnvelope<number[]>;
export type MarkNotificationAsReadResponse = ApiEnvelope<NotificationApiRow>;
