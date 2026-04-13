"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { formatDateForInput } from "@/lib/utils";
import { UserProfile } from "@/types/user";

interface PermissionOption {
  id: string;
  name: string;
  code: string;
  group_code?: string;
}

interface UserEditorFormProps {
  mode: "create" | "edit";
  submitText: string;
  initialData?: Partial<UserProfile> | null;
  permissions?: PermissionOption[];
  onSubmit: (
    user: Partial<UserProfile> & { password?: string },
    roleCode: string | null,
  ) => Promise<void>;
  onCancel?: () => void;
}

const ALLOWED_ROLE_CODES = ["SITE_WORKER", "SITE_LEADER", "SITE_OWNER"];

function buildDefaultFormData(): Partial<UserProfile> {
  return {
    full_name: "",
    email: "",
    phone: "",
    avatar: "",
    is_active: true,
  };
}

function mergeInitialData(initialData?: Partial<UserProfile> | null): Partial<UserProfile> {
  if (!initialData) {
    return buildDefaultFormData();
  }

  return {
    ...buildDefaultFormData(),
    ...initialData,
    full_name: initialData.full_name || "",
    email: initialData.email || "",
    phone: initialData.phone || "",
    avatar: initialData.avatar || "",
    is_active: initialData.is_active ?? true,
  };
}

export function UserEditorForm({
  mode,
  submitText,
  initialData,
  permissions = [],
  onSubmit,
  onCancel,
}: UserEditorFormProps) {
  const isEditing = mode === "edit";

  const [formData, setFormData] = useState<Partial<UserProfile>>(mergeInitialData(initialData));
  const [password, setPassword] = useState("");
  const [selectedRoleCode, setSelectedRoleCode] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormData(mergeInitialData(initialData));
    setPassword("");
    setSelectedRoleCode("");
    setErrors({});
  }, [initialData, mode]);

  const roleOptions = useMemo(
    () =>
      permissions
        .filter((permission) => ALLOWED_ROLE_CODES.includes(permission.code))
        .map((permission) => ({ value: permission.code, label: permission.name })),
    [permissions],
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;

    if (name === "is_active") {
      setFormData((prev) => ({
        ...prev,
        is_active: value === "true",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => {
        const nextErrors = { ...prev };
        delete nextErrors[name];
        return nextErrors;
      });
    }
  };

  const handleDateChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      birthday: value ? new Date(value) : undefined,
    }));
  };

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};

    if (!formData.full_name?.trim()) {
      nextErrors.full_name = "Họ tên là bắt buộc";
    }

    if (!formData.email?.trim()) {
      nextErrors.email = "Email là bắt buộc";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      nextErrors.email = "Email không hợp lệ";
    }

    if (formData.phone && !/^[0-9]{10,11}$/.test(formData.phone.trim())) {
      nextErrors.phone = "Số điện thoại không hợp lệ (10-11 chữ số)";
    }

    if (!isEditing) {
      if (!password.trim()) {
        nextErrors.password = "Mật khẩu là bắt buộc";
      } else if (password.length < 8) {
        nextErrors.password = "Mật khẩu ít nhất 8 ký tự";
      }

      if (!selectedRoleCode) {
        nextErrors.roleCode = "Vui lòng chọn vai trò";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(
        {
          ...formData,
          ...(isEditing ? {} : { password }),
        },
        isEditing ? null : selectedRoleCode,
      );
    } catch {
      // Parent page handles toast messages.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Họ tên *"
          name="full_name"
          value={formData.full_name || ""}
          onChange={handleChange}
          placeholder="Nhập họ tên"
          error={errors.full_name}
          disabled={isSubmitting}
        />

        <Input
          label="Email *"
          type="email"
          name="email"
          value={formData.email || ""}
          onChange={handleChange}
          placeholder="Nhập email"
          error={errors.email}
          disabled={isSubmitting}
        />

        <Input
          label="Số điện thoại"
          name="phone"
          value={formData.phone || ""}
          onChange={handleChange}
          placeholder="Nhập số điện thoại"
          error={errors.phone}
          disabled={isSubmitting}
        />

        {!isEditing && (
          <div>
            <Select
              label="Vai trò *"
              name="roleCode"
              value={selectedRoleCode}
              onChange={(event) => {
                setSelectedRoleCode(event.target.value);
                if (errors.roleCode) {
                  setErrors((prev) => {
                    const nextErrors = { ...prev };
                    delete nextErrors.roleCode;
                    return nextErrors;
                  });
                }
              }}
              options={roleOptions}
              placeholder="Chọn vai trò"
              disabled={isSubmitting}
            />
            {errors.roleCode && <p className="mt-1 text-xs text-red-500">{errors.roleCode}</p>}
          </div>
        )}

        {isEditing && (
          <Input
            label="Ngày sinh"
            type="date"
            name="birthday"
            value={formatDateForInput(formData.birthday)}
            onChange={(event) => handleDateChange(event.target.value)}
            disabled={isSubmitting}
          />
        )}

        {isEditing && (
          <Select
            label="Trạng thái"
            name="is_active"
            value={formData.is_active ? "true" : "false"}
            onChange={handleChange}
            options={[
              { value: "true", label: "Hoạt động" },
              { value: "false", label: "Ngưng hoạt động" },
            ]}
            disabled={isSubmitting}
          />
        )}

        {isEditing && (
          <Input
            label="Avatar URL"
            name="avatar"
            value={formData.avatar || ""}
            onChange={handleChange}
            placeholder="URL ảnh đại diện"
            disabled={isSubmitting}
          />
        )}

        {!isEditing && (
          <div className="md:col-span-2">
            <Input
              label="Mật khẩu *"
              type="password"
              name="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                if (errors.password) {
                  setErrors((prev) => {
                    const nextErrors = { ...prev };
                    delete nextErrors.password;
                    return nextErrors;
                  });
                }
              }}
              placeholder="Nhập mật khẩu (ít nhất 8 ký tự)"
              error={errors.password}
              disabled={isSubmitting}
            />
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
            Hủy
          </Button>
        )}
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? "Đang lưu..." : submitText}
        </Button>
      </div>
    </form>
  );
}
