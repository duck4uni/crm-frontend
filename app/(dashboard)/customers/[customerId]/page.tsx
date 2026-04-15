"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, MessageCircle, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useDeleteConfirmation } from "@/components/ui/useDeleteConfirmation";
import { Tabs } from "@/components/ui/Tabs";
import { useToast } from "@/components/ui/ToastProvider";
import { formatDateVNDateOnly } from "@/lib/utils";
import { initialConversations } from "@/mock-data/chat";
import { customerAssignedUsersService } from "@/services/customer-assigned-users";
import { customerTagsService } from "@/services/customer-tags";
import { customersService } from "@/services/customers";
import { jobsService } from "@/services/jobs";
import { tagsService } from "@/services/tags";
import { usersService } from "@/services/users";
import {
  AdminUserApiRow,
  CustomerApiRow,
  CustomerAssignedUserApiRow,
  JobApiRow,
  UpdateCustomerPayload,
} from "@/types/api";
import { Customer, CustomerStatus } from "@/types/customer";
import { CustomerEditorForm } from "../components/forms/CustomerEditorForm";

const LEADER_PERMISSION_NAME = "SITE LEADER";
const WORKER_PERMISSION_NAME = "SITE WORKER";

function buildAllowedAssigneeIdSet(users: AdminUserApiRow[]): Set<string> {
  return users.reduce<Set<string>>((acc, user) => {
    const permissionNames = (user.user_permisions || [])
      .map((item) => item.permision?.name || "")
      .map((name) => name.trim())
      .filter(Boolean);

    if (
      permissionNames.includes(LEADER_PERMISSION_NAME) ||
      permissionNames.includes(WORKER_PERMISSION_NAME)
    ) {
      acc.add(user.id);
    }

    return acc;
  }, new Set<string>());
}

function filterAssignedUsersByAllowedIds(
  users: Array<{ id: string; full_name: string }>,
  allowedAssigneeIds: Set<string>,
): Array<{ id: string; full_name: string }> {
  if (allowedAssigneeIds.size === 0) {
    return [];
  }

  return users.filter((user) => allowedAssigneeIds.has(user.id));
}

type CustomerTab = "detail" | "chat" | "work";

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

function mapFormToUpdatePayload(data: Partial<Customer>): UpdateCustomerPayload {
  const firstName = normalizeWhitespace(String(data.first_name || ""));
  const lastName = normalizeWhitespace(String(data.last_name || ""));
  const fullName = normalizeWhitespace(`${lastName} ${firstName}`);

  return {
    first_name: firstName,
    last_name: lastName,
    description: normalizeWhitespace(data.description || "") || undefined,
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
    is_active: data.is_active ?? mapStatusToIsActive(data.status),
  };
}

function toAssignedUsersFromApiRows(
  customerId: string,
  rows: CustomerAssignedUserApiRow[],
): Array<{ id: string; full_name: string }> {
  const seen = new Set<string>();

  return rows.reduce<Array<{ id: string; full_name: string }>>((acc, row) => {
    if (row.customer_id !== customerId) {
      return acc;
    }

    const assignedUserId = typeof row.assigned_user_id === "string" ? row.assigned_user_id.trim() : "";
    if (!assignedUserId || seen.has(assignedUserId)) {
      return acc;
    }

    seen.add(assignedUserId);
    acc.push({
      id: assignedUserId,
      full_name: row.assigned_user?.full_name?.trim() || assignedUserId,
    });

    return acc;
  }, []);
}

function resolveAssignedUsers(
  row: CustomerApiRow,
  assignedUserRows: CustomerAssignedUserApiRow[],
): Array<{ id: string; full_name: string }> {
  const fromAssignedUserApi = toAssignedUsersFromApiRows(row.id, assignedUserRows);
  if (fromAssignedUserApi.length > 0) {
    return fromAssignedUserApi;
  }

  const seen = new Set<string>();
  return (row.assigned_users || []).reduce<Array<{ id: string; full_name: string }>>((acc, user) => {
    const id = typeof user?.id === "string" ? user.id.trim() : "";
    if (!id || seen.has(id)) {
      return acc;
    }

    seen.add(id);
    acc.push({
      id,
      full_name: typeof user.full_name === "string" ? user.full_name.trim() || id : id,
    });
    return acc;
  }, []);
}

function mapApiRowToCustomerDetail(
  row: CustomerApiRow,
  assignedUsers: Array<{ id: string; full_name: string }>,
  groupNames: string[],
): Customer {
  const customerName =
    row.full_name || `${row.last_name || ""} ${row.first_name || ""}`.trim() || row.email || "Khach hang";

  const assigneeName = assignedUsers.map((user) => user.full_name || user.id).filter(Boolean).join(", ");

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
    assigned_user_id: assignedUsers[0]?.id || undefined,
    assigned_users: assignedUsers,
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

function getJobDateValue(job: JobApiRow): number {
  const date = job.created_at || job.updated_at;
  return date ? new Date(date).getTime() : 0;
}

function getRelatedCustomerId(job: JobApiRow): string | null {
  return job.customer?.id || job.customer_uuid || null;
}

function getJobTimeRange(jobTime: JobApiRow["job_time"]): { start?: string; end?: string } {
  if (Array.isArray(jobTime)) {
    const firstRange = jobTime[0] || {};
    return {
      start: firstRange.start,
      end: firstRange.end,
    };
  }

  return {
    start: jobTime?.start,
    end: jobTime?.end,
  };
}

function getJobPerformerLabel(job: JobApiRow): string {
  return job.performer?.full_name || job.performer?.email || job.performer_uuid || "Chưa phân công";
}

function getJobStatusVariant(statusName?: string | null): "default" | "success" | "warning" | "danger" | "info" {
  const normalized = (statusName || "").toLowerCase();

  if (normalized.includes("hoàn thành") || normalized.includes("thành công") || normalized.includes("xong")) {
    return "success";
  }

  if (normalized.includes("hủy") || normalized.includes("từ chối") || normalized.includes("thất bại")) {
    return "danger";
  }

  if (normalized.includes("chờ") || normalized.includes("chưa") || normalized.includes("mới")) {
    return "warning";
  }

  if (normalized.includes("đang") || normalized.includes("thực hiện") || normalized.includes("xử lý")) {
    return "info";
  }

  return "default";
}

export default function CustomerDetailPage() {
  const params = useParams<{ customerId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const { requestDeleteConfirmation, DeleteConfirmationDialog } = useDeleteConfirmation();

  const customerId = params.customerId;
  const initialTab = (searchParams.get("tab") as CustomerTab) || "detail";
  const [activeTab, setActiveTab] = useState<CustomerTab>(
    ["detail", "chat", "work"].includes(initialTab) ? initialTab : "detail",
  );
  const [isEditing, setIsEditing] = useState(searchParams.get("mode") === "edit");

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [workJobs, setWorkJobs] = useState<JobApiRow[]>([]);
  const [isLoadingWorkJobs, setIsLoadingWorkJobs] = useState(false);
  const [assignerNameById, setAssignerNameById] = useState<Record<string, string>>({});

  const loadCustomer = useCallback(async () => {
    if (!customerId) {
      return;
    }

    setIsLoading(true);
    try {
      const [
        customerResponse,
        tagsResponse,
        customerTagsResponse,
        customerAssignedUsersResponse,
        adminUsersResponse,
      ] = await Promise.all([
        customersService.getCustomer(customerId),
        tagsService.getTags({ currentPage: "1", pageSize: "5000" }),
        customerTagsService.getCustomerTagsByCustomerId(customerId, {
          currentPage: "1",
          pageSize: "5000",
        }),
        customerAssignedUsersService.getCustomerAssignedUsersByCustomerId(customerId, {
          currentPage: "1",
          pageSize: "5000",
        }),
        usersService.getAdminUsers({ currentPage: "1", pageSize: "500" }),
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

      const assignedUsers = resolveAssignedUsers(
        row,
        customerAssignedUsersResponse.responseData?.rows || [],
      );

      const allowedAssigneeIdSet = buildAllowedAssigneeIdSet(adminUsersResponse.responseData?.rows || []);
      const filteredAssignedUsers = filterAssignedUsersByAllowedIds(assignedUsers, allowedAssigneeIdSet);

      setCustomer(mapApiRowToCustomerDetail(row, filteredAssignedUsers, groupNames));
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
    if (activeTab !== "work" || !customerId) {
      return;
    }

    let isDisposed = false;

    const loadWorkHistory = async () => {
      setIsLoadingWorkJobs(true);
      try {
        let rows: JobApiRow[] = [];

        try {
          const filteredResponse = await jobsService.getJobs({
            currentPage: "1",
            pageSize: "300",
            filters: `customer_uuid==${customerId}`,
          });
          rows = filteredResponse.responseData?.rows || [];
        } catch {
          rows = [];
        }

        if (rows.length === 0) {
          const fallbackResponse = await jobsService.getJobs({
            currentPage: "1",
            pageSize: "500",
          });

          rows = (fallbackResponse.responseData?.rows || []).filter(
            (job) => getRelatedCustomerId(job) === customerId,
          );
        }

        const assignerIds = Array.from(
          new Set(
            rows
              .map((job) => job.created_by)
              .filter((createdBy): createdBy is string => Boolean(createdBy && createdBy.trim())),
          ),
        );

        if (assignerIds.length > 0) {
          try {
            const usersResponse = await usersService.getUsers({ currentPage: "1", pageSize: "500" });
            const rowsById = (usersResponse.responseData?.rows || []).reduce<Record<string, string>>((acc, row) => {
              acc[row.id] = row.full_name || row.email || row.id;
              return acc;
            }, {});

            const nextAssignerMap = assignerIds.reduce<Record<string, string>>((acc, id) => {
              acc[id] = rowsById[id] || id;
              return acc;
            }, {});

            if (!isDisposed) {
              setAssignerNameById(nextAssignerMap);
            }
          } catch {
            const fallbackAssignerMap = assignerIds.reduce<Record<string, string>>((acc, id) => {
              acc[id] = id;
              return acc;
            }, {});

            if (!isDisposed) {
              setAssignerNameById(fallbackAssignerMap);
            }
          }
        } else if (!isDisposed) {
          setAssignerNameById({});
        }

        if (isDisposed) {
          return;
        }

        setWorkJobs([...rows].sort((a, b) => getJobDateValue(b) - getJobDateValue(a)));
      } catch {
        if (!isDisposed) {
          setWorkJobs([]);
        }
      } finally {
        if (!isDisposed) {
          setIsLoadingWorkJobs(false);
        }
      }
    };

    void loadWorkHistory();

    return () => {
      isDisposed = true;
    };
  }, [activeTab, customerId]);

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
      { id: "chat", label: "Lịch sử chat" },
      { id: "work", label: "Lịch sử công việc" },
    ],
    [],
  );

  const handleUpdate = async (formData: Partial<Customer>, groupIds: string[]) => {
    if (!customerId) {
      return;
    }

    const selectedAssignedUserIds = resolveAssignedUserIds(formData);

    try {
      await customersService.updateCustomer(customerId, mapFormToUpdatePayload(formData));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể cập nhật thông tin khách hàng.";
      toast.error("Cập nhật thất bại", message);
      return;
    }

    try {
      await customerAssignedUsersService.setCustomerAssignedUsers({
        customer_id: customerId,
        assigned_user_ids: selectedAssignedUserIds,
      });

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
      toast.warning(
        "Đã lưu thông tin",
        "Cập nhật nhóm khách hàng hoặc người phụ trách chưa thành công, vui lòng thử lại.",
      );
    }

    toast.success("Cập nhật thành công", "Thông tin khách hàng đã được lưu.");
    setIsEditing(false);
    await loadCustomer();
  };

  const handleDelete = () => {
    if (!customer) {
      return;
    }

    requestDeleteConfirmation({
      title: "Xóa khách hàng",
      description: `Bạn có chắc chắn muốn xóa khách hàng "${customer.customerName}"? Hành động này không thể hoàn tác.`,
      onConfirm: async () => {
        try {
          await customersService.deleteCustomer(customer.id);
          toast.success("Xóa thành công", `Khách hàng "${customer.customerName}" đã bị xóa.`);
          router.push("/customers");
        } catch (error) {
          const message = error instanceof Error ? error.message : "Không thể xóa khách hàng.";
          toast.error("Xóa thất bại", message);
        }
      },
    });
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
                {isLoadingWorkJobs && (
                  <div className="text-sm text-gray-500">Đang tải lịch sử công việc...</div>
                )}

                {!isLoadingWorkJobs && workJobs.length === 0 && (
                  <div className="border border-dashed border-gray-300 rounded-lg p-6 text-sm text-gray-500">
                    Chưa có công việc nào thuộc khách hàng này.
                  </div>
                )}

                {!isLoadingWorkJobs &&
                  workJobs.map((item) => {
                    const timeRange = getJobTimeRange(item.job_time);
                    const statusName = item.status?.name || "Không có trạng thái";
                    const assignerLabel = item.created_by
                      ? assignerNameById[item.created_by] || item.created_by
                      : "Không rõ";

                    return (
                      <div key={item.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-gray-900">{item.job_name}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant={getJobStatusVariant(statusName)}>{statusName}</Badge>
                          </div>
                        </div>
                        <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.content || "-"}</p>
                          {item.note && <p className="text-sm text-gray-600 whitespace-pre-wrap mt-2">Ghi chú: {item.note}</p>}
                        </div>
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600">
                          <p>Người thực hiện: {getJobPerformerLabel(item)}</p>
                          <p>Người giao: {assignerLabel}</p>
                          <p className="md:col-span-2">
                            Thời gian: {timeRange.start ? formatDateVNDateOnly(new Date(timeRange.start)) : "-"}
                            {timeRange.start && timeRange.end ? " -> " : ""}
                            {timeRange.end ? formatDateVNDateOnly(new Date(timeRange.end)) : ""}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <DeleteConfirmationDialog />
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
