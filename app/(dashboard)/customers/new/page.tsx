"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useToast } from "@/components/ui/ToastProvider";
import { customerAssignedUsersService } from "@/services/customer-assigned-users";
import { customerTagsService } from "@/services/customer-tags";
import { customersService } from "@/services/customers";
import { CreateCustomerPayload } from "@/types/api";
import { Customer } from "@/types/customer";
import { CustomerEditorForm } from "../components/forms/CustomerEditorForm";

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeLoose(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function mapCustomerTypeToApi(type?: string): string {
  const normalized = normalizeLoose(type || "");

  if (!normalized || normalized === "individual" || normalized === "ca nhan") {
    return "Cá nhân";
  }

  if (normalized === "company" || normalized === "doanh nghiep") {
    return "Doanh nghiệp";
  }

  return (type || "Cá nhân").trim();
}

function formatDateForApi(date?: Date): string | undefined {
  if (!date) return undefined;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function mapCustomerGenderToApi(gender?: Customer["gender"]): string | undefined {
  if (gender === "Male") {
    return "Nam";
  }

  if (gender === "Female") {
    return "Nữ";
  }

  if (gender === "Other") {
    return "Khác";
  }

  return undefined;
}

function mapStatusToIsActive(status?: Customer["status"]): boolean | undefined {
  if (!status) {
    return undefined;
  }

  return status !== "not_contacted";
}

function resolveAssignedUserIds(data: Partial<Customer>): string[] {
  const idsFromField = Array.isArray(data.assigned_user_ids) ? data.assigned_user_ids : [];
  const idsFromUsers = Array.isArray(data.assigned_users)
    ? data.assigned_users.map((user) => user?.id || "")
    : [];
  const singleId = typeof data.assigned_user_id === "string" ? data.assigned_user_id : "";

  return Array.from(
    new Set(
      [...idsFromField, ...idsFromUsers, singleId]
        .map((id) => (typeof id === "string" ? id.trim() : ""))
        .filter(Boolean),
    ),
  );
}

function mapFormToCreatePayload(data: Partial<Customer>): CreateCustomerPayload {
  const firstName = normalizeWhitespace(String(data.first_name || ""));
  const lastName = normalizeWhitespace(String(data.last_name || ""));
  const fullName = normalizeWhitespace(`${lastName} ${firstName}`);

  return {
    first_name: firstName,
    last_name: lastName,
    description: normalizeWhitespace(data.description || "") || `Khach hang ${fullName || "moi"}`,
    type: mapCustomerTypeToApi(data.type),
    email: normalizeWhitespace(data.email || "") || undefined,
    phone: (data.phone || "").trim() || undefined,
    address: normalizeWhitespace(data.address || "") || undefined,
    website: normalizeWhitespace(data.website || "") || undefined,
    gender: mapCustomerGenderToApi(data.gender),
    day_of_birth: formatDateForApi(data.day_of_birth),
    note: normalizeWhitespace(data.note || "") || undefined,
    company_name: data.company_name || undefined,
    company_establish_date: formatDateForApi(data.company_establish_date),
    tax_code: data.tax_code || undefined,
    major: data.major || undefined,
    created_at: new Date().toISOString(),
    is_active: data.is_active ?? mapStatusToIsActive(data.status),
  };
}

export default function NewCustomerPage() {
  const router = useRouter();
  const toast = useToast();

  const handleSave = async (formData: Partial<Customer>, groupIds: string[]) => {
    const assignedUserIds = resolveAssignedUserIds(formData);
    const response = await customersService.createCustomer(mapFormToCreatePayload(formData));
    const createdCustomerId = response.responseData?.id;

    if (!createdCustomerId) {
      throw new Error("Không nhận được mã khách hàng sau khi tạo.");
    }

    await customersService.updateCustomer(createdCustomerId, {
      assigned_user_id: assignedUserIds[0] || null,
    });

    if (assignedUserIds.length > 0) {
      await customerAssignedUsersService.setCustomerAssignedUsers({
        customer_id: createdCustomerId,
        assigned_user_ids: assignedUserIds,
      });
    }

    const normalizedGroupIds = Array.from(new Set(groupIds.filter(Boolean)));
    if (normalizedGroupIds.length > 0) {
      await customerTagsService.createCustomerTags(
        normalizedGroupIds.map((groupId) => ({
          customer_id: createdCustomerId,
          tag_id: groupId,
        })),
      );
    }

    toast.success("Thêm mới thành công", `Khách hàng "${formData.customerName}" đã được tạo.`);
    router.push(`/customers/${createdCustomerId}`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thêm khách hàng mới</h1>
          <p className="text-sm text-gray-500 mt-1">Tạo hồ sơ khách hàng trực tiếp trên trang quản lý.</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/customers")}> 
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại danh sách
        </Button>
      </div>

      <Card>
        <CardContent>
          <CustomerEditorForm
            submitText="Thêm mới"
            onSubmit={handleSave}
            onCancel={() => router.push("/customers")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
