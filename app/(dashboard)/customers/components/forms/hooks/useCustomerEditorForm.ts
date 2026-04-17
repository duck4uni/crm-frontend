import { useEffect, useMemo, useState } from "react";
import { customerTagsService } from "@/services/customer-tags";
import { tagsService } from "@/services/tags";
import { usersService } from "@/services/users";
import { Customer } from "@/types/customer";
import { normalizeWhitespace } from "@/lib/utils";

interface GroupOption {
  id: string;
  name: string;
}

export interface UserOption {
  id: string;
  label: string;
  role: "SITE LEADER" | "SITE WORKER";
}

const LEADER_ROLE_NAME = "SITE LEADER";
const WORKER_ROLE_NAME = "SITE WORKER";

interface UseCustomerEditorFormParams {
  initialData?: Partial<Customer> | null;
  customerId?: string;
  onSubmit: (customer: Partial<Customer>, groupIds: string[]) => Promise<void>;
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
  const customerName =
    buildCustomerNameFromParts(firstName, lastName) || normalizeWhitespace(fallbackCustomerName);

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

export function useCustomerEditorForm({
  initialData,
  customerId,
  onSubmit,
}: UseCustomerEditorFormParams) {
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

  return {
    formData,
    setFormData,
    errors,
    isSubmitting,
    handleChange,
    handleDateChange,
    handleSubmit,
    normalizeCustomerType,
    genderOptions,
    typeOptions,
    activeOptions,
    selectedAssignedUserIds,
    userNameById,
    assigneeSearchKeyword,
    setAssigneeSearchKeyword,
    isLoadingUsers,
    userOptions,
    filteredUserOptions,
    filteredLeaderOptions,
    filteredWorkerOptions,
    toggleAssigneeSelection,
    allFilteredAssigneesSelected,
    toggleSelectAllFilteredAssignees,
    groupOptions,
    selectedGroupIds,
    isLoadingGroups,
    groupSearchKeyword,
    setGroupSearchKeyword,
    filteredGroupOptions,
    selectedGroupNameById,
    toggleGroupSelection,
    allFilteredGroupsSelected,
    toggleSelectAllFilteredGroups,
  };
}
