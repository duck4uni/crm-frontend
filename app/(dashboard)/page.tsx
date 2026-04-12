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
  FiTrendingUp,
  FiAward,
} from "react-icons/fi";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { growthData, performanceData } from "@/mock-data/reports";

export default function DashboardPage() {
  const [userCount, setUserCount] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const [jobCount, setJobCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

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
      // silent fail - dashboard shows 0s
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Derived: conversion rate from weekly mock data
  const totalWeeklyCustomers = growthData.reduce((acc, d) => acc + d.customers, 0);
  const totalWeeklyConverted = growthData.reduce((acc, d) => acc + d.converted, 0);
  const conversionRate =
    totalWeeklyCustomers > 0
      ? Math.round((totalWeeklyConverted / totalWeeklyCustomers) * 100)
      : 0;

  // Split performance data by role
  const leaderData = performanceData.filter((p) => p.name.startsWith("Leader"));
  const workerData = performanceData.filter((p) => p.name.startsWith("Thợ"));

  // Pie chart data for conversion rate
  const pieData = [
    { name: "Đã chuyển đổi", value: totalWeeklyConverted },
    { name: "Chưa chuyển đổi", value: totalWeeklyCustomers - totalWeeklyConverted },
  ];
  const PIE_COLORS = ["#2563eb", "#e5e7eb"];

  const kpiCards = [
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
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div>
        <p className="mt-1 text-gray-500 text-sm">
          {isLoading ? "Đang tải dữ liệu..." : "Chào mừng bạn quay lại! Đây là tình hình hiện tại."}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="flex items-center justify-between pt-5">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="mt-1 text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="mt-1 text-xs text-gray-400">{stat.sub}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <Icon className={`w-7 h-7 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts row 1: Growth area + Conversion pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tăng trưởng khách hàng trong tuần</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={growthData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCustomers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorConverted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="customers"
                  name="Khách hàng"
                  stroke="#2563eb"
                  fill="url(#colorCustomers)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="converted"
                  name="Chuyển đổi"
                  stroke="#16a34a"
                  fill="url(#colorConverted)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tỷ lệ chuyển đổi</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={54}
                  outerRadius={78}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded-full bg-primary-600" />
                Đã chuyển đổi ({totalWeeklyConverted})
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded-full bg-gray-200" />
                Chưa ({totalWeeklyCustomers - totalWeeklyConverted})
              </span>
            </div>
            <p className="text-2xl font-bold text-primary-600">{conversionRate}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2: Leader vs Worker bar chart */}
      <Card>
        <CardHeader>
          <CardTitle>Hiệu suất nhân viên</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={performanceData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 12 }} unit="%" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="closedJobs" name="Công việc hoàn thành" fill="#2563eb" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="responseRate" name="Tỷ lệ phản hồi (%)" fill="#16a34a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance detail tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leader performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FiAward className="text-indigo-600" />
              Hiệu suất Leader
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Tên</th>
                  <th className="text-center px-4 py-2 font-medium text-gray-600">Việc hoàn thành</th>
                  <th className="text-center px-4 py-2 font-medium text-gray-600">Tỷ lệ phản hồi</th>
                </tr>
              </thead>
              <tbody>
                {leaderData.map((l) => (
                  <tr key={l.name} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{l.name}</td>
                    <td className="px-4 py-3 text-center text-primary-600 font-semibold">{l.closedJobs}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${l.responseRate >= 90 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                        {l.responseRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Worker performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FiCheckCircle className="text-green-600" />
              Hiệu suất Thợ
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Tên</th>
                  <th className="text-center px-4 py-2 font-medium text-gray-600">Việc hoàn thành</th>
                  <th className="text-center px-4 py-2 font-medium text-gray-600">Tỷ lệ phản hồi</th>
                </tr>
              </thead>
              <tbody>
                {workerData.map((w) => (
                  <tr key={w.name} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{w.name}</td>
                    <td className="px-4 py-3 text-center text-primary-600 font-semibold">{w.closedJobs}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${w.responseRate >= 90 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                        {w.responseRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
