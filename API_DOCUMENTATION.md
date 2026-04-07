# CRM Backend — Tài liệu API

> Base URL: `/api/v1.0`  
> Framework: Express + `express-automatic-routes` (file path = API route)  
> Authentication: JWT Bearer Token (`Authorization: Bearer <accessToken>`)

---

## Cấu trúc Response chung

Mọi API đều trả về theo định dạng sau:

```json
{
  "message": "string (tiếng Việt)",
  "message_en": "string (tiếng Anh)",
  "responseData": "any | null",
  "status": "success | fail",
  "timeStamp": "YYYY-MM-DD HH:mm:ss",
  "violations": "array | null"
}
```

**HTTP Status codes thường gặp:**
- `200` — Thành công
- `201` — Tạo mới thành công
- `400` — Bad request / validation error
- `401` — Unauthorized
- `403` — Forbidden / sai thông tin đăng nhập
- `500` — Server error

---

## Mục lục

1. [Auth](#1-auth)
2. [Users](#2-users)
3. [Tags](#3-tags)
4. [User Tags](#4-user-tags-user_tags)
5. [Permissions](#5-permissions-permisions)
6. [Notifications](#6-notifications)
7. [Jobs](#7-jobs-job)
8. [User History](#8-user-history-user_history)
9. [Files](#9-files)
10. [Logs](#10-logs)

---

## 1. Auth

### `POST /api/v1.0/auth/login`

Đăng nhập, trả về access token + refresh token.

**Request Body:**
```json
{
  "identifier": "string (email / phone / zalo name)",
  "password": "string"
}
```

**Response `200`:**
```json
{
  "responseData": {
    "accessToken": "string",
    "refreshToken": "string",
    "expiresIn": "string"
  }
}
```

**Lỗi:**
- `400` — Thiếu `identifier`
- `403` — Thông tin đăng nhập hoặc mật khẩu không đúng

---

### `POST /api/v1.0/auth/register`

Đăng ký tài khoản mới. Gửi email kèm mã OTP xác thực.

**Request Body:**
```json
{
  "email": "string (required)",
  "full_name": "string",
  "phone": "string",
  "avatar": "string (URL)",
  "birthday": "date",
  "password": "string (required)"
}
```

**Response `201`:**
```json
{
  "responseData": {
    "id": "uuid",
    "email": "string",
    "full_name": "string",
    "phone": "string",
    "is_active": "boolean",
    "created_at": "datetime"
  },
  "message": "Tạo tài khoản thành công"
}
```

**Lỗi:**
- `403` — Email đã được đăng ký

---

### `POST /api/v1.0/auth/verifyOTP`

Xác thực OTP sau đăng ký hoặc quên mật khẩu. Trả về session mới.

**Request Body:**
```json
{
  "email": "string",
  "otp": "string (6 chữ số)"
}
```

**Response `200`:**
```json
{
  "responseData": {
    "accessToken": "string",
    "refreshToken": "string",
    "expiresIn": "string"
  },
  "message": "Xác thực OTP thành công"
}
```

**Lỗi:**
- `400` — OTP không đúng

---

### `POST /api/v1.0/auth/resendOTP`

Gửi lại email chứa mã OTP.

**Request Body:**
```json
{
  "email": "string"
}
```

**Response `200`:**
```json
{
  "responseData": null,
  "message": "Đã gửi yêu cầu gửi email thành công"
}
```

---

### `POST /api/v1.0/auth/forgotPassword`

Gửi email reset mật khẩu (chứa OTP mới).

**Request Body:**
```json
{
  "email": "string"
}
```

**Response `200`:**
```json
{
  "responseData": {},
  "message": "Gửi email reset mật khẩu thành công"
}
```

**Lỗi:**
- `401` — Tài khoản không tồn tại

---

### `PUT /api/v1.0/auth/updatePassword` 🔒

Cập nhật mật khẩu (yêu cầu đăng nhập).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "password": "string (mật khẩu mới)"
}
```

**Response `200`:**
```json
{
  "responseData": {},
  "message": "Thay đổi mật khẩu thành công"
}
```

---

### `POST /api/v1.0/auth/genNewAccessToken`

Làm mới access token bằng refresh token.

**Request Body:**
```json
{
  "refreshToken": "string"
}
```

**Response `200`:**
```json
{
  "responseData": {
    "accessToken": "string",
    "expiresIn": "string"
  }
}
```

---

### `DELETE /api/v1.0/auth/logout` 🔒

Đăng xuất, xóa session hiện tại.

**Headers:** `Authorization: Bearer <token>`

**Response `200`:**
```json
{
  "responseData": null | object
}
```

---

## 2. Users

### `GET /api/v1.0/users`

Lấy danh sách tất cả users (có pagination).

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `currentPage` | string | Trang hiện tại (default: 1) |
| `pageSize` | string | Số item mỗi trang |
| `filters` | string | Bộ lọc (Sequelize filter syntax) |
| `sortField` | string | Tên field để sort |
| `sortOrder` | string | `ASC` hoặc `DESC` |

**Response `200`:**
```json
{
  "responseData": {
    "count": "number",
    "rows": [
      {
        "id": "uuid",
        "email": "string",
        "full_name": "string",
        "phone": "string",
        "avatar": "string",
        "is_active": "boolean",
        "birthday": "date",
        "created_at": "datetime",
        "tags": ["string"]
      }
    ],
    "totalPages": "number",
    "currentPage": "number"
  }
}
```

---

### `POST /api/v1.0/users` 🔒

Tạo nhiều users cùng lúc (bulk create).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
[
  {
    "email": "string (required)",
    "full_name": "string",
    "phone": "string",
    "avatar": "string",
    "birthday": "date",
    "is_active": "boolean"
  }
]
```

**Response `200`:**
```json
{
  "responseData": [
    {
      "id": "uuid",
      "email": "string",
      "full_name": "string"
    }
  ]
}
```

---

### `GET /api/v1.0/users/:id` 🔒

Lấy thông tin chi tiết một user theo ID.

**Headers:** `Authorization: Bearer <token>`

**Path Params:** `id` (uuid)

**Response `200`:**
```json
{
  "responseData": {
    "id": "uuid",
    "email": "string",
    "full_name": "string",
    "phone": "string",
    "avatar": "string",
    "is_active": "boolean",
    "birthday": "date",
    "created_at": "datetime",
    "tags": ["string"]
  }
}
```

---

### `PUT /api/v1.0/users/:id` 🔒

Cập nhật thông tin một user.

**Headers:** `Authorization: Bearer <token>`

**Path Params:** `id` (uuid)

**Request Body:**
```json
{
  "email": "string",
  "full_name": "string",
  "phone": "string",
  "avatar": "string",
  "birthday": "date",
  "is_active": "boolean"
}
```

**Response `200`:**
```json
{
  "responseData": { "...updated user object" }
}
```

---

### `DELETE /api/v1.0/users/:id` 🔒

Xóa một user theo ID.

**Headers:** `Authorization: Bearer <token>`

**Path Params:** `id` (uuid)

**Response `200`:**
```json
{
  "responseData": null
}
```

---

### `GET /api/v1.0/users/getMyInfo` 🔒

Lấy thông tin profile của user đang đăng nhập.

**Headers:** `Authorization: Bearer <token>`

**Response `200`:**
```json
{
  "responseData": {
    "id": "uuid",
    "email": "string",
    "full_name": "string",
    "phone": "string",
    "avatar": "string",
    "is_active": "boolean",
    "birthday": "date",
    "created_at": "datetime"
  }
}
```

---

### `GET /api/v1.0/users/customer` 🔒

Lấy danh sách customers (users có permission `SITE_CUSTOMER`), hỗ trợ pagination.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:** (giống `GET /users`)

**Response `200`:**
```json
{
  "responseData": {
    "count": "number",
    "rows": [
      {
        "id": "uuid",
        "email": "string",
        "full_name": "string",
        "phone": "string",
        "tags": ["string"]
      }
    ],
    "totalPages": "number",
    "currentPage": "number"
  }
}
```

---

### `POST /api/v1.0/users/customerCount` 🔒

Đếm số lượng customers theo bộ lọc.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "start_date": "string (ISO date, optional)",
  "end_date": "string (ISO date, optional)",
  "permision_name": "string (optional)",
  "tag_name": "string (optional)"
}
```

**Response `200`:**
```json
{
  "responseData": {
    "count": "number"
  }
}
```

---

### `POST /api/v1.0/users/customerTagStatistic` 🔒

Thống kê customers theo tag.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "start_date": "string (ISO date, optional)",
  "end_date": "string (ISO date, optional)",
  "permision_name": "string (optional)",
  "tag_name": "string (optional)"
}
```

**Response `200`:**
```json
{
  "responseData": [
    {
      "tag_name": "string",
      "count": "number"
    }
  ]
}
```

---

### `POST /api/v1.0/users/export` 🔒

Export danh sách users ra file Excel.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "start_date": "string (ISO date, optional)",
  "end_date": "string (ISO date, optional)",
  "permission_id": "string (optional)"
}
```

**Response `200`:** File `.xlsx` (binary)  
Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`  
Content-Disposition: `attachment; filename="users-<timestamp>.xlsx"`

---

### `POST /api/v1.0/users/import` 🔒

Import danh sách users từ file Excel.

**Headers:** `Authorization: Bearer <token>`  
**Content-Type:** `multipart/form-data`

**Form Data:**
| Field | Type | Required |
|-------|------|----------|
| `file` | file (.xlsx) | Yes |

**Response `200`:**
```json
{
  "responseData": {
    "created": "number",
    "updated": "number",
    "errors": ["string"]
  },
  "message": "Thành công"
}
```

---

### `GET /api/v1.0/users/admin`

Lấy danh sách admin users (pagination).

**Query Parameters:** (giống `GET /users`)

**Response `200`:**
```json
{
  "responseData": {
    "count": "number",
    "rows": [{ "...user object" }],
    "totalPages": "number",
    "currentPage": "number"
  }
}
```

---

### `POST /api/v1.0/users/admin` 🔒

Tạo admin users với permission code chỉ định.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `code` | string | Yes | Permission code (vd: `SITE_ADMIN`) |

**Request Body:**
```json
[
  {
    "email": "string",
    "full_name": "string",
    "phone": "string",
    "password": "string"
  }
]
```

**Response `200`:**
```json
{
  "responseData": [{ "...created user objects" }]
}
```

---

## 3. Tags

### `GET /api/v1.0/tags`

Lấy danh sách tags (pagination, chỉ lấy các tag chưa bị xóa).

**Query Parameters:** `currentPage`, `pageSize`, `filters`, `sortField`, `sortOrder`

**Response `200`:**
```json
{
  "responseData": {
    "count": "number",
    "rows": [
      {
        "id": "uuid",
        "name": "string",
        "is_active": "boolean",
        "is_delete": "boolean",
        "created_at": "datetime",
        "created_by": "uuid"
      }
    ],
    "totalPages": "number",
    "currentPage": "number"
  }
}
```

---

### `POST /api/v1.0/tags` 🔒

Tạo tag mới.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "string (required)"
}
```

**Response `200`:**
```json
{
  "responseData": {
    "id": "uuid",
    "name": "string"
  }
}
```

---

### `GET /api/v1.0/tags/:id` 🔒

Lấy thông tin một tag theo ID.

**Headers:** `Authorization: Bearer <token>`

**Path Params:** `id` (uuid)

**Response `200`:**
```json
{
  "responseData": {
    "id": "uuid",
    "name": "string",
    "is_active": "boolean",
    "created_at": "datetime"
  }
}
```

---

### `PUT /api/v1.0/tags/:id` 🔒

Cập nhật thông tin tag.

**Headers:** `Authorization: Bearer <token>`

**Path Params:** `id` (uuid)

**Request Body:**
```json
{
  "name": "string",
  "is_active": "boolean"
}
```

**Response `200`:**
```json
{
  "responseData": { "...updated tag object" }
}
```

---

### `DELETE /api/v1.0/tags/:id` 🔒

Xóa tag (soft delete: `is_delete = true`).

**Headers:** `Authorization: Bearer <token>`

**Path Params:** `id` (uuid)

**Response `200`:**
```json
{
  "responseData": null
}
```

---

## 4. User Tags (`/user_tags`)

Quản lý mối quan hệ user — tag.

### `GET /api/v1.0/user_tags`

Lấy danh sách user-tag mappings (pagination, chỉ lấy các record chưa xóa).

**Query Parameters:** `currentPage`, `pageSize`, `filters`, `sortField`, `sortOrder`

**Response `200`:**
```json
{
  "responseData": {
    "count": "number",
    "rows": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "tag_id": "uuid",
        "is_active": "boolean",
        "created_at": "datetime"
      }
    ],
    "totalPages": "number",
    "currentPage": "number"
  }
}
```

---

### `POST /api/v1.0/user_tags` 🔒

Gán tags cho users (bulk create).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
[
  {
    "user_id": "uuid (required)",
    "tag_id": "uuid (required)"
  }
]
```

**Response `200`:**
```json
{
  "responseData": [{ "...created user_tag objects" }]
}
```

---

### `GET /api/v1.0/user_tags/:id` 🔒

Lấy chi tiết một user-tag mapping.

**Headers:** `Authorization: Bearer <token>`

**Path Params:** `id` (uuid)

**Response `200`:**
```json
{
  "responseData": {
    "id": "uuid",
    "user_id": "uuid",
    "tag_id": "uuid",
    "is_active": "boolean"
  }
}
```

---

### `PUT /api/v1.0/user_tags/:id` 🔒

Cập nhật user-tag mapping.

**Headers:** `Authorization: Bearer <token>`

**Path Params:** `id` (uuid)

**Request Body:**
```json
{
  "user_id": "uuid",
  "tag_id": "uuid",
  "is_active": "boolean"
}
```

**Response `200`:**
```json
{
  "responseData": { "...updated object" }
}
```

---

### `DELETE /api/v1.0/user_tags/:id` 🔒

Xóa user-tag mapping.

**Headers:** `Authorization: Bearer <token>`

**Path Params:** `id` (uuid)

**Response `200`:**
```json
{
  "responseData": null
}
```

---

## 5. Permissions (`/permisions`)

### `GET /api/v1.0/permisions` 🔒

Lấy danh sách permissions (pagination).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:** `currentPage`, `pageSize`, `filters`, `sortField`, `sortOrder`

**Response `200`:**
```json
{
  "responseData": {
    "count": "number",
    "rows": [
      {
        "id": "uuid",
        "name": "string",
        "code": "string",
        "description": "string",
        "group_code": "string"
      }
    ],
    "totalPages": "number",
    "currentPage": "number"
  }
}
```

---

### `POST /api/v1.0/permisions`

Tạo nhiều permissions cùng lúc (bulk create).

**Request Body:**
```json
[
  {
    "name": "string",
    "code": "string",
    "description": "string",
    "group_code": "string"
  }
]
```

**Response `200`:**
```json
{
  "responseData": [{ "...created permission objects" }]
}
```

---

### `GET /api/v1.0/permisions/:id` 🔒

Lấy chi tiết một permission.

**Headers:** `Authorization: Bearer <token>`

**Path Params:** `id` (uuid)

**Response `200`:**
```json
{
  "responseData": {
    "id": "uuid",
    "name": "string",
    "code": "string",
    "description": "string",
    "group_code": "string"
  }
}
```

---

### `PUT /api/v1.0/permisions/:id` 🔒

Cập nhật thông tin permission.

**Headers:** `Authorization: Bearer <token>`

**Path Params:** `id` (uuid)

**Request Body:**
```json
{
  "name": "string",
  "code": "string",
  "description": "string",
  "group_code": "string"
}
```

**Response `200`:**
```json
{
  "responseData": { "...updated permission object" }
}
```

---

## 6. Notifications

### `GET /api/v1.0/notifications`

Lấy danh sách thông báo (pagination).

**Query Parameters:** `currentPage`, `pageSize`, `filters`, `sortField`, `sortOrder`

**Response `200`:**
```json
{
  "responseData": {
    "count": "number",
    "rows": [
      {
        "id": "uuid",
        "title": "string",
        "content": "string",
        "category": "string",
        "sub_category": "string",
        "belongs_to_user_id": "uuid | null (null = global)",
        "has_user_read": "boolean",
        "has_noti_sent": "boolean",
        "sent_time": "datetime",
        "expired_at": "datetime",
        "created_at": "datetime",
        "created_by": "uuid"
      }
    ],
    "totalPages": "number",
    "currentPage": "number"
  }
}
```

---

### `POST /api/v1.0/notifications` 🔒

Tạo thông báo (bulk). Nếu `belongs_to_user_id = null` → gửi cho tất cả users và push OneSignal segment "All".

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
[
  {
    "title": "string",
    "content": "string",
    "category": "string",
    "sub_category": "string",
    "belongs_to_user_id": "uuid | null",
    "expired_at": "datetime"
  }
]
```

**Response `200`:**
```json
{
  "responseData": [{ "...created notification objects" }]
}
```

---

### `PUT /api/v1.0/notifications/markAsRead`

Đánh dấu đọc nhiều thông báo theo điều kiện lọc.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `filters` | string | Điều kiện lọc (vd: `belongs_to_user_id==123`) |

**Response `200`:**
```json
{
  "responseData": "number (số rows bị ảnh hưởng)",
  "message": "Đã đánh dấu thông báo là đã đọc"
}
```

---

### `PUT /api/v1.0/notifications/markAsRead/:id`

Đánh dấu đọc một thông báo cụ thể theo ID.

**Path Params:** `id` (uuid)

**Response `200`:**
```json
{
  "responseData": { "...updated notification object" }
}
```

---

## 7. Jobs (`/job`)

### `GET /api/v1.0/job`

Lấy danh sách công việc (pagination).

**Query Parameters:** `currentPage`, `pageSize`, `filters`, `sortField`, `sortOrder`

**Response `200`:**
```json
{
  "responseData": {
    "count": "number",
    "rows": [
      {
        "id": "uuid",
        "job_name": "string",
        "job_time": "object (JSONB)",
        "content": "string",
        "performer_uuid": "uuid",
        "customer_uuid": "uuid",
        "status_id": "uuid",
        "created_by": "uuid"
      }
    ],
    "totalPages": "number",
    "currentPage": "number"
  }
}
```

---

### `POST /api/v1.0/job` 🔒

Tạo nhiều công việc cùng lúc (bulk create).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
[
  {
    "job_name": "string (required)",
    "job_time": "object (required)",
    "content": "string (required)",
    "performer_uuid": "uuid",
    "customer_uuid": "uuid",
    "status_id": "uuid"
  }
]
```

**Response `200`:**
```json
{
  "responseData": [{ "...created job objects" }]
}
```

---

### `PUT /api/v1.0/job` 🔒

Cập nhật nhiều công việc theo điều kiện (bulk update).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `filters` | string | Yes | Điều kiện lọc |

**Request Body:**
```json
{
  "job_name": "string",
  "job_time": "object",
  "content": "string",
  "performer_uuid": "uuid",
  "customer_uuid": "uuid",
  "status_id": "uuid"
}
```

**Response `200`:**
```json
{
  "responseData": "number (rows affected)"
}
```

---

### `DELETE /api/v1.0/job` 🔒

Xóa nhiều công việc theo điều kiện (bulk delete).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `filters` | string | Yes | Điều kiện lọc |

**Response `200`:**
```json
{
  "responseData": "number (rows deleted)"
}
```

---

### `GET /api/v1.0/job/:id`

Lấy chi tiết một công việc theo ID.

**Path Params:** `id` (uuid)

**Response `200`:**
```json
{
  "responseData": {
    "id": "uuid",
    "job_name": "string",
    "job_time": "object",
    "content": "string",
    "performer_uuid": "uuid",
    "customer_uuid": "uuid",
    "status_id": "uuid",
    "created_by": "uuid"
  }
}
```

---

### `PUT /api/v1.0/job/:id` 🔒

Cập nhật một công việc theo ID.

**Headers:** `Authorization: Bearer <token>`

**Path Params:** `id` (uuid)

**Request Body:**
```json
{
  "job_name": "string",
  "job_time": "object",
  "content": "string",
  "performer_uuid": "uuid",
  "customer_uuid": "uuid",
  "status_id": "uuid"
}
```

**Response `200`:**
```json
{
  "responseData": { "...updated job object" }
}
```

---

### `DELETE /api/v1.0/job/:id` 🔒

Xóa một công việc theo ID.

**Headers:** `Authorization: Bearer <token>`

**Path Params:** `id` (uuid)

**Response `200`:**
```json
{
  "responseData": null
}
```

---

## 8. User History (`/user_history`)

### `GET /api/v1.0/user_history`

Lấy danh sách lịch sử user (pagination).

**Query Parameters:** `currentPage`, `pageSize`, `filters`, `sortField`, `sortOrder`

**Response `200`:**
```json
{
  "responseData": {
    "count": "number",
    "rows": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "title": "string",
        "note": "string",
        "created_at": "datetime",
        "created_by": "uuid"
      }
    ],
    "totalPages": "number",
    "currentPage": "number"
  }
}
```

---

### `POST /api/v1.0/user_history` 🔒

Tạo nhiều bản ghi lịch sử (bulk create).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
[
  {
    "user_id": "uuid",
    "title": "string",
    "note": "string"
  }
]
```

**Response `200`:**
```json
{
  "responseData": [{ "...created user_history objects" }]
}
```

---

### `PUT /api/v1.0/user_history` 🔒

Cập nhật nhiều bản ghi theo điều kiện (bulk update).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:** `filters` (required)

**Request Body:**
```json
{
  "title": "string",
  "note": "string"
}
```

**Response `200`:**
```json
{
  "responseData": "number (rows affected)"
}
```

---

### `GET /api/v1.0/user_history/:id`

Lấy chi tiết một bản ghi lịch sử.

**Path Params:** `id` (uuid)

**Response `200`:**
```json
{
  "responseData": {
    "id": "uuid",
    "user_id": "uuid",
    "title": "string",
    "note": "string",
    "created_at": "datetime",
    "user": {
      "full_name": "string"
    }
  }
}
```

---

### `PUT /api/v1.0/user_history/:id` 🔒

Cập nhật một bản ghi lịch sử.

**Headers:** `Authorization: Bearer <token>`

**Path Params:** `id` (uuid)

**Request Body:**
```json
{
  "title": "string",
  "note": "string"
}
```

**Response `200`:**
```json
{
  "responseData": { "...updated user_history object" }
}
```

---

### `DELETE /api/v1.0/user_history/:id` 🔒

Xóa một bản ghi lịch sử.

**Headers:** `Authorization: Bearer <token>`

**Path Params:** `id` (uuid)

**Response `200`:**
```json
{
  "responseData": null
}
```

---

## 9. Files

### `GET /api/v1.0/files`

Lấy danh sách tất cả files đã upload, phân loại theo folder (images, videos, files).

**Response `200`:**
```json
{
  "responseData": {
    "images": ["/images/file-xxxx.jpg"],
    "videos": ["/videos/file-xxxx.mp4"],
    "files": ["/files/file-xxxx.pdf"]
  }
}
```

---

### `POST /api/v1.0/files`

Upload file (image/video/file).

**Content-Type:** `multipart/form-data`

**Form Data:**
| Field | Type | Required |
|-------|------|----------|
| `file` | file | Yes |

**Response `200`:**
```json
{
  "responseData": {
    "filePath": "string (relative path)",
    "fileName": "string"
  }
}
```

---

### `DELETE /api/v1.0/files`

Xóa file theo đường dẫn tương đối.

**Request Body:**
```json
{
  "filePath": "string (vd: /images/file-1727360xxxx.jpg)"
}
```

**Response `200`:**
```json
{
  "responseData": null,
  "message": "File deleted"
}
```

**Response `404`:** File không tìm thấy

---

## 10. Logs

### `GET /logs/getAllWithinTimeRange` 🔒

Lấy toàn bộ log files trong khoảng thời gian nhất định.

> ⚠️ Route này nằm ngoài `/api/v1.0/`, trực tiếp tại `/logs/getAllWithinTimeRange`.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
| Param | Type | Format | Description |
|-------|------|--------|-------------|
| `fromDate` | string | `dd-mm-yyyy` | Ngày bắt đầu (default: hôm nay) |
| `toDate` | string | `dd-mm-yyyy` | Ngày kết thúc (default: hôm nay) |

**Response `200`:**
```json
{
  "responseData": {
    "apis": {
      "dd-mm-yyyy": {
        "logFileName": "string (nội dung log)"
      }
    },
    "sourceGroup": {
      "dd-mm-yyyy": {
        "logFileName": "string"
      }
    }
  }
}
```

---

## Models Reference

### User
| Field | Type | Required |
|-------|------|----------|
| `id` | uuid | auto |
| `email` | string | ✅ |
| `full_name` | string | - |
| `phone` | string | - |
| `avatar` | string (URL) | - |
| `birthday` | date | - |
| `is_active` | boolean | - |
| `is_delete` | boolean | - |
| `created_at` | datetime | auto |
| `created_by` | uuid | - |

### Job
| Field | Type | Required |
|-------|------|----------|
| `id` | uuid | auto |
| `job_name` | string | ✅ |
| `job_time` | object (JSONB) | ✅ |
| `content` | text | ✅ |
| `performer_uuid` | uuid (FK → user) | - |
| `customer_uuid` | uuid (FK → user) | - |
| `status_id` | uuid (FK → status) | - |
| `created_by` | uuid (FK → user) | - |

### Notification
| Field | Type | Required |
|-------|------|----------|
| `id` | uuid | auto |
| `title` | string | - |
| `content` | string | - |
| `category` | string | - |
| `sub_category` | string | - |
| `belongs_to_user_id` | uuid (FK → user) | ✅ |
| `has_user_read` | boolean | - |
| `has_noti_sent` | boolean | - |
| `sent_time` | datetime | - |
| `expired_at` | datetime | - |

### Tag
| Field | Type | Required |
|-------|------|----------|
| `id` | uuid | auto |
| `name` | string | ✅ |
| `is_active` | boolean | - |
| `is_delete` | boolean | - |

### UserTag
| Field | Type | Required |
|-------|------|----------|
| `id` | uuid | auto |
| `user_id` | uuid (FK → user) | ✅ |
| `tag_id` | uuid (FK → tag) | ✅ |
| `is_active` | boolean | - |
| `is_delete` | boolean | - |

### Permission
| Field | Type | Required |
|-------|------|----------|
| `id` | uuid | auto |
| `name` | string | - |
| `code` | string | - |
| `description` | string | - |
| `group_code` | string | - |

### UserHistory
| Field | Type | Required |
|-------|------|----------|
| `id` | uuid | auto |
| `user_id` | uuid (FK → user) | - |
| `title` | string | - |
| `note` | string | - |
| `created_at` | datetime | auto |
| `created_by` | uuid | - |
