"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { mockDeals } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { FiPlus, FiSearch } from "react-icons/fi";

const stageColors: Record<string, "default" | "info" | "warning" | "success" | "danger"> =
{
  prospecting: "default",
  qualification: "info",
  proposal: "warning",
  negotiation: "warning",
  closed_won: "success",
  closed_lost: "danger",
};

const stageLabels: Record<string, string> = {
  prospecting: "Tiềm năng",
  qualification: "Đánh giá",
  proposal: "Đề xuất",
  negotiation: "Đàm phán",
  closed_won: "Chốt thành công",
  closed_lost: "Chốt thất bại",
};

export default function DealsPage() {
  const [deals] = useState(mockDeals);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDeals = deals.filter((deal) =>
    deal.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="mt-1 text-gray-500">
            Theo dõi và quản lý toàn bộ phễu bán hàng
          </p>
        </div>
        <Button>
          <FiPlus className="w-5 h-5 mr-2" />
          Thêm thương vụ
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent>
            <p className="text-sm text-gray-600">Tổng thương vụ</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {deals.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-gray-600">Tổng giá trị</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {formatCurrency(deals.reduce((sum, deal) => sum + deal.value, 0))}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-gray-600">Giá trị trung bình</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {formatCurrency(
                deals.reduce((sum, deal) => sum + deal.value, 0) / deals.length,
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-gray-600">Tỷ lệ chốt</p>
            <p className="mt-2 text-2xl font-bold text-green-600">0%</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm thương vụ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">Lọc</Button>
        </CardContent>
      </Card>

      {/* Deals List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredDeals.map((deal) => (
          <Card key={deal.id} className="hover:shadow-md transition-shadow">
            <CardContent className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {deal.title}
                    </h3>
                    <div className="mt-2 flex items-center space-x-4">
                      <Badge variant={stageColors[deal.stage] || "default"}>
                        {stageLabels[deal.stage] ?? deal.stage.replace("_", " ")}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        Xác suất: {deal.probability}%
                      </span>
                      {deal.expectedCloseDate && (
                        <span className="text-sm text-gray-600">
                          Dự kiến chốt: {formatDate(deal.expectedCloseDate)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(deal.value, deal.currency)}
                    </p>
                  </div>
                </div>

                {deal.tags && deal.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {deal.tags.map((tag) => (
                      <Badge key={tag} variant="info">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDeals.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">Không tìm thấy thương vụ nào</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
