"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useToast } from "@/components/ui/ToastProvider";
import { customerTagsService } from "@/services/customer-tags";
import { customersService } from "@/services/customers";
import { CreateCustomerPayload } from "@/types/api";
import { Customer } from "@/types/customer";
import { CustomerEditorForm } from "../components/forms/CustomerEditorForm";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function splitCustomerName(fullName: string): { firstName: string; lastName: string } {
  const normalized = normalizeWhitespace(fullName);

  if (!normalized) {
    return { firstName: "Khach", lastName: "Hang" };
  }

  const parts = normalized.split(" ");
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: parts[0] };
  }

  const firstName = parts.pop() || "Khach";
  const lastName = parts.join(" ") || firstName;

  return { firstName, lastName };
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
    return "male";
  }

  if (gender === "Female") {
    return "female";
  }

  return undefined;
}

function mapStatusToIsActive(status?: Customer["status"]): boolean | undefined {
  if (!status) {
    return undefined;
  }

  return status !== "not_contacted";
}

function resolveAssignedUserId(data: Partial<Customer>): string | undefined {
  const assignedUserId =
    typeof data.assigned_user_id === "string" ? data.assigned_user_id.trim() : "";

  if (assignedUserId && UUID_PATTERN.test(assignedUserId)) {
    return assignedUserId;
  }

  const assigneeInput = typeof data.assignee === "string" ? data.assignee.trim() : "";
  if (assigneeInput && UUID_PATTERN.test(assigneeInput)) {
    return assigneeInput;
  }

  return undefined;
}

function mapFormToCreatePayload(data: Partial<Customer>): CreateCustomerPayload {
  const fullName = normalizeWhitespace(data.customerName || "");
  const { firstName, lastName } = splitCustomerName(fullName);

  return {
    first_name: firstName,
    last_name: lastName,
    description: normalizeWhitespace(data.description || "") || `Khach hang ${fullName || "moi"}`,
    type: data.type || "individual",
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
    assigned_user_id: resolveAssignedUserId(data),
    is_active: data.is_active ?? mapStatusToIsActive(data.status),
  };
}

export default function NewCustomerPage() {
  const router = useRouter();
  const toast = useToast();

  const handleSave = async (formData: Partial<Customer>, groupIds: string[]) => {
    const response = await customersService.createCustomer(mapFormToCreatePayload(formData));
    const createdCustomerId = response.responseData?.id;

    if (!createdCustomerId) {
      throw new Error("Không nhận được mã khách hàng sau khi tạo.");
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
