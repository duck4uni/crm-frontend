"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { mockCompanies } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";
import { FiPlus, FiSearch, FiGlobe, FiMail, FiPhone } from "react-icons/fi";

export default function CompaniesPage() {
  const [companies] = useState(mockCompanies);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="mt-1 text-gray-500">
            Quản lý thông tin công ty và mối quan hệ đối tác
          </p>
        </div>
        <Button>
          <FiPlus className="w-5 h-5 mr-2" />
          Thêm công ty
        </Button>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm công ty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">Lọc</Button>
        </CardContent>
      </Card>

      {/* Companies List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.map((company) => (
          <Card key={company.id} className="hover:shadow-md transition-shadow">
            <CardContent className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {company.name}
                  </h3>
                  {company.industry && (
                    <p className="text-sm text-gray-500">{company.industry}</p>
                  )}
                </div>
                <Badge
                  variant={company.status === "active" ? "success" : "default"}
                >
                  {company.status === "active" ? "Hoạt động" : "Không hoạt động"}
                </Badge>
              </div>

              <div className="space-y-2">
                {company.website && (
                  <div className="flex items-center text-sm text-gray-600">
                    <FiGlobe className="w-4 h-4 mr-2" />
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary-600"
                    >
                      {company.website}
                    </a>
                  </div>
                )}
                {company.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <FiMail className="w-4 h-4 mr-2" />
                    {company.email}
                  </div>
                )}
                {company.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <FiPhone className="w-4 h-4 mr-2" />
                    {company.phone}
                  </div>
                )}
              </div>

              {company.size && (
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Quy mô:{" "}
                    <span className="font-medium">
                      {company.size} nhân viên
                    </span>
                  </p>
                </div>
              )}

              {company.tags && company.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {company.tags.map((tag) => (
                    <Badge key={tag} variant="info">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="pt-3 border-t border-gray-200 text-xs text-gray-500">
                <span>Tạo ngày {formatDate(company.createdAt)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCompanies.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">Không tìm thấy công ty nào</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
