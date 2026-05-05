import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { JobApiRow, StatusApiRow } from "@/types/api";
import {
    FiEdit2,
    FiUser,
    FiUsers,
    FiCalendar,
    FiAlignLeft,
    FiMessageSquare,
    FiClipboard,
} from "react-icons/fi";
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
    if (job.status) return job.status;
    if (!job.status_id) return null;
    return statuses.find((s) => s.id === job.status_id) ?? null;
}

function StatusBadge({ name }: { name: string }) {
    const lower = name.toLowerCase();
    let cls = "bg-gray-100 text-gray-600";
    if (lower.includes("chờ") || lower.includes("pending")) cls = "bg-amber-100 text-amber-700";
    else if (lower.includes("đang") || lower.includes("progress")) cls = "bg-blue-100 text-blue-700";
    else if (lower.includes("hoàn") || lower.includes("done") || lower.includes("complete")) cls = "bg-green-100 text-green-700";
    else if (lower.includes("huỷ") || lower.includes("cancel")) cls = "bg-red-100 text-red-600";
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
            {name}
        </span>
    );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                {icon}
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
                <div className="mt-0.5 text-sm font-medium text-gray-800">{value}</div>
            </div>
        </div>
    );
}

function SectionDivider({ label }: { label: string }) {
    return (
        <div className="flex items-center gap-2 py-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{label}</span>
            <div className="flex-1 border-t border-gray-100" />
        </div>
    );
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
                            onClick={() => { onClose(); onEdit(selectedJob); }}
                        >
                            <FiEdit2 className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                        </Button>
                    )}
                </>
            }
        >
            {selectedJob && (() => {
                const jt = getFormTimeFromApi(selectedJob.job_time);
                const status = resolveStatus(selectedJob, statuses);
                const startStr = jt.start ? new Date(jt.start).toLocaleString("vi-VN") : null;
                const endStr = jt.end ? new Date(jt.end).toLocaleString("vi-VN") : null;

                return (
                    <div className="space-y-5">
                        {/* Title + status */}
                        <div className="flex items-start justify-between gap-3 rounded-xl bg-gray-50 px-4 py-3">
                            <div className="min-w-0">
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-1">Tên công việc</p>
                                <p className="text-base font-semibold text-gray-900 leading-snug">
                                    {selectedJob.job_name}
                                </p>
                            </div>
                            {status && <StatusBadge name={status.name} />}
                        </div>

                        {/* Content & Note */}
                        <div className="space-y-3">
                            <SectionDivider label="Nội dung" />
                            <InfoRow
                                icon={<FiAlignLeft className="h-4 w-4" />}
                                label="Nội dung"
                                value={
                                    <p className="whitespace-pre-wrap text-gray-700">
                                        {selectedJob.content || <span className="text-gray-400 italic">Chưa có</span>}
                                    </p>
                                }
                            />
                            {selectedJob.note && (
                                <InfoRow
                                    icon={<FiMessageSquare className="h-4 w-4" />}
                                    label="Ghi chú"
                                    value={<p className="whitespace-pre-wrap text-gray-700">{selectedJob.note}</p>}
                                />
                            )}
                        </div>

                        {/* Time */}
                        <div className="space-y-3">
                            <SectionDivider label="Thời gian" />
                            <div className="grid grid-cols-2 gap-4">
                                <InfoRow
                                    icon={<FiCalendar className="h-4 w-4" />}
                                    label="Bắt đầu"
                                    value={startStr ?? <span className="text-gray-400 italic">Chưa đặt</span>}
                                />
                                <InfoRow
                                    icon={<FiCalendar className="h-4 w-4" />}
                                    label="Kết thúc"
                                    value={endStr ?? <span className="text-gray-400 italic">Chưa đặt</span>}
                                />
                            </div>
                        </div>

                        {/* Assignee & Customer */}
                        <div className="space-y-3">
                            <SectionDivider label="Phân công" />
                            <div className="grid grid-cols-2 gap-4">
                                <InfoRow
                                    icon={<FiUsers className="h-4 w-4" />}
                                    label="Người thực hiện"
                                    value={getPerformerLabel(selectedJob) || <span className="text-gray-400 italic">Chưa gán</span>}
                                />
                                <InfoRow
                                    icon={<FiUser className="h-4 w-4" />}
                                    label="Khách hàng"
                                    value={getCustomerLabel(selectedJob) || <span className="text-gray-400 italic">Chưa gán</span>}
                                />
                            </div>
                        </div>

                        {/* Meta */}
                        {selectedJob.created_by && (
                            <div className="space-y-3">
                                <SectionDivider label="Thông tin khác" />
                                <InfoRow
                                    icon={<FiClipboard className="h-4 w-4" />}
                                    label="Người tạo"
                                    value={getUserNameById(selectedJob.created_by) ?? selectedJob.created_by}
                                />
                            </div>
                        )}
                    </div>
                );
            })()}
        </Modal>
    );
}
