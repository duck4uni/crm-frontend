"use client";

import { ListPageLayout } from "@/components/ui/ListPageLayout";
import { TaskDetailModal } from "./components/TaskDetailModal";
import { TaskFormModal } from "./components/TaskFormModal";
import { TasksSearchBar } from "./components/TasksSearchBar";
import { TasksTable } from "./components/TasksTable";
import { useTasksPage } from "./hooks/useTasksPage";

export default function TasksPage() {
    const {
        isLoading,
        searchQuery,
        setSearchQuery,
        filteredJobs,
        statuses,
        isFormOpen,
        isDetailOpen,
        editingJob,
        selectedJob,
        formData,
        setFormData,
        getUserNameById,
        getPerformerLabel,
        getCustomerLabel,
        openCreateForm,
        openEditForm,
        openDetail,
        closeDetail,
        closeForm,
        handleSaveJob,
        handleRequestDeleteJob,
        performerOptions,
        customerOptions,
        statusOptions,
        DeleteConfirmationDialog,
    } = useTasksPage();

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6 text-sm text-gray-600">
                    Đang tải danh sách công việc...
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <TasksSearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                resultCount={filteredJobs.length}
                onCreate={openCreateForm}
            />

            <ListPageLayout
                items={filteredJobs}
                resetPageKey={searchQuery}
                renderTable={(paged) => (
                    <TasksTable
                        jobs={paged}
                        statuses={statuses}
                        getPerformerLabel={getPerformerLabel}
                        getCustomerLabel={getCustomerLabel}
                        onOpenDetail={openDetail}
                        onOpenEdit={openEditForm}
                        onRequestDelete={handleRequestDeleteJob}
                    />
                )}
            />

            <TaskDetailModal
                isOpen={isDetailOpen}
                selectedJob={selectedJob}
                statuses={statuses}
                getPerformerLabel={getPerformerLabel}
                getCustomerLabel={getCustomerLabel}
                getUserNameById={getUserNameById}
                onClose={closeDetail}
                onEdit={openEditForm}
            />

            <TaskFormModal
                isOpen={isFormOpen}
                isEditing={Boolean(editingJob)}
                formData={formData}
                performerOptions={performerOptions}
                customerOptions={customerOptions}
                statusOptions={statusOptions}
                onClose={closeForm}
                onChange={setFormData}
                onSubmit={handleSaveJob}
            />

            <DeleteConfirmationDialog />
        </div>
    );
}
