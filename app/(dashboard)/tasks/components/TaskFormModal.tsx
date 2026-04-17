import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { JobFormData } from "../types";

type SelectOption = {
    value: string;
    label: string;
};

type TaskFormModalProps = {
    isOpen: boolean;
    isEditing: boolean;
    formData: JobFormData;
    performerOptions: SelectOption[];
    customerOptions: SelectOption[];
    statusOptions: SelectOption[];
    onClose: () => void;
    onChange: (nextData: JobFormData) => void;
    onSubmit: () => void;
};

export function TaskFormModal({
    isOpen,
    isEditing,
    formData,
    performerOptions,
    customerOptions,
    statusOptions,
    onClose,
    onChange,
    onSubmit,
}: TaskFormModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? "Chỉnh sửa công việc" : "Tạo công việc mới"}
            size="lg"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>Hủy</Button>
                    <Button variant="primary" onClick={onSubmit}>{isEditing ? "Cập nhật" : "Tạo mới"}</Button>
                </>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên công việc *</label>
                    <Input
                        value={formData.job_name}
                        onChange={(e) => onChange({ ...formData, job_name: e.target.value })}
                        placeholder="Nhập tên công việc"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung *</label>
                    <textarea
                        value={formData.content}
                        onChange={(e) => onChange({ ...formData, content: e.target.value })}
                        placeholder="Nhập nội dung công việc"
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                    <textarea
                        value={formData.note}
                        onChange={(e) => onChange({ ...formData, note: e.target.value })}
                        placeholder="Nhập ghi chú (nếu có)"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian bắt đầu</label>
                        <Input
                            type="datetime-local"
                            value={formData.job_time.start ?? ""}
                            onChange={(e) =>
                                onChange({
                                    ...formData,
                                    job_time: { ...formData.job_time, start: e.target.value },
                                })
                            }
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian kết thúc</label>
                        <Input
                            type="datetime-local"
                            value={formData.job_time.end ?? ""}
                            onChange={(e) =>
                                onChange({
                                    ...formData,
                                    job_time: { ...formData.job_time, end: e.target.value },
                                })
                            }
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Người thực hiện</label>
                    <select
                        value={formData.performer_uuid}
                        onChange={(e) => onChange({ ...formData, performer_uuid: e.target.value })}
                        className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                    >
                        <option value="">Không chọn</option>
                        {performerOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Khách hàng</label>
                    <select
                        value={formData.customer_uuid}
                        onChange={(e) => onChange({ ...formData, customer_uuid: e.target.value })}
                        className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                    >
                        <option value="">Không chọn</option>
                        {customerOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                {isEditing && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                        <select
                            value={formData.status_id}
                            onChange={(e) => onChange({ ...formData, status_id: e.target.value })}
                            className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                        >
                            {statusOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>
        </Modal>
    );
}
