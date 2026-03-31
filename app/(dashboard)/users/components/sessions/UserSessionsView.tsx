"use client";

import { UserSession } from "@/types/user";
import { mockUserSessions, mockUsers } from "@/mock-data/users";
import { Badge } from "@/components/ui/Badge";
import { formatDateVN } from "@/lib/utils";
import { FiMonitor, FiClock, FiMapPin } from "react-icons/fi";

export function UserSessionsView() {
    const sessions = mockUserSessions;

    const getUserName = (userId: string) => {
        return mockUsers.find((u) => u.id === userId)?.full_name || userId;
    };

    const isExpired = (expire: Date) => new Date(expire) < new Date();

    return (
        <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Phiên đăng nhập</h3>
                    <Badge variant="info">{sessions.length} phiên</Badge>
                </div>

                <div className="space-y-3">
                    {sessions.map((session) => (
                        <div
                            key={session.id}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <FiMonitor className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {getUserName(session.user_id)}
                                    </p>
                                    <div className="flex items-center space-x-3 mt-1">
                                        <span className="flex items-center text-xs text-gray-500">
                                            <FiMapPin className="w-3 h-3 mr-1" />
                                            {session.ip_address}
                                        </span>
                                        <span className="flex items-center text-xs text-gray-500">
                                            <FiClock className="w-3 h-3 mr-1" />
                                            {formatDateVN(session.created_at)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-right">
                                {isExpired(session.expire) ? (
                                    <Badge variant="danger">Hết hạn</Badge>
                                ) : (
                                    <Badge variant="success">Hoạt động</Badge>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                    Hết hạn: {formatDateVN(session.expire)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
