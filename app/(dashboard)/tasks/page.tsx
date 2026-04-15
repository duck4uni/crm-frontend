"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { ListPageLayout } from "@/components/ui/ListPageLayout";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useDeleteConfirmation } from "@/components/ui/useDeleteConfirmation";
import { useToast } from "@/components/ui/ToastProvider";
import { jobsService } from "@/services/jobs";
import { statusesService } from "@/services/statuses";
import { usersService } from "@/services/users";
import { customersService } from "@/services/customers";
import {
  JobApiRow,
  JobTimeRange,
  CreateJobPayload,
  UpdateJobPayload,
  UserApiRow,
  CustomerApiRow,
  StatusApiRow,
} from "@/types/api";
import {
  FiPlus,
  FiSearch,
  FiEye,
  FiBriefcase,
  FiTrash2,
  FiEdit2,
  FiClock,
  FiUser,
  FiUsers,
} from "react-icons/fi";

interface JobFormData {
  job_name: string;
  content: string;
  note: string;
  job_time: { start?: string; end?: string };
  performer_uuid: string;
  customer_uuid: string;
  status_id: string;
}

const emptyFormData: JobFormData = {
  job_name: "",
  content: "",
  note: "",
  job_time: {},
  performer_uuid: "",
  customer_uuid: "",
  status_id: "",
};

const toDateTimeLocal = (value?: string | null): string => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const normalizeJobStatuses = (statuses: StatusApiRow[]): StatusApiRow[] => {
  const filteredStatuses = statuses.filter((status) => {
    const type = (status.type ?? "").toLowerCase();
    const code = (status.code ?? "").toLowerCase();
    return type.includes("job") || code.includes("job");
  });

  return filteredStatuses.length > 0 ? filteredStatuses : statuses;
};

const getStatusVariant = (statusCode?: string | null, statusName?: string | null): "default" | "success" | "warning" | "danger" | "info" => {
  // Thử map từ code trước
  if (statusCode) {
    const normalizedCode = statusCode.toLowerCase();

    if (normalizedCode.includes("done") || normalizedCode.includes("success") || normalizedCode.includes("completed")) {
      return "success";
    }

    if (normalizedCode.includes("cancel") || normalizedCode.includes("reject") || normalizedCode.includes("failed")) {
      return "danger";
    }

    if (normalizedCode.includes("progress") || normalizedCode.includes("doing") || normalizedCode.includes("processing")) {
      return "info";
    }

    if (normalizedCode.includes("pending") || normalizedCode.includes("todo") || normalizedCode.includes("new")) {
      return "warning";
    }
  }

  // Fallback: map từ status name
  if (statusName) {
    const normalizedName = statusName.toLowerCase();

    if (normalizedName.includes("hoàn thành") || normalizedName.includes("thành công") || normalizedName.includes("xong")) {
      return "success";
    }

    if (normalizedName.includes("hủy") || normalizedName.includes("từ chối") || normalizedName.includes("thất bại")) {
      return "danger";
    }

    if (normalizedName.includes("chờ") || normalizedName.includes("chưa") || normalizedName.includes("mới")) {
      return "warning";
    }

    if (normalizedName.includes("đang") || normalizedName.includes("thực hiện") || normalizedName.includes("xử lý")) {
      return "info";
    }
  }

  return "default";
};

const buildCustomerLabel = (customer: CustomerApiRow) => {
  const fullName = customer.full_name?.trim();
  if (fullName) {
    return fullName;
  }

  const displayName = `${customer.last_name ?? ""} ${customer.first_name ?? ""}`.trim();
  return displayName || customer.email || customer.id;
};

export default function TasksPage() {
  const [jobs, setJobs] = useState<JobApiRow[]>([]);
  const [users, setUsers] = useState<UserApiRow[]>([]);
  const [adminUsers, setAdminUsers] = useState<UserApiRow[]>([]);
  const [customers, setCustomers] = useState<CustomerApiRow[]>([]);
  const [statuses, setStatuses] = useState<StatusApiRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobApiRow | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobApiRow | null>(null);
  const [formData, setFormData] = useState<JobFormData>(emptyFormData);
  const toast = useToast();
  const { requestDeleteConfirmation, DeleteConfirmationDialog } = useDeleteConfirmation();

  const loadJobs = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await jobsService.getJobs({ pageSize: "200" });
      setJobs(response.responseData?.rows ?? []);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Không thể tải danh sách công việc.";
      toast.error("Tải dữ liệu thất bại", msg);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

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

      setUsers(usersRes.responseData?.rows ?? []);
      setAdminUsers(adminUsersRes.responseData?.rows ?? []);
      setCustomers(customersRes.responseData?.rows ?? []);
      setStatuses(normalizeJobStatuses(statusesRes.responseData?.rows ?? []));
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Không thể tải dữ liệu tham chiếu.";
      toast.error("Tải dữ liệu thất bại", msg);
    }
  }, [toast]);

  useEffect(() => {
    loadJobs();
    loadReferenceData();
  }, [loadJobs, loadReferenceData]);

  const filteredJobs = jobs.filter((job) => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return true;
    }

    const statusName = job.status?.name ?? "";
    const note = job.note ?? "";

    return [job.job_name, job.content, note, statusName].some((fieldValue) =>
      fieldValue.toLowerCase().includes(normalizedQuery),
    );
  });

  const getUserNameById = (id: string | null | undefined) => {
    if (!id) return null;
    const user = users.find((item) => item.id === id);
    return user ? user.full_name || user.email : id.slice(0, 8) + "...";
  };

  const getCustomerNameById = (id: string | null | undefined) => {
    if (!id) return null;
    const customer = customers.find((item) => item.id === id);
    return customer ? buildCustomerLabel(customer) : id.slice(0, 8) + "...";
  };

  const getPerformerLabel = (job: JobApiRow) => {
    return job.performer?.full_name || job.performer?.email || getUserNameById(job.performer_uuid) || "—";
  };

  const getCustomerLabel = (job: JobApiRow) => {
    if (job.customer?.full_name) {
      return job.customer.full_name;
    }

    if (job.customer?.last_name || job.customer?.first_name) {
      return `${job.customer.last_name ?? ""} ${job.customer.first_name ?? ""}`.trim();
    }

    return job.customer?.email || getCustomerNameById(job.customer_uuid) || "—";
  };

  const getJobStatus = (job: JobApiRow) => {
    if (job.status) {
      return job.status;
    }

    if (!job.status_id) {
      return null;
    }

    return statuses.find((status) => status.id === job.status_id) ?? null;
  };

  const getFormTimeFromApi = (jobTime: JobApiRow["job_time"]): { start: string; end: string } => {
    if (Array.isArray(jobTime)) {
      const firstRange = jobTime[0];
      return {
        start: firstRange?.start ?? "",
        end: firstRange?.end ?? "",
      };
    }

    const singleRange = jobTime ?? {};
    return {
      start: singleRange.start ?? "",
      end: singleRange.end ?? "",
    };
  };

  const openCreateForm = () => {
    setEditingJob(null);
    setFormData(emptyFormData);
    setIsFormOpen(true);
  };

  const openEditForm = (job: JobApiRow) => {
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
  };

  const openDetail = (job: JobApiRow) => {
    setSelectedJob(job);
    setIsDetailOpen(true);
  };

  const buildPayloadTime = (): JobTimeRange[] => {
    const time: JobTimeRange = {};
    if (formData.job_time.start) time.start = formData.job_time.start;
    if (formData.job_time.end) time.end = formData.job_time.end;
    return Object.keys(time).length ? [time] : [];
  };

  const handleSaveJob = async () => {
    if (!formData.job_name.trim() || !formData.content.trim()) {
      toast.error("Thiếu thông tin", "Vui lòng nhập tên và nội dung công việc.");
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
        toast.success("Cập nhật thành công", `Công việc "${formData.job_name}" đã được cập nhật.`);
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
        toast.success("Tạo thành công", `Công việc "${formData.job_name}" đã được tạo.`);
      }
      setIsFormOpen(false);
      setEditingJob(null);
      setFormData(emptyFormData);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Không thể lưu công việc.";
      toast.error("Lưu thất bại", msg);
    }
  };

  const handleDeleteJob = async (job: JobApiRow) => {
    try {
      await jobsService.deleteJob(job.id);
      setJobs((prev) => prev.filter((j) => j.id !== job.id));
      toast.success("Xóa thành công", `Công việc "${job.job_name}" đã bị xóa.`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Không thể xóa công việc.";
      toast.error("Xóa thất bại", msg);
    }
  };

  const handleRequestDeleteJob = (job: JobApiRow) => {
    requestDeleteConfirmation({
      title: "Xóa công việc",
      description: `Bạn có chắc chắn muốn xóa công việc "${job.job_name}"? Hành động này không thể hoàn tác.`,
      onConfirm: async () => {
        await handleDeleteJob(job);
      },
    });
  };

  const userOptions = users.map((u) => ({ value: u.id, label: u.full_name || u.email }));
  const adminUserOptions = adminUsers.map((u) => ({ value: u.id, label: u.full_name || u.email }));
  const customerOptions = customers.map((customer) => ({
    value: customer.id,
    label: buildCustomerLabel(customer),
  }));
  const statusOptions = statuses.map((status) => ({
    value: status.id,
    label: status.name,
  }));

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
      {/* Search + Action Bar */}
      <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center gap-3">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc nội dung..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <span className="text-sm text-gray-500 whitespace-nowrap">{filteredJobs.length} kết quả</span>
        <Button onClick={openCreateForm}>
          <FiPlus className="w-4 h-4 mr-1.5" />
          Thêm công việc
        </Button>
      </div>

      {/* Jobs Table */}
      <ListPageLayout
        items={filteredJobs}
        resetPageKey={searchQuery}
        renderTable={(paged) => (
          <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên công việc
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nội dung
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người thực hiện
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paged.map((job) => {
                const jt = getFormTimeFromApi(job.job_time);
                const status = getJobStatus(job);
                return (
                  <tr
                    key={job.id}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FiBriefcase className="w-4 h-4 text-primary-500 mr-2 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                          {job.job_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 truncate max-w-[250px]">{job.content}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {jt.start || jt.end ? (
                        <div className="flex items-center">
                          <FiClock className="w-3.5 h-3.5 mr-1 text-gray-400" />
                          <span>
                            {jt.start ? new Date(jt.start).toLocaleDateString("vi-VN") : ""}
                            {jt.start && jt.end ? " → " : ""}
                            {jt.end ? new Date(jt.end).toLocaleDateString("vi-VN") : ""}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {job.performer || job.performer_uuid ? (
                        <div className="flex items-center text-sm text-gray-700">
                          <FiUser className="w-3.5 h-3.5 mr-1 text-gray-400" />
                          {getPerformerLabel(job)}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {job.customer || job.customer_uuid ? (
                        <div className="flex items-center text-sm text-gray-700">
                          <FiUsers className="w-3.5 h-3.5 mr-1 text-gray-400" />
                          {getCustomerLabel(job)}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {status ? (
                        <Badge variant={getStatusVariant(status.code, status.name)}>{status.name}</Badge>
                      ) : job.status_id ? (
                        <Badge variant="default">{job.status_id}</Badge>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            openDetail(job);
                          }}
                          className="p-1.5 text-primary-600 hover:bg-primary-50 rounded transition-colors"
                          title="Xem chi tiết"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            openEditForm(job);
                          }}
                          className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                          title="Chỉnh sửa"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            handleRequestDeleteJob(job);
                          }}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                          title="Xóa"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        )}
      />

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Chi tiết công việc"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsDetailOpen(false)}>Đóng</Button>
            {selectedJob && (
              <Button
                variant="primary"
                onClick={() => {
                  setIsDetailOpen(false);
                  openEditForm(selectedJob);
                }}
              >
                <FiEdit2 className="w-4 h-4 mr-2" />
                Chỉnh sửa
              </Button>
            )}
          </>
        }
      >
        {selectedJob && (() => {
          const jt = getFormTimeFromApi(selectedJob.job_time);
          const status = getJobStatus(selectedJob);
          return (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Tên công việc</label>
                <p className="text-sm text-gray-900">{selectedJob.job_name}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Nội dung</label>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedJob.content}</p>
              </div>
              {selectedJob.note && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Ghi chú</label>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedJob.note}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Thời gian bắt đầu</label>
                  <p className="text-sm text-gray-900">
                    {jt.start ? new Date(jt.start).toLocaleString("vi-VN") : "Chưa đặt"}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Thời gian kết thúc</label>
                  <p className="text-sm text-gray-900">
                    {jt.end ? new Date(jt.end).toLocaleString("vi-VN") : "Chưa đặt"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Người thực hiện</label>
                  <p className="text-sm text-gray-900">
                    {getPerformerLabel(selectedJob)}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Khách hàng</label>
                  <p className="text-sm text-gray-900">
                    {getCustomerLabel(selectedJob)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Trạng thái</label>
                  <p className="text-sm text-gray-900">{status?.name ?? selectedJob.status_id ?? "Không có"}</p>
                </div>
              </div>
              {selectedJob.created_by && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Người tạo</label>
                  <p className="text-sm text-gray-900">{getUserNameById(selectedJob.created_by) ?? selectedJob.created_by}</p>
                </div>
              )}
            </div>
          );
        })()}
      </Modal>

      {/* Create / Edit Job Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingJob(null); }}
        title={editingJob ? "Chỉnh sửa công việc" : "Tạo công việc mới"}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setIsFormOpen(false); setEditingJob(null); }}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleSaveJob}>
              {editingJob ? "Cập nhật" : "Tạo mới"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* job_name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên công việc *</label>
            <Input
              value={formData.job_name}
              onChange={(e) => setFormData((prev) => ({ ...prev, job_name: e.target.value }))}
              placeholder="Nhập tên công việc"
            />
          </div>

          {/* content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung *</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
              placeholder="Nhập nội dung công việc"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData((prev) => ({ ...prev, note: e.target.value }))}
              placeholder="Nhập ghi chú (nếu có)"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
          </div>

          {/* job_time: start / end */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian bắt đầu</label>
              <Input
                type="datetime-local"
                value={formData.job_time.start ?? ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    job_time: { ...prev.job_time, start: e.target.value },
                  }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian kết thúc</label>
              <Input
                type="datetime-local"
                value={formData.job_time.end ?? ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    job_time: { ...prev.job_time, end: e.target.value },
                  }))
                }
              />
            </div>
          </div>

          {/* performer_uuid */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Người thực hiện</label>
            <select
              value={formData.performer_uuid}
              onChange={(e) => setFormData((prev) => ({ ...prev, performer_uuid: e.target.value }))}
              className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              <option value="">Không chọn</option>
              {(editingJob ? userOptions : (adminUserOptions.length ? adminUserOptions : userOptions)).map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* customer_uuid */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Khách hàng</label>
            <select
              value={formData.customer_uuid}
              onChange={(e) => setFormData((prev) => ({ ...prev, customer_uuid: e.target.value }))}
              className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              <option value="">Không chọn</option>
              {customerOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {editingJob && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
              <select
                value={formData.status_id}
                onChange={(e) => setFormData((prev) => ({ ...prev, status_id: e.target.value }))}
                className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </Modal>
      <DeleteConfirmationDialog />
    </div>
  );
}
