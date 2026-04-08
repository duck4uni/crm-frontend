"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { usersService } from "@/services/users";
import { jobsService } from "@/services/jobs";
import { notificationsService } from "@/services/notifications";
import {
  FiUsers,
  FiBriefcase,
  FiCheckCircle,
  FiBell,
} from "react-icons/fi";

export default function DashboardPage() {
  const [userCount, setUserCount] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const [customerTagGroupCount, setCustomerTagGroupCount] = useState(0);
  const [jobCount, setJobCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [usersRes, customerCountRes, customerTagRes, jobsRes, notifs] = await Promise.all([
        usersService.getUsers({ pageSize: "1" }),
        usersService.getCustomerCount(),
        usersService.getCustomerTagStatistic(),
        jobsService.getJobs({ pageSize: "1" }),
        notificationsService.getMyNotifications(),
      ]);
      setUserCount(usersRes.responseData?.count ?? 0);
      setCustomerCount(customerCountRes.responseData?.count ?? 0);
      setCustomerTagGroupCount(customerTagRes.responseData?.length ?? 0);
      setJobCount(jobsRes.responseData?.count ?? 0);
      setNotificationCount(notifs.filter((n) => !n.has_user_read).length);
    } catch {
      // silent fail - dashboard shows 0s
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const statCards = [
    {
      title: "Tổng người dùng",
      value: userCount,
      icon: FiUsers,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Tổng khách hàng",
      value: customerCount,
      icon: FiBriefcase,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Tổng công việc",
      value: jobCount,
      icon: FiCheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Thông báo chưa đọc",
      value: notificationCount,
      icon: FiBell,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      title: "Nhóm tag khách hàng",
      value: customerTagGroupCount,
      icon: FiUsers,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <p className="mt-1 text-gray-500">
          {isLoading ? "Đang tải dữ liệu..." : "Chào mừng bạn quay lại! Đây là tình hình hôm nay."}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Revenue & Deals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Thống kê khách hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Tổng khách hàng</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customerCount}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Nhóm tag khách hàng</p>
                <p className="text-2xl font-bold text-amber-600">
                  {customerTagGroupCount}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tổng người dùng</p>
                <p className="text-2xl font-bold text-green-600">
                  {userCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tổng quan công việc</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">Tổng công việc</span>
                <span className="text-sm text-gray-600">{jobCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">Thông báo chưa đọc</span>
                <span className="text-sm text-gray-600">{notificationCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Chỉ số nhanh</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600">Người dùng</p>
              <p className="mt-2 text-2xl font-bold text-blue-600">
                {userCount}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Khách hàng</p>
              <p className="mt-2 text-2xl font-bold text-purple-600">
                {customerCount}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Nhóm tag khách hàng</p>
              <p className="mt-2 text-2xl font-bold text-amber-600">
                {customerTagGroupCount}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Công việc</p>
              <p className="mt-2 text-2xl font-bold text-green-600">
                {jobCount}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
