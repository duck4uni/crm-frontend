"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { ListPageLayout } from "@/components/ui/ListPageLayout";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/ToastProvider";
import { jobsService } from "@/services/jobs";
import { usersService } from "@/services/users";
import { customersService } from "@/services/customers";
import { JobApiRow, JobTimeRange, CreateJobPayload, UpdateJobPayload, UserApiRow, CustomerApiRow } from "@/types/api";
import {
  FiPlus,
  FiSearch,
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
  job_time: { start?: string; end?: string };
  performer_uuid: string;
  customer_uuid: string;
  status_id: string;
}

const emptyFormData: JobFormData = {
  job_name: "",
  content: "",
  job_time: {},
  performer_uuid: "",
  customer_uuid: "",
  status_id: "",
};

export default function TasksPage() {
  const [jobs, setJobs] = useState<JobApiRow[]>([]);
  const [users, setUsers] = useState<UserApiRow[]>([]);
  const [customers, setCustomers] = useState<CustomerApiRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobApiRow | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobApiRow | null>(null);
  const [formData, setFormData] = useState<JobFormData>(emptyFormData);
  const toast = useToast();

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

  const loadUsers = useCallback(async () => {
    try {
      const [usersRes, customersRes] = await Promise.all([
        usersService.getUsers({ pageSize: "500" }),
        customersService.getCustomers({ pageSize: "500" }),
      ]);
      setUsers(usersRes.responseData?.rows ?? []);
      setCustomers(customersRes.responseData?.rows ?? []);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Không thể tải danh sách người dùng/khách hàng.";
      toast.error("Tải dữ liệu thất bại", msg);
    }
  }, [toast]);

  useEffect(() => {
    loadJobs();
    loadUsers();
  }, [loadJobs, loadUsers]);

  const filteredJobs = jobs.filter((job) =>
    job.job_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.content.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getUserName = (uuid: string | null) => {
    if (!uuid) return null;
    const user = users.find((u) => u.id === uuid);
    if (user) return user.full_name || user.email;
    const customer = customers.find((c) => c.id === uuid);
    if (customer) return customer.full_name || `${customer.last_name} ${customer.first_name}`.trim() || customer.email || uuid.slice(0, 8) + "...";
    return uuid.slice(0, 8) + "...";
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
      job_time: { start: jt.start, end: jt.end },
      performer_uuid: job.performer_uuid ?? "",
      customer_uuid: job.customer_uuid ?? "",
      status_id: job.status_id ?? "",
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
        // Update
        const payload: UpdateJobPayload = {
          job_name: formData.job_name,
          content: formData.content,
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
        // Create
        const payload: CreateJobPayload[] = [{
          job_name: formData.job_name,
          content: formData.content,
          job_time: buildPayloadTime(),
          performer_uuid: formData.performer_uuid || undefined,
          customer_uuid: formData.customer_uuid || undefined,
          status_id: formData.status_id || undefined,
        }];
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

  const userOptions = users.map((u) => ({ value: u.id, label: u.full_name || u.email }));
  const customerOptions = customers.map((c) => ({
    value: c.id,
    label: c.full_name || `${c.last_name} ${c.first_name}`.trim() || c.email || c.id,
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paged.map((job) => {
                const jt = getFormTimeFromApi(job.job_time);
                return (
                  <tr
                    key={job.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => openDetail(job)}
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
                      {job.performer_uuid ? (
                        <div className="flex items-center text-sm text-gray-700">
                          <FiUser className="w-3.5 h-3.5 mr-1 text-gray-400" />
                          {getUserName(job.performer_uuid)}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {job.customer_uuid ? (
                        <div className="flex items-center text-sm text-gray-700">
                          <FiUsers className="w-3.5 h-3.5 mr-1 text-gray-400" />
                          {getUserName(job.customer_uuid)}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {job.status_id ? (
                        <Badge variant="info">{job.status_id}</Badge>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {job.created_at
                        ? new Date(job.created_at).toLocaleDateString("vi-VN")
                        : "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditForm(job)}
                          className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                          title="Chỉnh sửa"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteJob(job)}
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
                    {getUserName(selectedJob.performer_uuid) ?? "Chưa gán"}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Khách hàng</label>
                  <p className="text-sm text-gray-900">
                    {getUserName(selectedJob.customer_uuid) ?? "Chưa gán"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Trạng thái (status_id)</label>
                  <p className="text-sm text-gray-900">{selectedJob.status_id ?? "Không có"}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Ngày tạo</label>
                  <p className="text-sm text-gray-900">
                    {selectedJob.created_at ? new Date(selectedJob.created_at).toLocaleString("vi-VN") : "—"}
                  </p>
                </div>
              </div>
              {selectedJob.created_by && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Người tạo</label>
                  <p className="text-sm text-gray-900">{getUserName(selectedJob.created_by)}</p>
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
              {userOptions.map((opt) => (
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

          {/* status_id */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status ID</label>
            <Input
              value={formData.status_id}
              onChange={(e) => setFormData((prev) => ({ ...prev, status_id: e.target.value }))}
              placeholder="Nhập status ID (UUID)"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
