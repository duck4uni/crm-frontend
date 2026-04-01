"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { mockContacts } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";
import { FiPlus, FiSearch, FiMail, FiPhone } from "react-icons/fi";

export default function ContactsPage() {
  const [contacts] = useState(mockContacts);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredContacts = contacts.filter((contact) =>
    `${contact.firstName} ${contact.lastName} ${contact.email}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="mt-1 text-gray-500">
            Quản lý danh bạ liên hệ và mối quan hệ khách hàng
          </p>
        </div>
        <Button>
          <FiPlus className="w-5 h-5 mr-2" />
          Thêm liên hệ
        </Button>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm liên hệ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">Lọc</Button>
        </CardContent>
      </Card>

      {/* Contacts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContacts.map((contact) => (
          <Card key={contact.id} className="hover:shadow-md transition-shadow">
            <CardContent className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar
                    name={`${contact.firstName} ${contact.lastName}`}
                    src={contact.avatar}
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {contact.firstName} {contact.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">{contact.position}</p>
                  </div>
                </div>
                <Badge
                  variant={contact.status === "active" ? "success" : "default"}
                >
                  {contact.status === "active" ? "Hoạt động" : "Không hoạt động"}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <FiMail className="w-4 h-4 mr-2" />
                  {contact.email}
                </div>
                {contact.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <FiPhone className="w-4 h-4 mr-2" />
                    {contact.phone}
                  </div>
                )}
              </div>

              {contact.companyName && (
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Công ty:{" "}
                    <span className="font-medium">{contact.companyName}</span>
                  </p>
                </div>
              )}

              {contact.tags && contact.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {contact.tags.map((tag) => (
                    <Badge key={tag} variant="info">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="pt-3 border-t border-gray-200 flex justify-between text-xs text-gray-500">
                <span>Tạo ngày {formatDate(contact.createdAt)}</span>
                {contact.lastContactedAt && (
                  <span>
                    Liên hệ gần nhất {formatDate(contact.lastContactedAt)}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredContacts.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">Không tìm thấy liên hệ nào</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
