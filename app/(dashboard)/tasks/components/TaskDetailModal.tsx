import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { JobApiRow, StatusApiRow } from "@/types/api";
import { FiEdit2 } from "react-icons/fi";
import { getFormTimeFromApi } from "../utils/tasksHelpers";

type TaskDetailModalProps = {
    isOpen: boolean;
    selectedJob: JobApiRow | null;
    statuses: StatusApiRow[];
    getPerformerLabel: (job: JobApiRow) => string;
    getCustomerLabel: (job: JobApiRow) => string;
    getUserNameById: (id: string | null | undefined) => string | null;
    onClose: () => void;
    onEdit: (job: JobApiRow) => void;
};

function resolveStatus(job: JobApiRow, statuses: StatusApiRow[]) {
    if (job.status) {
        return job.status;
    }

    if (!job.status_id) {
        return null;
    }

    return statuses.find((status) => status.id === job.status_id) ?? null;
}

export function TaskDetailModal({
    isOpen,
    selectedJob,
    statuses,
    getPerformerLabel,
    getCustomerLabel,
    getUserNameById,
    onClose,
    onEdit,
}: TaskDetailModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Chi tiết công việc"
            size="lg"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>Đóng</Button>
                    {selectedJob && (
                        <Button
                            variant="primary"
                            onClick={() => {
                                onClose();
                                onEdit(selectedJob);
                            }}
                        >
                            <FiEdit2 className="w-4 h-4 mr-2" />
                            Chỉnh sửa
                        </Button>
                    )}
                </>
            }
        >
            {selectedJob && (() => {
                const jt = getFormTimeFromApi(selectedJob.job_time);
                const status = resolveStatus(selectedJob, statuses);
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Tên công việc</label>
                            <p className="text-sm text-gray-900">{selectedJob.job_name}</p>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Nội dung</label>
                            <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedJob.content}</p>
                        </div>
                        {selectedJob.note && (
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Ghi chú</label>
                                <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedJob.note}</p>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Thời gian bắt đầu</label>
                                <p className="text-sm text-gray-900">
                                    {jt.start ? new Date(jt.start).toLocaleString("vi-VN") : "Chưa đặt"}
                                </p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Thời gian kết thúc</label>
                                <p className="text-sm text-gray-900">
                                    {jt.end ? new Date(jt.end).toLocaleString("vi-VN") : "Chưa đặt"}
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Người thực hiện</label>
                                <p className="text-sm text-gray-900">{getPerformerLabel(selectedJob)}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Khách hàng</label>
                                <p className="text-sm text-gray-900">{getCustomerLabel(selectedJob)}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Trạng thái</label>
                                <p className="text-sm text-gray-900">{status?.name ?? selectedJob.status_id ?? "Không có"}</p>
                            </div>
                        </div>
                        {selectedJob.created_by && (
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Người tạo</label>
                                <p className="text-sm text-gray-900">{getUserNameById(selectedJob.created_by) ?? selectedJob.created_by}</p>
                            </div>
                        )}
                    </div>
                );
            })()}
        </Modal>
    );
}
