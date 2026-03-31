"use client";

import { UserHistory } from "@/types/user";
import { mockUserHistories, mockUsers } from "@/mock-data/users";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { formatDateVN } from "@/lib/utils";
import { FiActivity, FiClock } from "react-icons/fi";

export function UserHistoryView() {
    const histories = mockUserHistories;

    const getUserName = (userId: string) => {
        return mockUsers.find((u) => u.id === userId)?.full_name || userId;
    };

    return (
        <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Lịch sử hoạt động</h3>
                    <Badge variant="info">{histories.length} hoạt động</Badge>
                </div>

                {/* Timeline */}
                <div className="relative">
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

                    <div className="space-y-4">
                        {histories.map((history) => (
                            <div key={history.id} className="relative flex items-start space-x-4 pl-2">
                                {/* Timeline dot */}
                                <div className="relative z-10 flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full border-2 border-white shadow-sm">
                                    <FiActivity className="w-4 h-4 text-blue-600" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 bg-gray-50 rounded-lg p-4 border border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-medium text-gray-900">{history.title}</h4>
                                        <span className="flex items-center text-xs text-gray-500">
                                            <FiClock className="w-3 h-3 mr-1" />
                                            {formatDateVN(history.created_at)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{history.note}</p>
                                    <div className="flex items-center space-x-2 mt-2">
                                        <Avatar name={getUserName(history.user_id)} size="sm" />
                                        <span className="text-xs text-gray-500">
                                            {getUserName(history.user_id)}
                                        </span>
                                        {history.created_by && (
                                            <span className="text-xs text-gray-400">
                                                • Bởi {getUserName(history.created_by)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
