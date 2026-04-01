"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";
import {
  mockDashboardStats,
  mockRevenueData,
  mockDealsByStage,
} from "@/lib/mock-data";
import {
  FiUsers,
  FiBriefcase,
  FiDollarSign,
  FiAlertCircle,
} from "react-icons/fi";

export default function DashboardPage() {
  const stats = mockDashboardStats;
  const stageLabelMap: Record<string, string> = {
    Prospecting: "Tiềm năng",
    Qualification: "Đánh giá",
    Proposal: "Đề xuất",
    Negotiation: "Đàm phán",
  };

  const statCards = [
    {
      title: "Tổng liên hệ",
      value: stats.totalContacts,
      icon: FiUsers,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Tổng công ty",
      value: stats.totalCompanies,
      icon: FiBriefcase,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Thương vụ đang mở",
      value: stats.activeDeals,
      icon: FiDollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Công việc quá hạn",
      value: stats.tasksOverdue,
      icon: FiAlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <p className="mt-1 text-gray-500">
          Chào mừng bạn quay lại! Đây là tình hình hôm nay.
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
            <CardTitle>Tổng quan doanh thu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Tổng doanh thu</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalRevenue)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tháng này</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.monthlyRevenue)}
                </p>
              </div>
              <div className="pt-4 border-t border-gray-200">
                {mockRevenueData.map((item) => (
                  <div key={item.month} className="flex justify-between py-2">
                    <span className="text-gray-600">{item.month}</span>
                    <span className="font-medium">
                      {formatCurrency(item.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thương vụ theo giai đoạn</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockDealsByStage.map((stage) => (
                <div key={stage.stage}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {stageLabelMap[stage.stage] ?? stage.stage}
                    </span>
                    <span className="text-sm text-gray-600">
                      {stage.count} thương vụ • {formatCurrency(stage.value)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${(stage.count / 31) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
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
              <p className="text-sm text-gray-600">Thương vụ chốt trong tháng</p>
              <p className="mt-2 text-2xl font-bold text-green-600">
                {stats.dealsWonThisMonth}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Công việc đến hạn hôm nay</p>
              <p className="mt-2 text-2xl font-bold text-blue-600">
                {stats.tasksDueToday}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Công việc quá hạn</p>
              <p className="mt-2 text-2xl font-bold text-red-600">
                {stats.tasksOverdue}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
