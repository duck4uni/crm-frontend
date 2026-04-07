"use client";

import { useState, useEffect, useCallback } from "react";
import { UserHistory } from "@/types/user";
import { UserHistoryApiRow } from "@/types/api";
import { userHistoryService } from "@/services/user-history";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { formatDateVN } from "@/lib/utils";
import { FiActivity, FiClock } from "react-icons/fi";

function mapApiRowToHistory(row: UserHistoryApiRow): UserHistory {
    return {
        id: row.id,
        user_id: row.user_id,
        title: row.title,
        note: row.note,
        created_at: row.created_at ? new Date(row.created_at) : new Date(),
        created_by: row.created_by || undefined,
        updated_at: row.created_at ? new Date(row.created_at) : new Date(),
    };
}

export function UserHistoryView() {
    const [histories, setHistories] = useState<UserHistory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userNames, setUserNames] = useState<Record<string, string>>({});

    const loadHistories = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await userHistoryService.getUserHistories({ pageSize: "50", sortField: "created_at", sortOrder: "DESC" });
            const rows = response.responseData?.rows ?? [];
            setHistories(rows.map(mapApiRowToHistory));

            const names: Record<string, string> = {};
            rows.forEach((r) => {
                if (r.user?.full_name) {
                    names[r.user_id] = r.user.full_name;
                }
            });
            setUserNames(names);
        } catch {
            setHistories([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadHistories();
    }, [loadHistories]);

    const getUserName = (userId: string) => {
        return userNames[userId] || userId;
    };

    if (isLoading) {
        return (
            <div className="bg-white border border-gray-200 rounded-lg p-6 text-sm text-gray-600">
                Đang tải lịch sử hoạt động...
            </div>
        );
    }

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
