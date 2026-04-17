"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { UserEditorForm } from "../components/forms/UserEditorForm";
import { useNewUserPage } from "./hooks/useNewUserPage";

export default function NewUserPage() {
    const { permissions, handleCreateUser, goToUsers } = useNewUserPage();

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Thêm người dùng mới</h1>
                    <p className="text-sm text-gray-500 mt-1">Tạo tài khoản người dùng trực tiếp trên trang quản lý.</p>
                </div>
                <Button variant="outline" onClick={goToUsers}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại danh sách
                </Button>
            </div>

            <Card>
                <CardContent>
                    <UserEditorForm
                        mode="create"
                        submitText="Thêm mới"
                        permissions={permissions}
                        onSubmit={handleCreateUser}
                        onCancel={goToUsers}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
