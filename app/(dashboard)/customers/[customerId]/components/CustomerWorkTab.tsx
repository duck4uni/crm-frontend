import { Badge } from "@/components/ui/Badge";
import { formatDateVNDateOnly } from "@/lib/utils";
import { JobApiRow } from "@/types/api";
import {
    getJobPerformerLabel,
    getJobStatusVariant,
    getJobTimeRange,
} from "../utils/customerDetailMappers";

type CustomerWorkTabProps = {
    workJobs: JobApiRow[];
    isLoadingWorkJobs: boolean;
    assignerNameById: Record<string, string>;
};

export function CustomerWorkTab({
    workJobs,
    isLoadingWorkJobs,
    assignerNameById,
}: CustomerWorkTabProps) {
    return (
        <div className="space-y-3">
            {isLoadingWorkJobs && <div className="text-sm text-gray-500">Đang tải lịch sử công việc...</div>}

            {!isLoadingWorkJobs && workJobs.length === 0 && (
                <div className="border border-dashed border-gray-300 rounded-lg p-6 text-sm text-gray-500">
                    Chưa có công việc nào thuộc khách hàng này.
                </div>
            )}

            {!isLoadingWorkJobs &&
                workJobs.map((item) => {
                    const timeRange = getJobTimeRange(item.job_time);
                    const statusName = item.status?.name || "Không có trạng thái";
                    const assignerLabel = item.created_by
                        ? assignerNameById[item.created_by] || item.created_by
                        : "Không rõ";

                    return (
                        <div key={item.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                                <p className="text-sm font-semibold text-gray-900">{item.job_name}</p>
                                <div className="flex items-center gap-2">
                                    <Badge variant={getJobStatusVariant(statusName)}>{statusName}</Badge>
                                </div>
                            </div>
                            <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.content || "-"}</p>
                                {item.note && <p className="text-sm text-gray-600 whitespace-pre-wrap mt-2">Ghi chú: {item.note}</p>}
                            </div>
                            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600">
                                <p>Người thực hiện: {getJobPerformerLabel(item)}</p>
                                <p>Người giao: {assignerLabel}</p>
                                <p className="md:col-span-2">
                                    Thời gian: {timeRange.start ? formatDateVNDateOnly(new Date(timeRange.start)) : "-"}
                                    {timeRange.start && timeRange.end ? " -> " : ""}
                                    {timeRange.end ? formatDateVNDateOnly(new Date(timeRange.end)) : ""}
                                </p>
                            </div>
                        </div>
                    );
                })}
        </div>
    );
}
