import { useEffect, useState } from "react";
import { Customer } from "@/types/customer";
import { customerTagsService } from "@/services/customer-tags";
import { tagsService } from "@/services/tags";

interface UseCustomerFormModalParams {
  isOpen: boolean;
  customer?: Customer | null;
  onSave: (customer: Partial<Customer>, groupIds: string[]) => Promise<void>;
  onClose: () => void;
}

interface GroupOption {
  id: string;
  name: string;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function normalizeCustomerType(value?: string): "individual" | "company" {
  return value?.trim().toLowerCase() === "company" ? "company" : "individual";
}

function createDefaultFormData(): Partial<Customer> {
  return {
    customerName: "",
    email: "",
    phone: "",
    gender: "Male",
    address: "",
    website: "",
    assignee: "",
    assigned_user_id: "",
    type: "individual",
    company_name: "",
    tax_code: "",
    major: "",
    description: "",
    note: "",
    is_active: true,
  };
}

export function useCustomerFormModal({
  isOpen,
  customer,
  onSave,
  onClose,
}: UseCustomerFormModalParams) {
  const isEditing = !!customer;

  const [formData, setFormData] = useState<Partial<Customer>>(createDefaultFormData());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [groupOptions, setGroupOptions] = useState<GroupOption[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (customer) {
      setFormData({
        customerName: customer.customerName,
        email: customer.email || "",
        phone: customer.phone || "",
        gender: customer.gender,
        address: customer.address || "",
        website: customer.website || customer.source || "",
        assignee: customer.assignee || "",
        assigned_user_id: customer.assigned_user_id || "",
        type: normalizeCustomerType(customer.type),
        company_name: customer.company_name || "",
        company_establish_date: customer.company_establish_date,
        tax_code: customer.tax_code || "",
        major: customer.major || "",
        day_of_birth: customer.day_of_birth,
        description: customer.description || "",
        note: customer.note || "",
        is_active: customer.is_active ?? true,
      });
    } else {
      setFormData(createDefaultFormData());
    }

    setErrors({});

    let isDisposed = false;

    const loadGroups = async () => {
      setIsLoadingGroups(true);
      try {
        const [tagsResponse, customerTagsResponse] = await Promise.all([
          tagsService.getTags({ currentPage: "1", pageSize: "5000" }),
          customer?.id
            ? customerTagsService.getCustomerTagsByCustomerId(customer.id, {
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
        if (!isDisposed) setIsLoadingGroups(false);
      }
    };

    void loadGroups();
    return () => {
      isDisposed = true;
    };
  }, [customer, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "assignee") {
      const trimmed = value.trim();
      setFormData((prev) => ({
        ...prev,
        assignee: value,
        assigned_user_id: UUID_PATTERN.test(trimmed) ? trimmed : "",
      }));
    } else if (name === "type") {
      setFormData((prev) => ({
        ...prev,
        type: normalizeCustomerType(value),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => {
        const nextErrors = { ...prev };
        delete nextErrors[name];
        return nextErrors;
      });
    }
  };

  const handleDateChange = (field: keyof Customer, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value ? new Date(value) : undefined }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.customerName?.trim()) newErrors.customerName = "Tên khách hàng là bắt buộc";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Email không hợp lệ";
    }
    if (formData.phone && !/^[0-9]{9,11}$/.test(formData.phone.trim())) {
      newErrors.phone = "Số điện thoại không hợp lệ (9-11 chữ số)";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await onSave(formData, selectedGroupIds);
      onClose();
    } catch {
      // Parent handles toast/error display.
    } finally {
      setIsLoading(false);
    }
  };

  const toggleGroupSelection = (groupId: string) => {
    setSelectedGroupIds((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId],
    );
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
    isEditing,
    formData,
    setFormData,
    errors,
    isLoading,
    groupOptions,
    selectedGroupIds,
    isLoadingGroups,
    handleChange,
    handleDateChange,
    handleSubmit,
    toggleGroupSelection,
    genderOptions,
    typeOptions,
    activeOptions,
    normalizeCustomerType,
  };
}
