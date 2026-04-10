"use client";

import { useState, useEffect } from "react";
import { Customer, CustomerStatus } from "@/types/customer";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { tagsService } from "@/services/tags";
import { customerTagsService } from "@/services/customer-tags";

interface CustomerFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (customer: Partial<Customer>, groupIds: string[]) => Promise<void>;
    customer?: Customer | null; // If provided, we're editing; otherwise, creating
}

interface GroupOption {
    id: string;
    name: string;
}

const SOURCE_LABELS: Record<string, string> = {
    Referral: "Giới thiệu",
    "Google Ads": "Quảng cáo Google",
    "Walk-in": "Khách đến trực tiếp",
    Website: "Trang web",
    Email: "Thư điện tử",
};

const CUSTOMER_SOURCE_LABELS: Record<string, string> = {
    "Data Import": "Nhập dữ liệu",
    "Google Ads": "Quảng cáo Google",
    "Walk-in": "Khách đến trực tiếp",
    "Email Marketing": "Tiếp thị email",
    Website: "Trang web",
    Email: "Thư điện tử",
};

const ASSIGNEE_LABELS: Record<string, string> = {
    "Getfly Admin": "Quản trị viên Getfly",
};

const RELATIONSHIP_LABELS: Record<string, string> = {
    Data2: "Dữ liệu nhóm 2",
    Data3: "Dữ liệu nhóm 3",
};

export function CustomerFormModal({
    isOpen,
    onClose,
    onSave,
    customer,
}: CustomerFormModalProps) {
    const isEditing = !!customer;

    // Form state
    const [formData, setFormData] = useState<Partial<Customer>>({
        customerName: "",
        email: "",
        salutation: "Anh",
        phone: "",
        mobilePhone: "",
        address: "",
        source: "",
        assignee: "",
        relationship: "",
        customerSource: "",
        gender: "Male",
        status: CustomerStatus.NEW,
        sessionCount: 0,
        remainingSessions: 0,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [groupOptions, setGroupOptions] = useState<GroupOption[]>([]);
    const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
    const [isLoadingGroups, setIsLoadingGroups] = useState(false);

    // Initialize form with customer data if editing
    useEffect(() => {
        if (!isOpen) {
            return;
        }

        if (customer) {
            setFormData({
                ...customer,
                email: customer.email || "",
                source: SOURCE_LABELS[customer.source] ?? customer.source,
                customerSource: CUSTOMER_SOURCE_LABELS[customer.customerSource || ""] ?? customer.customerSource,
                assignee: ASSIGNEE_LABELS[customer.assignee] ?? customer.assignee,
                relationship: RELATIONSHIP_LABELS[customer.relationship || ""] ?? customer.relationship,
            });
        } else {
            // Reset form for new customer
            setFormData({
                customerName: "",
                email: "",
                salutation: "Anh",
                phone: "",
                mobilePhone: "",
                address: "",
                source: "",
                assignee: "",
                relationship: "",
                customerSource: "",
                gender: "Male",
                status: CustomerStatus.NEW,
                sessionCount: 0,
                remainingSessions: 0,
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

                if (isDisposed) {
                    return;
                }

                const groups = (tagsResponse.responseData?.rows || [])
                    .map((tag) => ({ id: tag.id, name: tag.name }))
                    .sort((a, b) => a.name.localeCompare(b.name, "vi"));

                const nextSelectedIds = customerTagsResponse?.responseData?.rows
                    ? Array.from(new Set(customerTagsResponse.responseData.rows.map((row) => row.tag_id)))
                    : [];

                setGroupOptions(groups);
                setSelectedGroupIds(nextSelectedIds);
            } catch {
                if (isDisposed) {
                    return;
                }

                setGroupOptions([]);
                setSelectedGroupIds([]);
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
    }, [customer, isOpen]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.customerName?.trim()) {
            newErrors.customerName = "Tên khách hàng là bắt buộc";
        }

        if (!formData.email?.trim()) {
            newErrors.email = "Email là bắt buộc";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
            newErrors.email = "Email không hợp lệ";
        }

        if (!formData.mobilePhone?.trim()) {
            newErrors.mobilePhone = "Số di động là bắt buộc";
        } else if (!/^[0-9]{10,11}$/.test(formData.mobilePhone.trim())) {
            newErrors.mobilePhone = "Số di động không hợp lệ (10-11 chữ số)";
        }

        if (!formData.source?.trim()) {
            newErrors.source = "Nguồn là bắt buộc";
        }

        if (!formData.assignee?.trim()) {
            newErrors.assignee = "Người phụ trách là bắt buộc";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        setIsLoading(true);
        try {
            const customerData: Partial<Customer> = {
                ...formData,
                email: formData.email?.trim(),
                ...(isEditing ? {} : { createdDate: new Date() }),
            };

            await onSave(customerData, selectedGroupIds);
            onClose();
        } catch {
            // Parent handles toast/error display.
        } finally {
            setIsLoading(false);
        }
    };

    const toggleGroupSelection = (groupId: string) => {
        setSelectedGroupIds((prev) =>
            prev.includes(groupId)
                ? prev.filter((id) => id !== groupId)
                : [...prev, groupId],
        );
    };

    const salutationOptions = [
        { value: "Anh", label: "Anh" },
        { value: "Chị", label: "Chị" },
        { value: "Ông", label: "Ông" },
        { value: "Bà", label: "Bà" },
        { value: "Cô", label: "Cô" },
    ];

    const genderOptions = [
        { value: "Male", label: "Nam" },
        { value: "Female", label: "Nữ" },
        { value: "Other", label: "Khác" },
    ];

    const statusOptions = Object.values(CustomerStatus)
        .map((status) => ({
            value: status,
            label: getStatusLabel(status),
        }));

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? "Chỉnh sửa khách hàng" : "Thêm khách hàng mới"}
            size="xl"
            footer={
                <>
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                        Hủy
                    </Button>
                    <Button variant="primary" onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Spinner size="sm" className="mr-2" />
                                Đang xử lý...
                            </>
                        ) : (
                            isEditing ? "Cập nhật" : "Thêm mới"
                        )}
                    </Button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Thông tin cơ bản
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Tên khách hàng *"
                            name="customerName"
                            value={formData.customerName}
                            onChange={handleChange}
                            error={errors.customerName}
                            placeholder="Nhập tên khách hàng"
                            disabled={isLoading}
                        />

                        <Select
                            label="Danh xưng"
                            name="salutation"
                            value={formData.salutation}
                            onChange={handleChange}
                            options={salutationOptions}
                            variant="default"
                            disabled={isLoading}
                        />

                        <Input
                            label="Email *"
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
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Nhập số điện thoại"
                            disabled={isLoading}
                        />

                        <Input
                            label="Số di động *"
                            name="mobilePhone"
                            value={formData.mobilePhone}
                            onChange={handleChange}
                            error={errors.mobilePhone}
                            placeholder="Nhập số di động"
                            disabled={isLoading}
                        />

                        <Select
                            label="Giới tính"
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            options={genderOptions}
                            variant="default"
                            disabled={isLoading}
                        />

                        <Input
                            label="Địa chỉ"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Nhập địa chỉ"
                            className="col-span-2"
                            disabled={isLoading}
                        />
                    </div>
                </div>

                {/* Source & Assignment */}
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Nguồn & Phân công
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Nguồn *"
                            name="source"
                            value={formData.source}
                            onChange={handleChange}
                            error={errors.source}
                            placeholder="VD: Facebook, Trang web, Giới thiệu..."
                            disabled={isLoading}
                        />

                        <Input
                            label="Nguồn khách hàng"
                            name="customerSource"
                            value={formData.customerSource}
                            onChange={handleChange}
                            placeholder="Chi tiết nguồn khách hàng"
                            disabled={isLoading}
                        />

                        <Input
                            label="Người phụ trách *"
                            name="assignee"
                            value={formData.assignee}
                            onChange={handleChange}
                            error={errors.assignee}
                            placeholder="Nhập tên người phụ trách"
                            disabled={isLoading}
                        />

                        <Input
                            label="Mối quan hệ"
                            name="relationship"
                            value={formData.relationship}
                            onChange={handleChange}
                            placeholder="VD: Khách hàng mới, Khách cũ..."
                            disabled={isLoading}
                        />
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Nhóm khách hàng</h3>

                    <div className="rounded-lg border border-gray-200 p-4 space-y-3">
                        <p className="text-sm text-gray-600">
                            Có thể chọn 1 hoặc nhiều nhóm cho mỗi khách hàng.
                        </p>

                        {isLoadingGroups && (
                            <p className="text-sm text-gray-500">Đang tải danh sách nhóm...</p>
                        )}

                        {!isLoadingGroups && groupOptions.length === 0 && (
                            <p className="text-sm text-gray-500">
                                Chưa có nhóm khách hàng. Vui lòng tạo nhóm trong mục Quản lý nhóm khách hàng.
                            </p>
                        )}

                        {!isLoadingGroups && groupOptions.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {groupOptions.map((group) => {
                                    const isChecked = selectedGroupIds.includes(group.id);

                                    return (
                                        <label
                                            key={group.id}
                                            className={`
                                                flex items-center gap-3 rounded-md border px-3 py-2 cursor-pointer transition-colors
                                                ${isChecked ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}
                                            `}
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

                        <p className="text-xs text-gray-500">
                            Đã chọn {selectedGroupIds.length} nhóm.
                        </p>
                    </div>
                </div>

                {/* Status & Sessions */}
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Trạng thái & Buổi học
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                        <Select
                            label="Trạng thái"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            options={statusOptions}
                            variant="default"
                            disabled={isLoading}
                        />

                        <Input
                            label="Buổi học"
                            name="sessionCount"
                            type="number"
                            value={formData.sessionCount}
                            onChange={handleChange}
                            placeholder="0"
                            min="0"
                            disabled={isLoading}
                        />

                        <Input
                            label="Số buổi còn lại"
                            name="remainingSessions"
                            type="number"
                            value={formData.remainingSessions}
                            onChange={handleChange}
                            placeholder="0"
                            min="0"
                            disabled={isLoading}
                        />
                    </div>
                </div>
            </form>
        </Modal>
    );
}

// Helper function to get status labels
function getStatusLabel(status: CustomerStatus): string {
    const labels: Record<CustomerStatus, string> = {
        [CustomerStatus.NEW]: "Đang mới",
        [CustomerStatus.QUOTED]: "Dự báo giá",
        [CustomerStatus.CONTACTED]: "Đã liên hệ",
        [CustomerStatus.NOT_CONTACTED]: "Chưa liên hệ được",
        [CustomerStatus.TESTED]: "Đã test đầu vào",
        [CustomerStatus.REGISTERED]: "Đã đăng ký",
        [CustomerStatus.CONSIDERING]: "Đang cân nhắc",
        [CustomerStatus.UPSELL]: "Bán thêm",
        [CustomerStatus.APPROACHED]: "Đã tiếp cận",
        [CustomerStatus.SURVEYED]: "Khảo sát",
    };
    return labels[status] || status;
}
