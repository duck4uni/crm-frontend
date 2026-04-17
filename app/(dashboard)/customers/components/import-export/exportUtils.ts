import { Customer } from "@/types/customer";

export function exportToCSV(customers: Customer[], filename: string = "khach-hang") {
    const headers = [
        "Mã KH",
        "Tên khách hàng",
        "Số điện thoại",
        "Di động",
        "Email",
        "Địa chỉ",
        "Công ty",
        "Người phụ trách",
        "Trạng thái",
        "Ngày tạo",
        "Ghi chú",
    ];

    const rows = customers.map((customer) => [
        customer.id,
        customer.customerName,
        customer.phone,
        customer.mobilePhone,
        "",
        customer.address || "",
        "",
        customer.assignee,
        translateStatus(customer.status),
        new Date(customer.createdDate).toLocaleDateString("vi-VN"),
        "",
    ]);

    const csvContent = [
        headers.join(","),
        ...rows.map((row) =>
            row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
        ),
    ].join("\n");

    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });

    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().split("T")[0];

    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${timestamp}.csv`);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export function exportToExcel(customers: Customer[], filename: string = "khach-hang") {
    exportToCSV(customers, filename);
}

function translateStatus(status: string): string {
    const statusMap: Record<string, string> = {
        new: "Mới",
        contacted: "Đã liên hệ",
        qualified: "Tiềm năng",
        needs_analysis: "Phân tích",
        negotiating: "Thương lượng",
        won: "Thành công",
        lost: "Thất bại",
    };

    return statusMap[status] || status;
}
