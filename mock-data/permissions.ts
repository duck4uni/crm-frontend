import { Permission, PermissionGroup, UserPermission } from "@/types/permission";

export const mockPermissions: Permission[] = [
    // User permissions
    {
        id: "p1",
        name: "Xem danh sách người dùng",
        code: "user_view",
        description: "Cho phép xem danh sách và thông tin người dùng",
        group_code: PermissionGroup.USER,
    },
    {
        id: "p2",
        name: "Tạo người dùng",
        code: "user_create",
        description: "Cho phép tạo tài khoản người dùng mới",
        group_code: PermissionGroup.USER,
    },
    {
        id: "p3",
        name: "Chỉnh sửa người dùng",
        code: "user_edit",
        description: "Cho phép chỉnh sửa thông tin người dùng",
        group_code: PermissionGroup.USER,
    },
    {
        id: "p4",
        name: "Xóa người dùng",
        code: "user_delete",
        description: "Cho phép xóa tài khoản người dùng",
        group_code: PermissionGroup.USER,
    },
    // Customer permissions
    {
        id: "p5",
        name: "Xem khách hàng",
        code: "customer_view",
        description: "Cho phép xem danh sách và thông tin khách hàng",
        group_code: PermissionGroup.CUSTOMER,
    },
    {
        id: "p6",
        name: "Tạo khách hàng",
        code: "customer_create",
        description: "Cho phép tạo khách hàng mới",
        group_code: PermissionGroup.CUSTOMER,
    },
    {
        id: "p7",
        name: "Chỉnh sửa khách hàng",
        code: "customer_edit",
        description: "Cho phép chỉnh sửa thông tin khách hàng",
        group_code: PermissionGroup.CUSTOMER,
    },
    {
        id: "p8",
        name: "Xóa khách hàng",
        code: "customer_delete",
        description: "Cho phép xóa khách hàng",
        group_code: PermissionGroup.CUSTOMER,
    },
    // Deal permissions
    {
        id: "p9",
        name: "Xem thương vụ",
        code: "deal_view",
        description: "Cho phép xem danh sách và chi tiết thương vụ",
        group_code: PermissionGroup.DEAL,
    },
    {
        id: "p10",
        name: "Tạo thương vụ",
        code: "deal_create",
        description: "Cho phép tạo thương vụ mới",
        group_code: PermissionGroup.DEAL,
    },
    {
        id: "p11",
        name: "Chỉnh sửa thương vụ",
        code: "deal_edit",
        description: "Cho phép chỉnh sửa thông tin thương vụ",
        group_code: PermissionGroup.DEAL,
    },
    {
        id: "p12",
        name: "Xóa thương vụ",
        code: "deal_delete",
        description: "Cho phép xóa thương vụ",
        group_code: PermissionGroup.DEAL,
    },
    // Task permissions
    {
        id: "p13",
        name: "Xem công việc",
        code: "task_view",
        description: "Cho phép xem danh sách và chi tiết công việc",
        group_code: PermissionGroup.TASK,
    },
    {
        id: "p14",
        name: "Tạo công việc",
        code: "task_create",
        description: "Cho phép tạo công việc mới",
        group_code: PermissionGroup.TASK,
    },
    {
        id: "p15",
        name: "Chỉnh sửa công việc",
        code: "task_edit",
        description: "Cho phép chỉnh sửa công việc",
        group_code: PermissionGroup.TASK,
    },
    // Report permissions
    {
        id: "p16",
        name: "Xem báo cáo",
        code: "report_view",
        description: "Cho phép xem báo cáo tổng hợp",
        group_code: PermissionGroup.REPORT,
    },
    {
        id: "p17",
        name: "Xuất báo cáo",
        code: "report_export",
        description: "Cho phép xuất báo cáo ra file",
        group_code: PermissionGroup.REPORT,
    },
    // Setting permissions
    {
        id: "p18",
        name: "Quản lý cài đặt",
        code: "setting_manage",
        description: "Cho phép quản lý cài đặt hệ thống",
        group_code: PermissionGroup.SETTING,
    },
];

export const mockUserPermissions: UserPermission[] = [
    // Admin (u1) - all permissions
    ...mockPermissions.map((p, i) => ({
        id: `up${i + 1}`,
        user_id: "u1",
        permision_id: p.id,
        updated_at: new Date("2024-01-01"),
    })),
    // Sales01 (u2) - customer + deal views
    { id: "up20", user_id: "u2", permision_id: "p5", updated_at: new Date("2024-01-10") },
    { id: "up21", user_id: "u2", permision_id: "p6", updated_at: new Date("2024-01-10") },
    { id: "up22", user_id: "u2", permision_id: "p7", updated_at: new Date("2024-01-10") },
    { id: "up23", user_id: "u2", permision_id: "p9", updated_at: new Date("2024-01-10") },
    { id: "up24", user_id: "u2", permision_id: "p10", updated_at: new Date("2024-01-10") },
    { id: "up25", user_id: "u2", permision_id: "p13", updated_at: new Date("2024-01-10") },
    { id: "up26", user_id: "u2", permision_id: "p14", updated_at: new Date("2024-01-10") },
    // Manager (u3) - customer + deal + report + user view
    { id: "up30", user_id: "u3", permision_id: "p1", updated_at: new Date("2024-01-05") },
    { id: "up31", user_id: "u3", permision_id: "p5", updated_at: new Date("2024-01-05") },
    { id: "up32", user_id: "u3", permision_id: "p6", updated_at: new Date("2024-01-05") },
    { id: "up33", user_id: "u3", permision_id: "p7", updated_at: new Date("2024-01-05") },
    { id: "up34", user_id: "u3", permision_id: "p8", updated_at: new Date("2024-01-05") },
    { id: "up35", user_id: "u3", permision_id: "p9", updated_at: new Date("2024-01-05") },
    { id: "up36", user_id: "u3", permision_id: "p10", updated_at: new Date("2024-01-05") },
    { id: "up37", user_id: "u3", permision_id: "p11", updated_at: new Date("2024-01-05") },
    { id: "up38", user_id: "u3", permision_id: "p16", updated_at: new Date("2024-01-05") },
    { id: "up39", user_id: "u3", permision_id: "p17", updated_at: new Date("2024-01-05") },
];
