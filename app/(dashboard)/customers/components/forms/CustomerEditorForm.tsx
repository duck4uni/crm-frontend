"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { formatDateForInput, formatPermissionName } from "@/lib/utils";
import { customerTagsService } from "@/services/customer-tags";
import { tagsService } from "@/services/tags";
import { usersService } from "@/services/users";
import { Customer } from "@/types/customer";

interface GroupOption {
  id: string;
  name: string;
}

interface UserOption {
  id: string;
  label: string;
  role: "SITE LEADER" | "SITE WORKER";
}

const LEADER_ROLE_NAME = "SITE LEADER";
const WORKER_ROLE_NAME = "SITE WORKER";

interface CustomerEditorFormProps {
  initialData?: Partial<Customer> | null;
  customerId?: string;
  submitText: string;
  onSubmit: (customer: Partial<Customer>, groupIds: string[]) => Promise<void>;
  onCancel?: () => void;
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function buildCustomerNameFromParts(firstName: string, lastName: string): string {
  return normalizeWhitespace(`${lastName} ${firstName}`);
}

function splitCustomerName(fullName: string): { firstName: string; lastName: string } {
  const normalized = normalizeWhitespace(fullName);
  if (!normalized) {
    return { firstName: "", lastName: "" };
  }

  const parts = normalized.split(" ");
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" };
  }

  const firstName = parts.pop() || "";
  const lastName = parts.join(" ") || "";
  return { firstName, lastName };
}

function normalizeCustomerType(value?: string): "individual" | "company" {
  return value?.trim().toLowerCase() === "company" ? "company" : "individual";
}

function toAssignedUserIds(data?: Partial<Customer> | null): string[] {
  const idsFromField = Array.isArray(data?.assigned_user_ids) ? data.assigned_user_ids : [];
  const idsFromUsers = Array.isArray(data?.assigned_users)
    ? data.assigned_users.map((user) => user?.id || "")
    : [];
  const singleId = typeof data?.assigned_user_id === "string" ? data.assigned_user_id : "";

  return Array.from(
    new Set(
      [...idsFromField, ...idsFromUsers, singleId]
        .map((id) => (typeof id === "string" ? id.trim() : ""))
        .filter(Boolean),
    ),
  );
}

function buildDefaultFormData(): Partial<Customer> {
  return {
    customerName: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    gender: "Male",
    address: "",
    website: "",
    assignee: "",
    assigned_user_id: "",
    assigned_user_ids: [],
    type: "individual",
    company_name: "",
    tax_code: "",
    major: "",
    description: "",
    note: "",
    is_active: true,
  };
}

function mergeInitialData(initialData?: Partial<Customer> | null): Partial<Customer> {
  if (!initialData) {
    return buildDefaultFormData();
  }

  const rawFirstName = typeof initialData.first_name === "string" ? initialData.first_name : "";
  const rawLastName = typeof initialData.last_name === "string" ? initialData.last_name : "";
  const fallbackCustomerName = initialData.customerName || initialData.full_name || "";
  const splitFromFallback = splitCustomerName(fallbackCustomerName);

  const firstName = normalizeWhitespace(rawFirstName) || splitFromFallback.firstName;
  const lastName = normalizeWhitespace(rawLastName) || splitFromFallback.lastName;
  const customerName = buildCustomerNameFromParts(firstName, lastName) || normalizeWhitespace(fallbackCustomerName);

  return {
    ...buildDefaultFormData(),
    ...initialData,
    gender: initialData.gender || "Male",
    type: normalizeCustomerType(initialData.type),
    customerName,
    first_name: firstName,
    last_name: lastName,
    email: initialData.email || "",
    phone: initialData.phone || "",
    address: initialData.address || "",
    website: initialData.website || initialData.source || "",
    assignee: initialData.assignee || "",
    assigned_user_id: initialData.assigned_user_id || "",
    assigned_user_ids: toAssignedUserIds(initialData),
    company_name: initialData.company_name || "",
    tax_code: initialData.tax_code || "",
    major: initialData.major || "",
    description: initialData.description || "",
    note: initialData.note || "",
    is_active: initialData.is_active ?? true,
  };
}

export function CustomerEditorForm({
  initialData,
  customerId,
  submitText,
  onSubmit,
  onCancel,
}: CustomerEditorFormProps) {
  const [formData, setFormData] = useState<Partial<Customer>>(mergeInitialData(initialData));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [groupOptions, setGroupOptions] = useState<GroupOption[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [groupSearchKeyword, setGroupSearchKeyword] = useState("");
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [assigneeSearchKeyword, setAssigneeSearchKeyword] = useState("");
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const allowedAssigneeIdSet = useMemo(() => {
    if (userOptions.length === 0) {
      return null;
    }

    return new Set(userOptions.map((user) => user.id));
  }, [userOptions]);

  useEffect(() => {
    setFormData(mergeInitialData(initialData));
    setAssigneeSearchKeyword("");
  }, [initialData]);

  useEffect(() => {
    let isDisposed = false;

    const loadGroups = async () => {
      setIsLoadingGroups(true);
      try {
        const [tagsResponse, customerTagsResponse] = await Promise.all([
          tagsService.getTags({ currentPage: "1", pageSize: "5000" }),
          customerId
            ? customerTagsService.getCustomerTagsByCustomerId(customerId, {
                currentPage: "1",
                pageSize: "5000",
              })
            : Promise.resolve(null),
        ]);

        if (isDisposed) return;

        const groups = (tagsResponse.responseData?.rows || [])
          .map((tag) => ({ id: tag.id, name: tag.name }))
          .sort((a, b) => a.name.localeCompare(b.name, "vi"));

        const nextSelectedIds = customerTagsResponse?.responseData?.rows
          ? Array.from(new Set(customerTagsResponse.responseData.rows.map((row) => row.tag_id)))
          : [];

        setGroupOptions(groups);
        setSelectedGroupIds(nextSelectedIds);
      } catch {
        if (!isDisposed) {
          setGroupOptions([]);
          setSelectedGroupIds([]);
        }
      } finally {
        if (!isDisposed) {
          setIsLoadingGroups(false);
        }
      }
    };

    void loadGroups();
    return () => {
      isDisposed = true;
    };
  }, [customerId]);

  useEffect(() => {
    let isDisposed = false;

    const loadUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const response = await usersService.getAdminUsers({
          currentPage: "1",
          pageSize: "500",
        });

        if (isDisposed) {
          return;
        }

        const options = (response.responseData?.rows || [])
          .map((user) => {
            const permissionNames = (user.user_permisions || [])
              .map((item) => item.permision?.name || "")
              .map((name) => name.trim());

            const isLeader = permissionNames.includes(LEADER_ROLE_NAME);
            const isWorker = permissionNames.includes(WORKER_ROLE_NAME);

            if (!isLeader && !isWorker) {
              return null;
            }

            return {
              id: user.id,
              label: user.full_name?.trim() || user.email || user.id,
              role: isLeader ? LEADER_ROLE_NAME : WORKER_ROLE_NAME,
            };
          })
          .filter((user): user is UserOption => Boolean(user))
          .sort((a, b) => a.label.localeCompare(b.label, "vi"));

        setUserOptions(options);
      } catch {
        if (!isDisposed) {
          setUserOptions([]);
        }
      } finally {
        if (!isDisposed) {
          setIsLoadingUsers(false);
        }
      }
    };

    void loadUsers();
    return () => {
      isDisposed = true;
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "first_name" || name === "last_name") {
      setFormData((prev) => {
        const next = { ...prev, [name]: value };
        const firstName = typeof next.first_name === "string" ? next.first_name : "";
        const lastName = typeof next.last_name === "string" ? next.last_name : "";
        return {
          ...next,
          customerName: buildCustomerNameFromParts(firstName, lastName),
        };
      });
    } else if (name === "type") {
      setFormData((prev) => ({ ...prev, type: normalizeCustomerType(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleDateChange = (field: keyof Customer, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value ? new Date(value) : undefined }));
  };

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};

    if (!String(formData.first_name || "").trim()) {
      nextErrors.first_name = "Tên khách hàng là bắt buộc";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      nextErrors.email = "Email không hợp lệ";
    }

    if (formData.phone && !/^[0-9]{9,11}$/.test(formData.phone.trim())) {
      nextErrors.phone = "Số điện thoại không hợp lệ (9-11 chữ số)";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const normalizedAssignedUserIds = toAssignedUserIds(formData);
      const filteredAssignedUserIds = allowedAssigneeIdSet
        ? normalizedAssignedUserIds.filter((id) => allowedAssigneeIdSet.has(id))
        : normalizedAssignedUserIds;

      await onSubmit(
        {
          ...formData,
          assigned_user_id: filteredAssignedUserIds[0] || "",
          assigned_user_ids: filteredAssignedUserIds,
        },
        selectedGroupIds,
      );
    } catch {
      // Parent page handles toast/error display.
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleGroupSelection = (groupId: string) => {
    setSelectedGroupIds((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId],
    );
  };

  const selectedAssignedUserIds = useMemo(() => {
    const ids = toAssignedUserIds(formData);
    return allowedAssigneeIdSet ? ids.filter((id) => allowedAssigneeIdSet.has(id)) : ids;
  }, [allowedAssigneeIdSet, formData]);

  const toggleAssigneeSelection = (userId: string) => {
    setFormData((prev) => {
      const currentIds = Array.isArray(prev.assigned_user_ids)
        ? (prev.assigned_user_ids as string[])
        : [];

      return {
        ...prev,
        assigned_users: [],
        assigned_user_id: "",
        assigned_user_ids: currentIds.includes(userId)
          ? currentIds.filter((id) => id !== userId)
          : [...currentIds, userId],
      };
    });
  };

  const filteredUserOptions = useMemo(() => {
    const keyword = assigneeSearchKeyword.trim().toLowerCase();
    if (!keyword) {
      return userOptions;
    }

    return userOptions.filter((user) => user.label.toLowerCase().includes(keyword));
  }, [assigneeSearchKeyword, userOptions]);

  const filteredLeaderOptions = useMemo(
    () => filteredUserOptions.filter((user) => user.role === LEADER_ROLE_NAME),
    [filteredUserOptions],
  );

  const filteredWorkerOptions = useMemo(
    () => filteredUserOptions.filter((user) => user.role === WORKER_ROLE_NAME),
    [filteredUserOptions],
  );

  const allFilteredAssigneesSelected =
    filteredUserOptions.length > 0 &&
    filteredUserOptions.every((user) => selectedAssignedUserIds.includes(user.id));

  const toggleSelectAllFilteredAssignees = () => {
    setFormData((prev) => {
      const currentIds = new Set(
        Array.isArray(prev.assigned_user_ids) ? (prev.assigned_user_ids as string[]) : [],
      );

      if (allFilteredAssigneesSelected) {
        filteredUserOptions.forEach((user) => currentIds.delete(user.id));
      } else {
        filteredUserOptions.forEach((user) => currentIds.add(user.id));
      }

      return {
        ...prev,
        assigned_users: [],
        assigned_user_id: "",
        assigned_user_ids: Array.from(currentIds),
      };
    });
  };

  const userNameById = useMemo(
    () =>
      userOptions.reduce<Record<string, string>>((acc, user) => {
        acc[user.id] = user.label;
        return acc;
      }, {}),
    [userOptions],
  );

  const filteredGroupOptions = useMemo(() => {
    const keyword = groupSearchKeyword.trim().toLowerCase();
    if (!keyword) {
      return groupOptions;
    }

    return groupOptions.filter((group) => group.name.toLowerCase().includes(keyword));
  }, [groupOptions, groupSearchKeyword]);

  const selectedGroupNameById = useMemo(
    () =>
      groupOptions.reduce<Record<string, string>>((acc, group) => {
        acc[group.id] = group.name;
        return acc;
      }, {}),
    [groupOptions],
  );

  const allFilteredGroupsSelected =
    filteredGroupOptions.length > 0 &&
    filteredGroupOptions.every((group) => selectedGroupIds.includes(group.id));

  const toggleSelectAllFilteredGroups = () => {
    const filteredGroupIdSet = new Set(filteredGroupOptions.map((group) => group.id));

    setSelectedGroupIds((prev) => {
      if (allFilteredGroupsSelected) {
        return prev.filter((id) => !filteredGroupIdSet.has(id));
      }

      const next = new Set(prev);
      filteredGroupOptions.forEach((group) => next.add(group.id));
      return Array.from(next);
    });
  };

  const genderOptions = [
    { value: "Male", label: "Nam" },
    { value: "Female", label: "Nữ" },
    { value: "Other", label: "Khác" },
  ];

  const typeOptions = [
    { value: "individual", label: "Cá nhân" },
    { value: "company", label: "Doanh nghiệp" },
  ];

  const activeOptions = [
    { value: "true", label: "Hoạt động" },
    { value: "false", label: "Ngưng hoạt động" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormSection title="Thông tin cơ bản">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Họ và tên đệm"
            name="last_name"
            value={String(formData.last_name || "")}
            onChange={handleChange}
            error={errors.last_name}
            placeholder="VD: Nguyễn Văn"
            disabled={isSubmitting}
          />
          <Input
            label="Tên *"
            name="first_name"
            value={String(formData.first_name || "")}
            onChange={handleChange}
            error={errors.first_name}
            placeholder="VD: A"
            disabled={isSubmitting}
          />
          <Select
            label="Loại khách hàng"
            name="type"
            value={normalizeCustomerType(formData.type)}
            onChange={handleChange}
            options={typeOptions}
            variant="default"
            disabled={isSubmitting}
          />
          <Select
            label="Giới tính"
            name="gender"
            value={formData.gender || "Male"}
            onChange={handleChange}
            options={genderOptions}
            variant="default"
            disabled={isSubmitting}
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email || ""}
            onChange={handleChange}
            error={errors.email}
            placeholder="example@domain.com"
            disabled={isSubmitting}
          />
          <Input
            label="Số điện thoại"
            name="phone"
            value={formData.phone || ""}
            onChange={handleChange}
            error={errors.phone}
            placeholder="Nhập số điện thoại"
            disabled={isSubmitting}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={formatDateForInput(formData.day_of_birth)}
              onChange={(e) => handleDateChange("day_of_birth", e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <Input
            label="Ngành nghề"
            name="major"
            value={formData.major || ""}
            onChange={handleChange}
            placeholder="VD: Xây dựng, CNTT..."
            disabled={isSubmitting}
          />
          <Input
            label="Địa chỉ"
            name="address"
            value={formData.address || ""}
            onChange={handleChange}
            placeholder="Nhập địa chỉ"
            className="md:col-span-2"
            disabled={isSubmitting}
          />
          <Input
            label="Website"
            name="website"
            value={formData.website || ""}
            onChange={handleChange}
            placeholder="https://example.com"
            disabled={isSubmitting}
          />
          <Select
            label="Trạng thái"
            name="is_active"
            value={formData.is_active === false ? "false" : "true"}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, is_active: e.target.value === "true" }))
            }
            options={activeOptions}
            variant="default"
            disabled={isSubmitting}
          />

          <div className="md:col-span-2 rounded-lg border border-gray-200 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <p className="text-sm font-medium text-gray-700">Người phụ trách</p>
              <p className="text-xs text-gray-500">Đã chọn {selectedAssignedUserIds.length} người</p>
            </div>

            <Input
              name="assigneeSearch"
              value={assigneeSearchKeyword}
              onChange={(event) => setAssigneeSearchKeyword(event.target.value)}
              placeholder="Tìm theo tên user"
              disabled={isSubmitting || isLoadingUsers}
            />

            <div className="flex items-center justify-between gap-2 flex-wrap">
              <p className="text-xs text-gray-500">
                Hiển thị {filteredUserOptions.length}/{userOptions.length} user
              </p>
              <Button
                type="button"
                variant="outline"
                className="h-8 px-3 text-xs"
                onClick={toggleSelectAllFilteredAssignees}
                disabled={isSubmitting || isLoadingUsers || filteredUserOptions.length === 0}
              >
                {allFilteredAssigneesSelected ? "Bỏ chọn user đang lọc" : "Chọn user đang lọc"}
              </Button>
            </div>

            {isLoadingUsers && <p className="text-sm text-gray-500">Đang tải danh sách user...</p>}

            {!isLoadingUsers && userOptions.length === 0 && (
              <p className="text-sm text-gray-500">Không có user nào để gán phụ trách.</p>
            )}

            {!isLoadingUsers && userOptions.length > 0 && filteredUserOptions.length === 0 && (
              <p className="text-sm text-gray-500">Không tìm thấy user phù hợp.</p>
            )}

            {!isLoadingUsers && filteredUserOptions.length > 0 && (
              <div className="space-y-4">
                <AssigneeRoleSection
                  title={formatPermissionName(LEADER_ROLE_NAME)}
                  users={filteredLeaderOptions}
                  selectedIds={selectedAssignedUserIds}
                  onToggle={toggleAssigneeSelection}
                  disabled={isSubmitting}
                />

                <AssigneeRoleSection
                  title={formatPermissionName(WORKER_ROLE_NAME)}
                  users={filteredWorkerOptions}
                  selectedIds={selectedAssignedUserIds}
                  onToggle={toggleAssigneeSelection}
                  disabled={isSubmitting}
                />
              </div>
            )}

            {selectedAssignedUserIds.length > 0 && (
              <div className="rounded-md border border-dashed border-gray-300 p-2">
                <p className="text-xs text-gray-500 mb-2">Đang phụ trách</p>
                <div className="flex flex-wrap gap-2">
                  {selectedAssignedUserIds.map((userId) => (
                    <span
                      key={userId}
                      className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-1 text-xs font-medium text-primary-700"
                    >
                      {userNameById[userId] || userId}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </FormSection>

      <FormSection title="Thông tin doanh nghiệp">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Tên công ty"
            name="company_name"
            value={formData.company_name || ""}
            onChange={handleChange}
            placeholder="Nhập tên công ty"
            disabled={isSubmitting}
            className="md:col-span-2"
          />
          <Input
            label="Mã số thuế"
            name="tax_code"
            value={formData.tax_code || ""}
            onChange={handleChange}
            placeholder="Nhập mã số thuế"
            disabled={isSubmitting}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày thành lập</label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={formatDateForInput(formData.company_establish_date)}
              onChange={(e) => handleDateChange("company_establish_date", e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>
      </FormSection>

      <FormSection title="Ghi chú">
        <div className="grid grid-cols-1 gap-4">
          <Input
            label="Mô tả"
            name="description"
            value={formData.description || ""}
            onChange={handleChange}
            placeholder="Mô tả ngắn về khách hàng"
            disabled={isSubmitting}
          />
          <Input
            label="Ghi chú"
            name="note"
            value={formData.note || ""}
            onChange={handleChange}
            placeholder="Ghi chú thêm"
            disabled={isSubmitting}
          />
        </div>
      </FormSection>

      <FormSection title="Nhóm khách hàng">
        <div className="rounded-lg border border-gray-200 p-4 space-y-3">
          {isLoadingGroups && <p className="text-sm text-gray-500">Đang tải danh sách nhóm...</p>}
          {!isLoadingGroups && groupOptions.length === 0 && (
            <p className="text-sm text-gray-500">Chưa có nhóm khách hàng nào.</p>
          )}
          {!isLoadingGroups && groupOptions.length > 0 && (
            <div className="space-y-3">
              <Input
                name="groupSearch"
                value={groupSearchKeyword}
                onChange={(event) => setGroupSearchKeyword(event.target.value)}
                placeholder="Tìm theo tên nhóm khách hàng"
                disabled={isSubmitting}
              />

              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-gray-500">
                  Hiển thị {filteredGroupOptions.length}/{groupOptions.length} nhóm
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="h-8 px-3 text-xs"
                  onClick={toggleSelectAllFilteredGroups}
                  disabled={isSubmitting || filteredGroupOptions.length === 0}
                >
                  {allFilteredGroupsSelected ? "Bỏ chọn nhóm đang lọc" : "Chọn nhóm đang lọc"}
                </Button>
              </div>

              {filteredGroupOptions.length === 0 ? (
                <p className="text-sm text-gray-500">Không tìm thấy nhóm phù hợp.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                  {filteredGroupOptions.map((group) => {
                    const isChecked = selectedGroupIds.includes(group.id);
                    return (
                      <label
                        key={group.id}
                        className={`flex items-center gap-3 rounded-md border px-3 py-2 cursor-pointer transition-colors ${
                          isChecked
                            ? "border-primary-500 bg-primary-50"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleGroupSelection(group.id)}
                          disabled={isSubmitting}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-900">{group.name}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {selectedGroupIds.length > 0 && (
                <div className="rounded-md border border-dashed border-gray-300 p-2">
                  <p className="text-xs text-gray-500 mb-2">Nhóm đã chọn</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedGroupIds.map((groupId) => (
                      <span
                        key={groupId}
                        className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-1 text-xs font-medium text-primary-700"
                      >
                        {selectedGroupNameById[groupId] || groupId}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <p className="text-xs text-gray-500">Đã chọn {selectedGroupIds.length} nhóm.</p>
        </div>
      </FormSection>

      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Hủy
          </Button>
        )}
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner size="sm" className="mr-2" />Đang xử lý...
            </>
          ) : (
            submitText
          )}
        </Button>
      </div>
    </form>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 border-b border-gray-100 pb-2">
        {title}
      </h3>
      {children}
    </div>
  );
}

function AssigneeRoleSection({
  title,
  users,
  selectedIds,
  onToggle,
  disabled,
}: {
  title: string;
  users: UserOption[];
  selectedIds: string[];
  onToggle: (userId: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="border border-gray-200 rounded-md overflow-hidden">
      <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-700 uppercase tracking-wider">
        {title} ({users.length})
      </div>

      {users.length === 0 ? (
        <p className="px-3 py-3 text-sm text-gray-500">Không có user phù hợp.</p>
      ) : (
        <div className="max-h-52 overflow-y-auto">
          <table className="w-full">
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => {
                const isChecked = selectedIds.includes(user.id);

                return (
                  <tr key={user.id} className={isChecked ? "bg-primary-50" : "hover:bg-gray-50"}>
                    <td className="px-3 py-2 w-10">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onToggle(user.id)}
                        disabled={disabled}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-900">{user.label}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
