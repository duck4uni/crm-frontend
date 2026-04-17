import { useCallback, useEffect, useMemo, useState } from "react";
import { useDeleteConfirmation } from "@/components/ui/useDeleteConfirmation";
import { useStableToastRef } from "@/hooks/useStableToastRef";
import { customersService } from "@/services/customers";
import { jobsService } from "@/services/jobs";
import { statusesService } from "@/services/statuses";
import { usersService } from "@/services/users";
import {
    AdminUserApiRow,
    CreateJobPayload,
    CustomerApiRow,
    JobApiRow,
    JobTimeRange,
    StatusApiRow,
    UpdateJobPayload,
    UserApiRow,
} from "@/types/api";
import { emptyFormData, JobFormData } from "../types";
import {
    buildCustomerLabel,
    getFormTimeFromApi,
    hasWorkerPermission,
    normalizeJobStatuses,
    toDateTimeLocal,
} from "../utils/tasksHelpers";

export function useTasksPage() {
    const [jobs, setJobs] = useState<JobApiRow[]>([]);
    const [users, setUsers] = useState<UserApiRow[]>([]);
    const [adminUsers, setAdminUsers] = useState<AdminUserApiRow[]>([]);
    const [customers, setCustomers] = useState<CustomerApiRow[]>([]);
    const [statuses, setStatuses] = useState<StatusApiRow[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [editingJob, setEditingJob] = useState<JobApiRow | null>(null);
    const [selectedJob, setSelectedJob] = useState<JobApiRow | null>(null);
    const [formData, setFormData] = useState<JobFormData>(emptyFormData);
    const toastRef = useStableToastRef();
    const { requestDeleteConfirmation, DeleteConfirmationDialog } = useDeleteConfirmation();

    const loadJobs = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await jobsService.getJobs({ pageSize: "200" });
            setJobs(response.responseData?.rows ?? []);
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Không thể tải danh sách công việc.";
            toastRef.current.error("Tải dữ liệu thất bại", msg);
        } finally {
            setIsLoading(false);
        }
    }, [toastRef]);

    const loadReferenceData = useCallback(async () => {
        try {
            const [usersRes, adminUsersRes, customersRes] = await Promise.all([
                usersService.getUsers({ pageSize: "500" }),
                usersService.getAdminUsers({ pageSize: "500" }),
                customersService.getCustomers({ pageSize: "500" }),
            ]);

            let statusesRes;
            try {
                statusesRes = await statusesService.getStatuses({
                    pageSize: "500",
                    filters: JSON.stringify({ type: "job" }),
                });
            } catch {
                statusesRes = await statusesService.getStatuses({ pageSize: "500" });
            }

            const adminUserRows = adminUsersRes.responseData?.rows ?? [];

            setUsers(usersRes.responseData?.rows ?? []);
            setAdminUsers(adminUserRows.filter(hasWorkerPermission));
            setCustomers(customersRes.responseData?.rows ?? []);
            setStatuses(normalizeJobStatuses(statusesRes.responseData?.rows ?? []));
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Không thể tải dữ liệu tham chiếu.";
            toastRef.current.error("Tải dữ liệu thất bại", msg);
        }
    }, [toastRef]);

    useEffect(() => {
        void loadJobs();
        void loadReferenceData();
    }, [loadJobs, loadReferenceData]);

    const filteredJobs = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase();
        if (!normalizedQuery) {
            return jobs;
        }

        return jobs.filter((job) => {
            const statusName = job.status?.name ?? "";
            const note = job.note ?? "";

            return [job.job_name, job.content, note, statusName].some((fieldValue) =>
                fieldValue.toLowerCase().includes(normalizedQuery),
            );
        });
    }, [jobs, searchQuery]);

    const getUserNameById = useCallback(
        (id: string | null | undefined) => {
            if (!id) return null;
            const user = users.find((item) => item.id === id) || adminUsers.find((item) => item.id === id);
            return user ? user.full_name || user.email : `${id.slice(0, 8)}...`;
        },
        [adminUsers, users],
    );

    const getCustomerNameById = useCallback(
        (id: string | null | undefined) => {
            if (!id) return null;
            const customer = customers.find((item) => item.id === id);
            return customer ? buildCustomerLabel(customer) : `${id.slice(0, 8)}...`;
        },
        [customers],
    );

    const getPerformerLabel = useCallback(
        (job: JobApiRow) => {
            return job.performer?.full_name || job.performer?.email || getUserNameById(job.performer_uuid) || "-";
        },
        [getUserNameById],
    );

    const getCustomerLabel = useCallback(
        (job: JobApiRow) => {
            if (job.customer?.full_name) {
                return job.customer.full_name;
            }

            if (job.customer?.last_name || job.customer?.first_name) {
                return `${job.customer.last_name ?? ""} ${job.customer.first_name ?? ""}`.trim();
            }

            return job.customer?.email || getCustomerNameById(job.customer_uuid) || "-";
        },
        [getCustomerNameById],
    );

    const openCreateForm = useCallback(() => {
        setEditingJob(null);
        setFormData(emptyFormData);
        setIsFormOpen(true);
    }, []);

    const openEditForm = useCallback((job: JobApiRow) => {
        setEditingJob(job);
        const jt = getFormTimeFromApi(job.job_time);
        setFormData({
            job_name: job.job_name,
            content: job.content,
            note: job.note ?? "",
            job_time: { start: toDateTimeLocal(jt.start), end: toDateTimeLocal(jt.end) },
            performer_uuid: job.performer?.id ?? job.performer_uuid ?? "",
            customer_uuid: job.customer?.id ?? job.customer_uuid ?? "",
            status_id: job.status?.id ?? job.status_id ?? "",
        });
        setIsFormOpen(true);
    }, []);

    const openDetail = useCallback((job: JobApiRow) => {
        setSelectedJob(job);
        setIsDetailOpen(true);
    }, []);

    const closeDetail = useCallback(() => {
        setIsDetailOpen(false);
    }, []);

    const closeForm = useCallback(() => {
        setIsFormOpen(false);
        setEditingJob(null);
    }, []);

    const buildPayloadTime = useCallback((): JobTimeRange[] => {
        const time: JobTimeRange = {};
        if (formData.job_time.start) time.start = formData.job_time.start;
        if (formData.job_time.end) time.end = formData.job_time.end;
        return Object.keys(time).length ? [time] : [];
    }, [formData.job_time.end, formData.job_time.start]);

    const handleSaveJob = useCallback(async () => {
        if (!formData.job_name.trim() || !formData.content.trim()) {
            toastRef.current.error("Thiếu thông tin", "Vui lòng nhập tên và nội dung công việc.");
            return;
        }

        try {
            if (editingJob) {
                const payload: UpdateJobPayload = {
                    job_name: formData.job_name,
                    content: formData.content,
                    note: formData.note.trim() || undefined,
                    job_time: buildPayloadTime(),
                    performer_uuid: formData.performer_uuid || undefined,
                    customer_uuid: formData.customer_uuid || undefined,
                    status_id: formData.status_id || undefined,
                };
                const response = await jobsService.updateJob(editingJob.id, payload);
                const updated = response.responseData;
                setJobs((prev) => prev.map((j) => (j.id === editingJob.id ? { ...j, ...updated } : j)));
                toastRef.current.success("Cập nhật thành công", `Công việc "${formData.job_name}" đã được cập nhật.`);
            } else {
                const payload: CreateJobPayload[] = [
                    {
                        job_name: formData.job_name,
                        content: formData.content,
                        note: formData.note.trim() || undefined,
                        job_time: buildPayloadTime(),
                        performer_uuid: formData.performer_uuid || undefined,
                        customer_uuid: formData.customer_uuid || undefined,
                    },
                ];
                const response = await jobsService.createJobs(payload);
                const created = response.responseData ?? [];
                setJobs((prev) => [...created, ...prev]);
                toastRef.current.success("Tạo thành công", `Công việc "${formData.job_name}" đã được tạo.`);
            }
            setIsFormOpen(false);
            setEditingJob(null);
            setFormData(emptyFormData);
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Không thể lưu công việc.";
            toastRef.current.error("Lưu thất bại", msg);
        }
    }, [buildPayloadTime, editingJob, formData, toastRef]);

    const handleDeleteJob = useCallback(async (job: JobApiRow) => {
        try {
            await jobsService.deleteJob(job.id);
            setJobs((prev) => prev.filter((j) => j.id !== job.id));
            toastRef.current.success("Xóa thành công", `Công việc "${job.job_name}" đã bị xóa.`);
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Không thể xóa công việc.";
            toastRef.current.error("Xóa thất bại", msg);
        }
    }, [toastRef]);

    const handleRequestDeleteJob = useCallback(
        (job: JobApiRow) => {
            requestDeleteConfirmation({
                title: "Xóa công việc",
                description: `Bạn có chắc chắn muốn xóa công việc "${job.job_name}"? Hành động này không thể hoàn tác.`,
                onConfirm: async () => {
                    await handleDeleteJob(job);
                },
            });
        },
        [handleDeleteJob, requestDeleteConfirmation],
    );

    const performerOptions = useMemo(
        () => adminUsers.map((u) => ({ value: u.id, label: u.full_name || u.email })),
        [adminUsers],
    );
    const customerOptions = useMemo(
        () =>
            customers.map((customer) => ({
                value: customer.id,
                label: buildCustomerLabel(customer),
            })),
        [customers],
    );
    const statusOptions = useMemo(
        () =>
            statuses.map((status) => ({
                value: status.id,
                label: status.name,
            })),
        [statuses],
    );

    return {
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
    };
}
