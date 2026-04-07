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

// ── OTP / Forgot Password ──────────────────────────────────────────
export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface ResendOtpPayload {
  email: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

// ── Paginated list helpers ─────────────────────────────────────────
export interface PaginatedParams {
  currentPage?: string;
  pageSize?: string;
  filters?: string;
  sortField?: string;
  sortOrder?: "ASC" | "DESC";
}

export interface PaginatedRows<T> {
  count: number;
  rows: T[];
  totalPages: number;
  currentPage: number;
}

// ── Users ──────────────────────────────────────────────────────────
export interface UserApiRow {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  avatar: string | null;
  birthday: string | null;
  is_active: boolean;
  is_delete: boolean;
  created_at: string | null;
  created_by: string | null;
  updated_at: string | null;
  updated_by: string | null;
  tags?: string[];
}

export interface CreateUserPayload {
  email: string;
  full_name?: string;
  phone?: string;
  avatar?: string;
  birthday?: string;
  is_active?: boolean;
}

export interface UpdateUserPayload {
  email?: string;
  full_name?: string;
  phone?: string;
  avatar?: string;
  birthday?: string;
  is_active?: boolean;
}

export interface CustomerCountPayload {
  start_date?: string;
  end_date?: string;
  permision_name?: string;
  tag_name?: string;
}

export interface CustomerTagStatItem {
  tag_name: string;
  count: number;
}

export interface ExportUsersPayload {
  start_date?: string;
  end_date?: string;
  permission_id?: string;
}

export interface ImportUsersResult {
  created: number;
  updated: number;
  errors: string[];
}

export interface CreateAdminPayload {
  email: string;
  full_name?: string;
  phone?: string;
  password: string;
}

// ── Tags ───────────────────────────────────────────────────────────
export interface TagApiRow {
  id: string;
  name: string;
  is_active: boolean;
  is_delete: boolean;
  created_at: string | null;
  created_by: string | null;
}

export interface CreateTagPayload {
  name: string;
}

export interface UpdateTagPayload {
  name?: string;
  is_active?: boolean;
}

// ── User Tags ──────────────────────────────────────────────────────
export interface UserTagApiRow {
  id: string;
  user_id: string;
  tag_id: string;
  is_active: boolean;
  is_delete: boolean;
  created_at: string | null;
}

export interface CreateUserTagPayload {
  user_id: string;
  tag_id: string;
}

export interface UpdateUserTagPayload {
  user_id?: string;
  tag_id?: string;
  is_active?: boolean;
}

// ── Permissions ────────────────────────────────────────────────────
export interface PermissionApiRow {
  id: string;
  name: string;
  code: string;
  description: string;
  group_code: string;
}

export interface CreatePermissionPayload {
  name: string;
  code: string;
  description?: string;
  group_code?: string;
}

export interface UpdatePermissionPayload {
  name?: string;
  code?: string;
  description?: string;
  group_code?: string;
}

// ── Jobs ───────────────────────────────────────────────────────────
export interface JobApiRow {
  id: string;
  job_name: string;
  job_time: Record<string, unknown>;
  content: string;
  performer_uuid: string | null;
  customer_uuid: string | null;
  status_id: string | null;
  created_by: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CreateJobPayload {
  job_name: string;
  job_time: Record<string, unknown>;
  content: string;
  performer_uuid?: string;
  customer_uuid?: string;
  status_id?: string;
}

export interface UpdateJobPayload {
  job_name?: string;
  job_time?: Record<string, unknown>;
  content?: string;
  performer_uuid?: string;
  customer_uuid?: string;
  status_id?: string;
}

// ── User History ───────────────────────────────────────────────────
export interface UserHistoryApiRow {
  id: string;
  user_id: string;
  title: string;
  note: string;
  created_at: string | null;
  created_by: string | null;
  user?: { full_name: string };
}

export interface CreateUserHistoryPayload {
  user_id: string;
  title: string;
  note: string;
}

export interface UpdateUserHistoryPayload {
  title?: string;
  note?: string;
}

// ── Files ──────────────────────────────────────────────────────────
export interface FilesListResponse {
  images: string[];
  videos: string[];
  files: string[];
}

export interface FileUploadResponse {
  filePath: string;
  fileName: string;
}

// ── Logs ───────────────────────────────────────────────────────────
export interface LogsResponse {
  apis: Record<string, Record<string, string>>;
  sourceGroup: Record<string, Record<string, string>>;
}

// ── Create Notification ────────────────────────────────────────────
export interface CreateNotificationPayload {
  title: string;
  content: string;
  category?: string;
  sub_category?: string;
  belongs_to_user_id?: string | null;
  expired_at?: string;
}

// ── Response type aliases ──────────────────────────────────────────
export type LoginResponse = ApiEnvelope<AuthTokenResponse>;
export type RegisterResponse = ApiEnvelope<RegisterUserResponse>;
export type VerifyOtpResponse = ApiEnvelope<AuthTokenResponse>;
export type ResendOtpResponse = ApiEnvelope<null>;
export type ForgotPasswordResponse = ApiEnvelope<Record<string, never>>;
export type LogoutResponse = ApiEnvelope<number>;
export type RefreshAccessTokenResponse = ApiEnvelope<RefreshAccessTokenData>;
export type GetMyInfoResponse = ApiEnvelope<MyInfoResponseData>;
export type UpdatePasswordResponse = ApiEnvelope<Record<string, never>>;
export type GetUsersResponse = ApiEnvelope<PaginatedRows<UserApiRow>>;
export type GetUserResponse = ApiEnvelope<UserApiRow>;
export type CreateUsersResponse = ApiEnvelope<UserApiRow[]>;
export type UpdateUserResponse = ApiEnvelope<UserApiRow>;
export type DeleteUserResponse = ApiEnvelope<null>;
export type GetCustomersResponse = ApiEnvelope<PaginatedRows<UserApiRow>>;
export type CustomerCountResponse = ApiEnvelope<{ count: number }>;
export type CustomerTagStatResponse = ApiEnvelope<CustomerTagStatItem[]>;
export type ImportUsersResponse = ApiEnvelope<ImportUsersResult>;
export type GetTagsResponse = ApiEnvelope<PaginatedRows<TagApiRow>>;
export type GetTagResponse = ApiEnvelope<TagApiRow>;
export type CreateTagResponse = ApiEnvelope<TagApiRow>;
export type UpdateTagResponse = ApiEnvelope<TagApiRow>;
export type DeleteTagResponse = ApiEnvelope<null>;
export type GetUserTagsResponse = ApiEnvelope<PaginatedRows<UserTagApiRow>>;
export type GetUserTagResponse = ApiEnvelope<UserTagApiRow>;
export type CreateUserTagsResponse = ApiEnvelope<UserTagApiRow[]>;
export type UpdateUserTagResponse = ApiEnvelope<UserTagApiRow>;
export type DeleteUserTagResponse = ApiEnvelope<null>;
export type GetPermissionsResponse = ApiEnvelope<PaginatedRows<PermissionApiRow>>;
export type GetPermissionResponse = ApiEnvelope<PermissionApiRow>;
export type CreatePermissionsResponse = ApiEnvelope<PermissionApiRow[]>;
export type UpdatePermissionResponse = ApiEnvelope<PermissionApiRow>;
export type GetNotificationsResponse = ApiEnvelope<NotificationsResponseData>;
export type CreateNotificationsResponse = ApiEnvelope<NotificationApiRow[]>;
export type MarkAllNotificationsAsReadResponse = ApiEnvelope<number[]>;
export type MarkNotificationAsReadResponse = ApiEnvelope<NotificationApiRow>;
export type GetJobsResponse = ApiEnvelope<PaginatedRows<JobApiRow>>;
export type GetJobResponse = ApiEnvelope<JobApiRow>;
export type CreateJobsResponse = ApiEnvelope<JobApiRow[]>;
export type UpdateJobResponse = ApiEnvelope<JobApiRow>;
export type DeleteJobResponse = ApiEnvelope<null>;
export type BulkUpdateJobResponse = ApiEnvelope<number>;
export type BulkDeleteJobResponse = ApiEnvelope<number>;
export type GetUserHistoriesResponse = ApiEnvelope<PaginatedRows<UserHistoryApiRow>>;
export type GetUserHistoryResponse = ApiEnvelope<UserHistoryApiRow>;
export type CreateUserHistoriesResponse = ApiEnvelope<UserHistoryApiRow[]>;
export type UpdateUserHistoryResponse = ApiEnvelope<UserHistoryApiRow>;
export type DeleteUserHistoryResponse = ApiEnvelope<null>;
export type BulkUpdateUserHistoryResponse = ApiEnvelope<number>;
export type GetFilesResponse = ApiEnvelope<FilesListResponse>;
export type UploadFileResponse = ApiEnvelope<FileUploadResponse>;
export type DeleteFileResponse = ApiEnvelope<null>;
export type GetLogsResponse = ApiEnvelope<LogsResponse>;
