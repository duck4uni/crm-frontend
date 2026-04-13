"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, MessageCircle, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { useToast } from "@/components/ui/ToastProvider";
import { formatDateVNDateOnly } from "@/lib/utils";
import { initialConversations } from "@/mock-data/chat";
import { customerTagsService } from "@/services/customer-tags";
import { customersService } from "@/services/customers";
import { tagsService } from "@/services/tags";
import { userHistoryService } from "@/services/user-history";
import { usersService } from "@/services/users";
import { CreateCustomerPayload, CustomerApiRow, UpdateCustomerPayload, UserHistoryApiRow } from "@/types/api";
import { Customer, CustomerStatus } from "@/types/customer";
import { CustomerEditorForm } from "../components/forms/CustomerEditorForm";

type CustomerTab = "detail" | "chat" | "work";

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

function mapApiGenderToCustomer(gender?: string | null): Customer["gender"] {
  const normalized = (gender || "").toLowerCase();

  if (["male", "nam"].includes(normalized)) {
    return "Male";
  }

  if (["female", "nu", "nữ"].includes(normalized)) {
    return "Female";
  }

  return "Other";
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

function mapFormToUpdatePayload(data: Partial<Customer>): UpdateCustomerPayload {
  const fullName = normalizeWhitespace(data.customerName || "");
  const { firstName, lastName } = splitCustomerName(fullName);

  return {
    first_name: firstName,
    last_name: lastName,
    description: normalizeWhitespace(data.description || "") || undefined,
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

function mapApiRowToCustomerDetail(
  row: CustomerApiRow,
  assigneeName: string,
  groupNames: string[],
): Customer {
  const customerName =
    row.full_name || `${row.last_name || ""} ${row.first_name || ""}`.trim() || row.email || "Khach hang";

  return {
    id: row.id,
    orderNumber: 1,
    customerName,
    email: row.email || undefined,
    phone: row.phone || "",
    address: row.address || "",
    salutation: row.gender?.toLowerCase() === "female" ? "Chị" : "Anh",
    mobilePhone: row.phone || "",
    source: row.website || "",
    assignee: assigneeName,
    relationship: row.note || "",
    lastContactDate: row.updated_at ? new Date(row.updated_at) : undefined,
    createdDate: row.created_at ? new Date(row.created_at) : new Date(),
    customerSource: row.type || "",
    gender: mapApiGenderToCustomer(row.gender),
    status: row.is_active === false ? CustomerStatus.NOT_CONTACTED : CustomerStatus.REGISTERED,
    avatar: undefined,
    groups: groupNames,
    first_name: row.first_name,
    last_name: row.last_name,
    full_name: row.full_name || undefined,
    assigned_user_id: row.assigned_user_id || undefined,
    customer_source_id: row.customer_source_id || undefined,
    type: row.type || undefined,
    company_name: row.company_name || undefined,
    company_establish_date: row.company_establish_date ? new Date(row.company_establish_date) : undefined,
    description: row.description || undefined,
    day_of_birth: row.day_of_birth ? new Date(row.day_of_birth) : undefined,
    major: row.major || undefined,
    tax_code: row.tax_code || undefined,
    note: row.note || undefined,
    website: row.website || undefined,
    is_active: row.is_active,
  };
}

export default function CustomerDetailPage() {
  const params = useParams<{ customerId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  const customerId = params.customerId;
  const initialTab = (searchParams.get("tab") as CustomerTab) || "detail";
  const [activeTab, setActiveTab] = useState<CustomerTab>(
    ["detail", "chat", "work"].includes(initialTab) ? initialTab : "detail",
  );
  const [isEditing, setIsEditing] = useState(searchParams.get("mode") === "edit");

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [workHistory, setWorkHistory] = useState<UserHistoryApiRow[]>([]);
  const [isLoadingWorkHistory, setIsLoadingWorkHistory] = useState(false);

  const loadCustomer = useCallback(async () => {
    if (!customerId) {
      return;
    }

    setIsLoading(true);
    try {
      const [customerResponse, tagsResponse, customerTagsResponse] = await Promise.all([
        customersService.getCustomer(customerId),
        tagsService.getTags({ currentPage: "1", pageSize: "5000" }),
        customerTagsService.getCustomerTagsByCustomerId(customerId, {
          currentPage: "1",
          pageSize: "5000",
        }),
      ]);

      const row = customerResponse.responseData;
      if (!row) {
        toast.error("Không tìm thấy khách hàng", "Khách hàng không còn tồn tại.");
        router.push("/customers");
        return;
      }

      const tagNameById = (tagsResponse.responseData?.rows || []).reduce<Record<string, string>>(
        (acc, tag) => {
          acc[tag.id] = tag.name;
          return acc;
        },
        {},
      );

      const groupNames = (customerTagsResponse.responseData?.rows || [])
        .map((link) => tagNameById[link.tag_id])
        .filter((name): name is string => Boolean(name));

      let assigneeName = row.assigned_user_id || "";
      if (row.assigned_user_id && UUID_PATTERN.test(row.assigned_user_id)) {
        try {
          const userResponse = await usersService.getUser(row.assigned_user_id);
          assigneeName = userResponse.responseData?.full_name?.trim() || row.assigned_user_id;
        } catch {
          assigneeName = row.assigned_user_id;
        }
      }

      setCustomer(mapApiRowToCustomerDetail(row, assigneeName, groupNames));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể tải chi tiết khách hàng.";
      toast.error("Tải dữ liệu thất bại", message);
    } finally {
      setIsLoading(false);
    }
  }, [customerId, router, toast]);

  useEffect(() => {
    void loadCustomer();
  }, [loadCustomer]);

  useEffect(() => {
    if (activeTab !== "work" || !customer) {
      return;
    }

    let isDisposed = false;

    const loadWorkHistory = async () => {
      setIsLoadingWorkHistory(true);
      try {
        const response = await userHistoryService.getUserHistories({
          currentPage: "1",
          pageSize: "200",
        });

        if (isDisposed) {
          return;
        }

        const rows = response.responseData?.rows || [];
        const keywords = [
          customer.customerName.toLowerCase(),
          customer.id.toLowerCase(),
          (customer.email || "").toLowerCase(),
          (customer.phone || "").toLowerCase(),
        ].filter(Boolean);

        const filtered = rows
          .filter((item) => {
            const text = `${item.title || ""} ${item.note || ""}`.toLowerCase();
            return keywords.some((keyword) => text.includes(keyword));
          })
          .sort((a, b) => {
            const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
            const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
            return bTime - aTime;
          });

        setWorkHistory(filtered);
      } catch {
        if (!isDisposed) {
          setWorkHistory([]);
        }
      } finally {
        if (!isDisposed) {
          setIsLoadingWorkHistory(false);
        }
      }
    };

    void loadWorkHistory();

    return () => {
      isDisposed = true;
    };
  }, [activeTab, customer]);

  const conversation = useMemo(() => {
    if (!customer) {
      return null;
    }

    const lowerName = customer.customerName.toLowerCase();
    return (
      initialConversations.find(
        (item) => item.phone === customer.phone || item.customerName.toLowerCase().includes(lowerName),
      ) || null
    );
  }, [customer]);

  const tabs = useMemo(
    () => [
      { id: "detail", label: "Chi tiết khách" },
      { id: "chat", label: "Lịch sử chat", badge: conversation?.messages.length || 0 },
      { id: "work", label: "Lịch sử công việc", badge: workHistory.length },
    ],
    [conversation?.messages.length, workHistory.length],
  );

  const handleUpdate = async (formData: Partial<Customer>, groupIds: string[]) => {
    if (!customerId) {
      return;
    }

    try {
      await customersService.updateCustomer(customerId, mapFormToUpdatePayload(formData));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể cập nhật thông tin khách hàng.";
      toast.error("Cập nhật thất bại", message);
      return;
    }

    try {
      const normalizedNextGroupIds = Array.from(new Set(groupIds.filter(Boolean)));
      const existingLinksResponse = await customerTagsService.getCustomerTagsByCustomerId(customerId, {
        currentPage: "1",
        pageSize: "5000",
      });

      const existingLinks = existingLinksResponse.responseData?.rows || [];
      const existingGroupIdSet = new Set(existingLinks.map((link) => link.tag_id));
      const nextGroupIdSet = new Set(normalizedNextGroupIds);

      const groupsToAdd = normalizedNextGroupIds.filter((groupId) => !existingGroupIdSet.has(groupId));
      const linksToDelete = existingLinks.filter((link) => !nextGroupIdSet.has(link.tag_id));

      if (groupsToAdd.length > 0) {
        await customerTagsService.createCustomerTags(
          groupsToAdd.map((groupId) => ({
            customer_id: customerId,
            tag_id: groupId,
          })),
        );
      }

      if (linksToDelete.length > 0) {
        await Promise.all(linksToDelete.map((link) => customerTagsService.deleteCustomerTag(link.id)));
      }
    } catch {
      toast.warning("Đã lưu thông tin", "Cập nhật nhóm khách hàng chưa thành công, vui lòng thử lại.");
    }

    toast.success("Cập nhật thành công", "Thông tin khách hàng đã được lưu.");
    setIsEditing(false);
    await loadCustomer();
  };

  const handleDelete = async () => {
    if (!customer) {
      return;
    }

    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa khách hàng \"${customer.customerName}\"? Hành động này không thể hoàn tác.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await customersService.deleteCustomer(customer.id);
      toast.success("Xóa thành công", `Khách hàng \"${customer.customerName}\" đã bị xóa.`);
      router.push("/customers");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể xóa khách hàng.";
      toast.error("Xóa thất bại", message);
    }
  };

  if (isLoading || !customer) {
    return (
      <div className="p-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-sm text-gray-600">
          Đang tải chi tiết khách hàng...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{customer.customerName}</h1>
          <p className="text-sm text-gray-500 mt-1">Mã khách hàng: {customer.id}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" onClick={() => router.push("/customers")}> 
            <ArrowLeft className="w-4 h-4 mr-2" />
            Danh sách khách hàng
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Xóa
          </Button>
        </div>
      </div>

      <Card>
        <CardContent>
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={(tabId) => setActiveTab(tabId as CustomerTab)}
          />

          <div className="pt-6">
            {activeTab === "detail" &&
              (isEditing ? (
                <CustomerEditorForm
                  initialData={customer}
                  customerId={customer.id}
                  submitText="Lưu thay đổi"
                  onSubmit={handleUpdate}
                  onCancel={() => setIsEditing(false)}
                />
              ) : (
                <CustomerDetailSection customer={customer} onEdit={() => setIsEditing(true)} />
              ))}

            {activeTab === "chat" && (
              <div className="space-y-3">
                {conversation ? (
                  conversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`rounded-lg border p-3 ${
                        message.isMine ? "bg-primary-50 border-primary-100" : "bg-white border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-gray-900">{message.senderName}</p>
                        <p className="text-xs text-gray-500">{message.sentAt}</p>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{message.content}</p>
                    </div>
                  ))
                ) : (
                  <div className="border border-dashed border-gray-300 rounded-lg p-6 text-sm text-gray-500">
                    Chưa có dữ liệu chat cho khách hàng này.
                  </div>
                )}
              </div>
            )}

            {activeTab === "work" && (
              <div className="space-y-3">
                {isLoadingWorkHistory && (
                  <div className="text-sm text-gray-500">Đang tải lịch sử công việc...</div>
                )}

                {!isLoadingWorkHistory && workHistory.length === 0 && (
                  <div className="border border-dashed border-gray-300 rounded-lg p-6 text-sm text-gray-500">
                    Chưa có lịch sử công việc phù hợp.
                  </div>
                )}

                {!isLoadingWorkHistory &&
                  workHistory.map((item) => (
                    <div key={item.id} className="rounded-lg border border-gray-200 p-3 bg-white">
                      <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{item.note || "-"}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {item.created_at ? formatDateVNDateOnly(new Date(item.created_at)) : "-"}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CustomerDetailSection({ customer, onEdit }: { customer: Customer; onEdit: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {customer.is_active === false ? (
            <Badge variant="warning">Ngưng hoạt động</Badge>
          ) : (
            <Badge variant="success">Hoạt động</Badge>
          )}
          {customer.type && <Badge variant="info">{customer.type === "company" ? "Doanh nghiệp" : "Cá nhân"}</Badge>}
        </div>
        <Button variant="outline" onClick={onEdit}>
          <Pencil className="w-4 h-4 mr-2" />
          Chỉnh sửa thông tin
        </Button>
      </div>

      <Section title="Thông tin liên hệ">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoItem label="Số điện thoại" value={customer.phone || "-"} />
          <InfoItem label="Email" value={customer.email || "-"} />
          <InfoItem label="Địa chỉ" value={customer.address || "-"} className="md:col-span-2" />
          <InfoItem label="Website" value={customer.website || "-"} />
          <InfoItem label="Người phụ trách" value={customer.assignee || "-"} />
        </div>
      </Section>

      <Section title="Thông tin cá nhân">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoItem
            label="Giới tính"
            value={customer.gender === "Male" ? "Nam" : customer.gender === "Female" ? "Nữ" : "Khác"}
          />
          <InfoItem
            label="Ngày sinh"
            value={customer.day_of_birth ? formatDateVNDateOnly(customer.day_of_birth) : "-"}
          />
          <InfoItem label="Ngành nghề" value={customer.major || "-"} />
        </div>
      </Section>

      <Section title="Thông tin doanh nghiệp">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoItem label="Tên công ty" value={customer.company_name || "-"} />
          <InfoItem label="Mã số thuế" value={customer.tax_code || "-"} />
          <InfoItem
            label="Ngày thành lập"
            value={customer.company_establish_date ? formatDateVNDateOnly(customer.company_establish_date) : "-"}
          />
        </div>
      </Section>

      {(customer.description || customer.note) && (
        <Section title="Ghi chú">
          <div className="space-y-3">
            {customer.description && <InfoItem label="Mô tả" value={customer.description} />}
            {customer.note && <InfoItem label="Ghi chú" value={customer.note} />}
          </div>
        </Section>
      )}

      {customer.groups && customer.groups.length > 0 && (
        <Section title="Nhóm khách hàng">
          <div className="flex flex-wrap gap-2">
            {customer.groups.map((groupName) => (
              <Badge key={groupName} variant="info">
                {groupName}
              </Badge>
            ))}
          </div>
        </Section>
      )}

      <Section title="Mốc thời gian">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoItem label="Ngày tạo" value={customer.createdDate ? formatDateVNDateOnly(customer.createdDate) : "-"} />
          <InfoItem
            label="Cập nhật lần cuối"
            value={customer.lastContactDate ? formatDateVNDateOnly(customer.lastContactDate) : "-"}
          />
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 border-b border-gray-100 pb-2">
        {title}
      </h4>
      {children}
    </div>
  );
}

function InfoItem({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="text-sm text-gray-900 font-medium break-words">{value}</p>
    </div>
  );
}
