import { Badge } from "@/components/ui/Badge";
import { JobApiRow, StatusApiRow } from "@/types/api";
import {
    FiBriefcase,
    FiClock,
    FiEdit2,
    FiEye,
    FiTrash2,
    FiUser,
    FiUsers,
} from "react-icons/fi";
import { getFormTimeFromApi, getStatusVariant } from "../utils/tasksHelpers";

type TasksTableProps = {
    jobs: JobApiRow[];
    statuses: StatusApiRow[];
    getPerformerLabel: (job: JobApiRow) => string;
    getCustomerLabel: (job: JobApiRow) => string;
    onOpenDetail: (job: JobApiRow) => void;
    onOpenEdit: (job: JobApiRow) => void;
    onRequestDelete: (job: JobApiRow) => void;
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

export function TasksTable({
    jobs,
    statuses,
    getPerformerLabel,
    getCustomerLabel,
    onOpenDetail,
    onOpenEdit,
    onRequestDelete,
}: TasksTableProps) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên công việc</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nội dung</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người thực hiện</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {jobs.map((job) => {
                        const jt = getFormTimeFromApi(job.job_time);
                        const status = resolveStatus(job, statuses);
                        return (
                            <tr key={job.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <FiBriefcase className="w-4 h-4 text-primary-500 mr-2 flex-shrink-0" />
                                        <span className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{job.job_name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-sm text-gray-600 truncate max-w-[250px]">{job.content}</p>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {jt.start || jt.end ? (
                                        <div className="flex items-center">
                                            <FiClock className="w-3.5 h-3.5 mr-1 text-gray-400" />
                                            <span>
                                                {jt.start ? new Date(jt.start).toLocaleDateString("vi-VN") : ""}
                                                {jt.start && jt.end ? " -> " : ""}
                                                {jt.end ? new Date(jt.end).toLocaleDateString("vi-VN") : ""}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {job.performer || job.performer_uuid ? (
                                        <div className="flex items-center text-sm text-gray-700">
                                            <FiUser className="w-3.5 h-3.5 mr-1 text-gray-400" />
                                            {getPerformerLabel(job)}
                                        </div>
                                    ) : (
                                        <span className="text-sm text-gray-400">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {job.customer || job.customer_uuid ? (
                                        <div className="flex items-center text-sm text-gray-700">
                                            <FiUsers className="w-3.5 h-3.5 mr-1 text-gray-400" />
                                            {getCustomerLabel(job)}
                                        </div>
                                    ) : (
                                        <span className="text-sm text-gray-400">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {status ? (
                                        <Badge variant={getStatusVariant(status.code, status.name)}>{status.name}</Badge>
                                    ) : job.status_id ? (
                                        <Badge variant="default">{job.status_id}</Badge>
                                    ) : (
                                        <span className="text-sm text-gray-400">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                onOpenDetail(job);
                                            }}
                                            className="p-1.5 text-primary-600 hover:bg-primary-50 rounded transition-colors"
                                            title="Xem chi tiết"
                                        >
                                            <FiEye className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                onOpenEdit(job);
                                            }}
                                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                            title="Chỉnh sửa"
                                        >
                                            <FiEdit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                onRequestDelete(job);
                                            }}
                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                                            title="Xóa"
                                        >
                                            <FiTrash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
