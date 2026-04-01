"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <p className="mt-1 text-gray-500">
          Quản lý tài khoản và các thiết lập hệ thống
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Thiết lập hồ sơ</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Tính năng thiết lập hồ sơ sẽ sớm ra mắt...</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thông báo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Tính năng thiết lập thông báo sẽ sớm ra mắt...
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tài khoản</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Tính năng thiết lập tài khoản sẽ sớm ra mắt...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
