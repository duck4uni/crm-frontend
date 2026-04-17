"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { formatDateForInput } from "@/lib/utils";
import { Customer } from "@/types/customer";
import { AssigneeSelectorPanel } from "./AssigneeSelectorPanel";
import { GroupSelectorPanel } from "./GroupSelectorPanel";
import { useCustomerEditorForm } from "./hooks/useCustomerEditorForm";

interface CustomerEditorFormProps {
  initialData?: Partial<Customer> | null;
  customerId?: string;
  submitText: string;
  onSubmit: (customer: Partial<Customer>, groupIds: string[]) => Promise<void>;
  onCancel?: () => void;
}

export function CustomerEditorForm({
  initialData,
  customerId,
  submitText,
  onSubmit,
  onCancel,
}: CustomerEditorFormProps) {
  const {
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
  } = useCustomerEditorForm({
    initialData,
    customerId,
    onSubmit,
  });

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

          <AssigneeSelectorPanel
            isSubmitting={isSubmitting}
            isLoadingUsers={isLoadingUsers}
            assigneeSearchKeyword={assigneeSearchKeyword}
            onAssigneeSearchKeywordChange={setAssigneeSearchKeyword}
            userOptions={userOptions}
            filteredUserOptions={filteredUserOptions}
            filteredLeaderOptions={filteredLeaderOptions}
            filteredWorkerOptions={filteredWorkerOptions}
            selectedAssignedUserIds={selectedAssignedUserIds}
            userNameById={userNameById}
            allFilteredAssigneesSelected={allFilteredAssigneesSelected}
            onToggleSelectAllFilteredAssignees={toggleSelectAllFilteredAssignees}
            onToggleAssigneeSelection={toggleAssigneeSelection}
          />
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
        <GroupSelectorPanel
          isLoadingGroups={isLoadingGroups}
          groupOptions={groupOptions}
          filteredGroupOptions={filteredGroupOptions}
          selectedGroupIds={selectedGroupIds}
          selectedGroupNameById={selectedGroupNameById}
          groupSearchKeyword={groupSearchKeyword}
          onGroupSearchKeywordChange={setGroupSearchKeyword}
          allFilteredGroupsSelected={allFilteredGroupsSelected}
          onToggleSelectAllFilteredGroups={toggleSelectAllFilteredGroups}
          onToggleGroupSelection={toggleGroupSelection}
          isSubmitting={isSubmitting}
        />
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
              <Spinner size="sm" className="mr-2" />
              Đang xử lý...
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
