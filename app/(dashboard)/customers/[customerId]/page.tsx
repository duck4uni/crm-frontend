"use client";

import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { CustomerEditorForm } from "../components/forms/CustomerEditorForm";
import { CustomerChatTab } from "./components/CustomerChatTab";
import { CustomerDetailSection } from "./components/CustomerDetailSection";
import { CustomerMediaTab } from "./components/CustomerMediaTab";
import { CustomerWorkTab } from "./components/CustomerWorkTab";
import { CustomerTab, useCustomerDetailPage } from "./hooks/useCustomerDetailPage";

export default function CustomerDetailPage() {
    const {
        customer,
        isLoading,
        activeTab,
        setActiveTab,
        tabs,
        isEditing,
        setIsEditing,
        conversation,
        workJobs,
        isLoadingWorkJobs,
        assignerNameById,
        handleUpdate,
        handleDelete,
        goToCustomers,
        DeleteConfirmationDialog,
    } = useCustomerDetailPage();

    if (isLoading || !customer) {
        return (
            <div className="p-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6 text-sm text-gray-600">
                    Đang tải chi tiết khách hàng...
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{customer.customerName}</h1>
                    <p className="text-sm text-gray-500 mt-1">Mã khách hàng: {customer.id}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <Button variant="outline" onClick={goToCustomers}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Danh sách khách hàng
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Xóa
                    </Button>
                </div>
            </div>

            <Card>
                <CardContent>
                    <Tabs
                        tabs={tabs}
                        activeTab={activeTab}
                        onChange={(tabId) => setActiveTab(tabId as CustomerTab)}
                    />

                    <div className="pt-6">
                        {activeTab === "detail" &&
                            (isEditing ? (
                                <CustomerEditorForm
                                    initialData={customer}
                                    customerId={customer.id}
                                    submitText="Lưu thay đổi"
                                    onSubmit={handleUpdate}
                                    onCancel={() => setIsEditing(false)}
                                />
                            ) : (
                                <CustomerDetailSection customer={customer} onEdit={() => setIsEditing(true)} />
                            ))}

                        {activeTab === "chat" && <CustomerChatTab conversation={conversation} />}

                        {activeTab === "work" && (
                            <CustomerWorkTab
                                workJobs={workJobs}
                                isLoadingWorkJobs={isLoadingWorkJobs}
                                assignerNameById={assignerNameById}
                            />
                        )}

                        {activeTab === "media" && <CustomerMediaTab customerId={customer.id} />}
                    </div>
                </CardContent>
            </Card>
            <DeleteConfirmationDialog />
        </div>
    );
}
