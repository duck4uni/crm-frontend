import { useCallback, useEffect, useMemo, useState } from "react";
import {
    FiBell,
    FiBriefcase,
    FiTrendingUp,
    FiUsers,
} from "react-icons/fi";
import { growthData, performanceData } from "@/mock-data/reports";
import { jobsService } from "@/services/jobs";
import { notificationsService } from "@/services/notifications";
import { usersService } from "@/services/users";
import { useStableToastRef } from "@/hooks/useStableToastRef";

export function useDashboardPage() {
    const [userCount, setUserCount] = useState(0);
    const [customerCount, setCustomerCount] = useState(0);
    const [jobCount, setJobCount] = useState(0);
    const [notificationCount, setNotificationCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const toastRef = useStableToastRef();

    const loadDashboardData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [usersRes, customerCountRes, jobsRes, notifs] = await Promise.all([
                usersService.getUsers({ pageSize: "1" }),
                usersService.getCustomerCount(),
                jobsService.getJobs({ pageSize: "1" }),
                notificationsService.getMyNotifications(),
            ]);
            setUserCount(usersRes.responseData?.count ?? 0);
            setCustomerCount(customerCountRes.responseData?.count ?? 0);
            setJobCount(jobsRes.responseData?.count ?? 0);
            setNotificationCount(notifs.filter((n) => !n.has_user_read).length);
        } catch {
            // Silent fallback with zeros keeps dashboard renderable.
            toastRef.current.warning("Dữ liệu chưa đầy đủ", "Không thể tải đầy đủ số liệu dashboard.");
        } finally {
            setIsLoading(false);
        }
    }, [toastRef]);

    useEffect(() => {
        void loadDashboardData();
    }, [loadDashboardData]);

    const totalWeeklyCustomers = useMemo(
        () => growthData.reduce((acc, d) => acc + d.customers, 0),
        [],
    );
    const totalWeeklyConverted = useMemo(
        () => growthData.reduce((acc, d) => acc + d.converted, 0),
        [],
    );
    const conversionRate =
        totalWeeklyCustomers > 0
            ? Math.round((totalWeeklyConverted / totalWeeklyCustomers) * 100)
            : 0;

    const leaderData = useMemo(
        () => performanceData.filter((p) => p.name.startsWith("Leader")),
        [],
    );
    const workerData = useMemo(
        () => performanceData.filter((p) => p.name.startsWith("Thợ")),
        [],
    );

    const pieData = useMemo(
        () => [
            { name: "Đã chuyển đổi", value: totalWeeklyConverted },
            { name: "Chưa chuyển đổi", value: totalWeeklyCustomers - totalWeeklyConverted },
        ],
        [totalWeeklyConverted, totalWeeklyCustomers],
    );

    const kpiCards = useMemo(
        () => [
            {
                title: "Tổng khách hàng",
                value: customerCount,
                icon: FiUsers,
                color: "text-primary-600",
                bgColor: "bg-primary-100",
                sub: `${userCount} người dùng hệ thống`,
            },
            {
                title: "Tổng công việc",
                value: jobCount,
                icon: FiBriefcase,
                color: "text-indigo-600",
                bgColor: "bg-indigo-100",
                sub: "Tất cả trạng thái",
            },
            {
                title: "Tỷ lệ chuyển đổi",
                value: `${conversionRate}%`,
                icon: FiTrendingUp,
                color: "text-green-600",
                bgColor: "bg-green-100",
                sub: `${totalWeeklyConverted}/${totalWeeklyCustomers} tuần này`,
            },
            {
                title: "Thông báo chưa đọc",
                value: notificationCount,
                icon: FiBell,
                color: "text-red-600",
                bgColor: "bg-red-100",
                sub: "Cần xử lý",
            },
        ],
        [conversionRate, customerCount, jobCount, notificationCount, totalWeeklyConverted, totalWeeklyCustomers, userCount],
    );

    return {
        isLoading,
        kpiCards,
        conversionRate,
        totalWeeklyCustomers,
        totalWeeklyConverted,
        leaderData,
        workerData,
        pieData,
    };
}
