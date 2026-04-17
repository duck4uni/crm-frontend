import { Activity } from "lucide-react";
import { formatDateVN } from "@/lib/utils";
import { UserHistoryApiRow } from "@/types/api";

type UserActivityTabProps = {
    activities: UserHistoryApiRow[];
    isLoadingActivities: boolean;
};

export function UserActivityTab({ activities, isLoadingActivities }: UserActivityTabProps) {
    return (
        <div className="space-y-3">
            {isLoadingActivities && <div className="text-sm text-gray-500">Đang tải lịch sử hoạt động...</div>}

            {!isLoadingActivities && activities.length === 0 && (
                <div className="border border-dashed border-gray-300 rounded-lg p-6 text-sm text-gray-500">
                    Chưa có dữ liệu lịch sử hoạt động cho người dùng này.
                </div>
            )}

            {!isLoadingActivities &&
                activities.map((item) => (
                    <div key={item.id} className="rounded-lg border border-gray-200 p-3 bg-white">
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                            <span className="text-xs text-gray-500 flex items-center">
                                <Activity className="w-3.5 h-3.5 mr-1" />
                                {item.created_at ? formatDateVN(new Date(item.created_at)) : "-"}
                            </span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{item.note || "-"}</p>
                    </div>
                ))}
        </div>
    );
}
