"use client";

import { useCallback } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { CustomerEditorForm } from "../components/forms/CustomerEditorForm";
import { useNewCustomerPage } from "./hooks/useNewCustomerPage";

export default function NewCustomerPage() {
    const { handleSave, goToCustomers } = useNewCustomerPage();

    const handleCancel = useCallback(() => {
        goToCustomers();
    }, [goToCustomers]);

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Thêm khách hàng mới</h1>
                    <p className="text-sm text-gray-500 mt-1">Tạo hồ sơ khách hàng trực tiếp trên trang quản lý.</p>
                </div>
                <Button variant="outline" onClick={goToCustomers}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại danh sách
                </Button>
            </div>

            <Card>
                <CardContent>
                    <CustomerEditorForm submitText="Thêm mới" onSubmit={handleSave} onCancel={handleCancel} />
                </CardContent>
            </Card>
        </div>
    );
}
