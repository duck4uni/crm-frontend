"use client";

import { useState, useEffect } from "react";
import { Customer } from "@/types/customer";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { formatDateForInput } from "@/lib/utils";
import { tagsService } from "@/services/tags";
import { customerTagsService } from "@/services/customer-tags";

interface CustomerFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (customer: Partial<Customer>, groupIds: string[]) => Promise<void>;
    customer?: Customer | null;
}

interface GroupOption {
    id: string;
    name: string;
}

export function CustomerFormModal({
    isOpen,
    onClose,
    onSave,
    customer,
}: CustomerFormModalProps) {
    const isEditing = !!customer;

    const [formData, setFormData] = useState<Partial<Customer>>({
        customerName: "",
        email: "",
        phone: "",
        gender: "Male",
        address: "",
        website: "",
        assignee: "",
        type: "individual",
        company_name: "",
        tax_code: "",
        major: "",
        id_no: "",
        id_issued_by: "",
        id_issued_place: "",
        description: "",
        note: "",
        is_active: true,
    });

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
                type: customer.type || "individual",
                company_name: customer.company_name || "",
                company_establish_date: customer.company_establish_date,
                tax_code: customer.tax_code || "",
                major: customer.major || "",
                id_no: customer.id_no || "",
                id_issued_by: customer.id_issued_by || "",
                id_issued_date: customer.id_issued_date,
                id_issued_place: customer.id_issued_place || "",
                day_of_birth: customer.day_of_birth,
                description: customer.description || "",
                note: customer.note || "",
                is_active: customer.is_active ?? true,
            });
        } else {
            setFormData({
                customerName: "",
                email: "",
                phone: "",
                gender: "Male",
                address: "",
                website: "",
                assignee: "",
                type: "individual",
                company_name: "",
                tax_code: "",
                major: "",
                id_no: "",
                id_issued_by: "",
                id_issued_place: "",
                description: "",
                note: "",
                is_active: true,
            });
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
        return () => { isDisposed = true; };
    }, [customer, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
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

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? "Chỉnh sửa khách hàng" : "Thêm khách hàng mới"}
            size="xl"
            footer={
                <>
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>Hủy</Button>
                    <Button variant="primary" onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? <><Spinner size="sm" className="mr-2" />Đang xử lý...</> : isEditing ? "Cập nhật" : "Thêm mới"}
                    </Button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <FormSection title="Thông tin cơ bản">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Tên khách hàng *"
                            name="customerName"
                            value={formData.customerName || ""}
                            onChange={handleChange}
                            error={errors.customerName}
                            placeholder="Nhập tên khách hàng"
                            disabled={isLoading}
                            className="col-span-2"
                        />
                        <Select
                            label="Loại khách hàng"
                            name="type"
                            value={formData.type || "individual"}
                            onChange={handleChange}
                            options={typeOptions}
                            variant="default"
                            disabled={isLoading}
                        />
                        <Select
                            label="Giới tính"
                            name="gender"
                            value={formData.gender || "Male"}
                            onChange={handleChange}
                            options={genderOptions}
                            variant="default"
                            disabled={isLoading}
                        />
                        <Input
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email || ""}
                            onChange={handleChange}
                            error={errors.email}
                            placeholder="example@domain.com"
                            disabled={isLoading}
                        />
                        <Input
                            label="Số điện thoại"
                            name="phone"
                            value={formData.phone || ""}
                            onChange={handleChange}
                            error={errors.phone}
                            placeholder="Nhập số điện thoại"
                            disabled={isLoading}
                        />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                            <input
                                type="date"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                value={formatDateForInput(formData.day_of_birth)}
                                onChange={(e) => handleDateChange("day_of_birth", e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <Input
                            label="Ngành nghề"
                            name="major"
                            value={formData.major || ""}
                            onChange={handleChange}
                            placeholder="VD: Xây dựng, CNTT..."
                            disabled={isLoading}
                        />
                        <Input
                            label="Địa chỉ"
                            name="address"
                            value={formData.address || ""}
                            onChange={handleChange}
                            placeholder="Nhập địa chỉ"
                            className="col-span-2"
                            disabled={isLoading}
                        />
                        <Input
                            label="Website"
                            name="website"
                            value={formData.website || ""}
                            onChange={handleChange}
                            placeholder="https://example.com"
                            disabled={isLoading}
                        />
                        <Input
                            label="Người phụ trách"
                            name="assignee"
                            value={formData.assignee || ""}
                            onChange={handleChange}
                            placeholder="ID người phụ trách"
                            disabled={isLoading || isEditing}
                        />
                        <Select
                            label="Trạng thái"
                            name="is_active"
                            value={formData.is_active === false ? "false" : "true"}
                            onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.value === "true" }))}
                            options={activeOptions}
                            variant="default"
                            disabled={isLoading}
                        />
                    </div>
                </FormSection>

                {formData.type === "company" && (
                    <FormSection title="Thông tin doanh nghiệp">
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Tên công ty"
                                name="company_name"
                                value={formData.company_name || ""}
                                onChange={handleChange}
                                placeholder="Nhập tên công ty"
                                disabled={isLoading}
                                className="col-span-2"
                            />
                            <Input
                                label="Mã số thuế"
                                name="tax_code"
                                value={formData.tax_code || ""}
                                onChange={handleChange}
                                placeholder="Nhập mã số thuế"
                                disabled={isLoading}
                            />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày thành lập</label>
                                <input
                                    type="date"
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    value={formatDateForInput(formData.company_establish_date)}
                                    onChange={(e) => handleDateChange("company_establish_date", e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    </FormSection>
                )}

                {/* CMND/CCCD */}
                <FormSection title="CMND / CCCD">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Số CMND/CCCD"
                            name="id_no"
                            value={formData.id_no || ""}
                            onChange={handleChange}
                            placeholder="Nhập số CMND/CCCD"
                            disabled={isLoading}
                        />
                        <Input
                            label="Nơi cấp"
                            name="id_issued_by"
                            value={formData.id_issued_by || ""}
                            onChange={handleChange}
                            placeholder="VD: Công an TP.HCM"
                            disabled={isLoading}
                        />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày cấp</label>
                            <input
                                type="date"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                value={formatDateForInput(formData.id_issued_date)}
                                onChange={(e) => handleDateChange("id_issued_date", e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <Input
                            label="Địa điểm cấp"
                            name="id_issued_place"
                            value={formData.id_issued_place || ""}
                            onChange={handleChange}
                            placeholder="VD: TP.HCM"
                            disabled={isLoading}
                        />
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
                            disabled={isLoading}
                        />
                        <Input
                            label="Ghi chú"
                            name="note"
                            value={formData.note || ""}
                            onChange={handleChange}
                            placeholder="Ghi chú thêm"
                            disabled={isLoading}
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {groupOptions.map((group) => {
                                    const isChecked = selectedGroupIds.includes(group.id);
                                    return (
                                        <label
                                            key={group.id}
                                            className={`flex items-center gap-3 rounded-md border px-3 py-2 cursor-pointer transition-colors ${isChecked ? "border-primary-500 bg-primary-50" : "border-gray-200 hover:bg-gray-50"}`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => toggleGroupSelection(group.id)}
                                                disabled={isLoading}
                                                className="rounded border-gray-300"
                                            />
                                            <span className="text-sm text-gray-900">{group.name}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        )}
                        <p className="text-xs text-gray-500">Đã chọn {selectedGroupIds.length} nhóm.</p>
                    </div>
                </FormSection>
            </form>
        </Modal>
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
