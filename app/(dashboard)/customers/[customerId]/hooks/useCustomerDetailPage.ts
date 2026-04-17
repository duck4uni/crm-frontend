import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useDeleteConfirmation } from "@/components/ui/useDeleteConfirmation";
import { useStableToastRef } from "@/hooks/useStableToastRef";
import { initialConversations } from "@/mock-data/chat";
import { customerAssignedUsersService } from "@/services/customer-assigned-users";
import { customerTagsService } from "@/services/customer-tags";
import { customersService } from "@/services/customers";
import { jobsService } from "@/services/jobs";
import { tagsService } from "@/services/tags";
import { usersService } from "@/services/users";
import { JobApiRow } from "@/types/api";
import { Customer } from "@/types/customer";
import {
    buildAllowedAssigneeIdSet,
    buildAssigneeRolesByUserId,
    filterAssignedUsersByAllowedIds,
    getJobDateValue,
    getRelatedCustomerId,
    mapApiRowToCustomerDetail,
    mapFormToUpdatePayload,
    resolveAssignedUserIds,
    resolveAssignedUsers,
} from "../utils/customerDetailMappers";

export type CustomerTab = "detail" | "chat" | "work";

export function useCustomerDetailPage() {
    const params = useParams<{ customerId: string }>();
    const router = useRouter();
    const searchParams = useSearchParams();
    const toastRef = useStableToastRef();
    const { requestDeleteConfirmation, DeleteConfirmationDialog } = useDeleteConfirmation();

    const customerId = params.customerId;
    const initialTab = (searchParams.get("tab") as CustomerTab) || "detail";
    const [activeTab, setActiveTab] = useState<CustomerTab>(
        ["detail", "chat", "work"].includes(initialTab) ? initialTab : "detail",
    );
    const [isEditing, setIsEditing] = useState(searchParams.get("mode") === "edit");

    const [customer, setCustomer] = useState<Customer | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [workJobs, setWorkJobs] = useState<JobApiRow[]>([]);
    const [isLoadingWorkJobs, setIsLoadingWorkJobs] = useState(false);
    const [assignerNameById, setAssignerNameById] = useState<Record<string, string>>({});

    const loadCustomer = useCallback(async () => {
        if (!customerId) {
            return;
        }

        setIsLoading(true);
        try {
            const [
                customerResponse,
                tagsResponse,
                customerTagsResponse,
                customerAssignedUsersResponse,
                adminUsersResponse,
            ] = await Promise.all([
                customersService.getCustomer(customerId),
                tagsService.getTags({ currentPage: "1", pageSize: "5000" }),
                customerTagsService.getCustomerTagsByCustomerId(customerId, {
                    currentPage: "1",
                    pageSize: "5000",
                }),
                customerAssignedUsersService.getCustomerAssignedUsersByCustomerId(customerId, {
                    currentPage: "1",
                    pageSize: "5000",
                }),
                usersService.getAdminUsers({ currentPage: "1", pageSize: "500" }),
            ]);

            const row = customerResponse.responseData;
            if (!row) {
                toastRef.current.error("Không tìm thấy khách hàng", "Khách hàng không còn tồn tại.");
                router.push("/customers");
                return;
            }

            const tagNameById = (tagsResponse.responseData?.rows || []).reduce<Record<string, string>>((acc, tag) => {
                acc[tag.id] = tag.name;
                return acc;
            }, {});

            const groupNames = (customerTagsResponse.responseData?.rows || [])
                .map((link) => tagNameById[link.tag_id])
                .filter((name): name is string => Boolean(name));

            const assignedUsers = resolveAssignedUsers(row, customerAssignedUsersResponse.responseData?.rows || []);

            const adminUsers = adminUsersResponse.responseData?.rows || [];
            const allowedAssigneeIdSet = buildAllowedAssigneeIdSet(adminUsers);
            const assigneeRolesByUserId = buildAssigneeRolesByUserId(adminUsers);
            const filteredAssignedUsers = filterAssignedUsersByAllowedIds(assignedUsers, allowedAssigneeIdSet);

            setCustomer(mapApiRowToCustomerDetail(row, filteredAssignedUsers, assigneeRolesByUserId, groupNames));
        } catch (error) {
            const message = error instanceof Error ? error.message : "Không thể tải chi tiết khách hàng.";
            toastRef.current.error("Tải dữ liệu thất bại", message);
        } finally {
            setIsLoading(false);
        }
    }, [customerId, router, toastRef]);

    useEffect(() => {
        void loadCustomer();
    }, [loadCustomer]);

    useEffect(() => {
        if (activeTab !== "work" || !customerId) {
            return;
        }

        let isDisposed = false;

        const loadWorkHistory = async () => {
            setIsLoadingWorkJobs(true);
            try {
                let rows: JobApiRow[] = [];

                try {
                    const filteredResponse = await jobsService.getJobs({
                        currentPage: "1",
                        pageSize: "300",
                        filters: `customer_uuid==${customerId}`,
                    });
                    rows = filteredResponse.responseData?.rows || [];
                } catch {
                    rows = [];
                }

                if (rows.length === 0) {
                    const fallbackResponse = await jobsService.getJobs({
                        currentPage: "1",
                        pageSize: "500",
                    });

                    rows = (fallbackResponse.responseData?.rows || []).filter(
                        (job) => getRelatedCustomerId(job) === customerId,
                    );
                }

                const assignerIds = Array.from(
                    new Set(
                        rows
                            .map((job) => job.created_by)
                            .filter((createdBy): createdBy is string => Boolean(createdBy && createdBy.trim())),
                    ),
                );

                if (assignerIds.length > 0) {
                    try {
                        const usersResponse = await usersService.getUsers({ currentPage: "1", pageSize: "500" });
                        const rowsById = (usersResponse.responseData?.rows || []).reduce<Record<string, string>>((acc, row) => {
                            acc[row.id] = row.full_name || row.email || row.id;
                            return acc;
                        }, {});

                        const nextAssignerMap = assignerIds.reduce<Record<string, string>>((acc, id) => {
                            acc[id] = rowsById[id] || id;
                            return acc;
                        }, {});

                        if (!isDisposed) {
                            setAssignerNameById(nextAssignerMap);
                        }
                    } catch {
                        const fallbackAssignerMap = assignerIds.reduce<Record<string, string>>((acc, id) => {
                            acc[id] = id;
                            return acc;
                        }, {});

                        if (!isDisposed) {
                            setAssignerNameById(fallbackAssignerMap);
                        }
                    }
                } else if (!isDisposed) {
                    setAssignerNameById({});
                }

                if (isDisposed) {
                    return;
                }

                setWorkJobs([...rows].sort((a, b) => getJobDateValue(b) - getJobDateValue(a)));
            } catch {
                if (!isDisposed) {
                    setWorkJobs([]);
                }
            } finally {
                if (!isDisposed) {
                    setIsLoadingWorkJobs(false);
                }
            }
        };

        void loadWorkHistory();

        return () => {
            isDisposed = true;
        };
    }, [activeTab, customerId]);

    const conversation = useMemo(() => {
        if (!customer) {
            return null;
        }

        const lowerName = customer.customerName.toLowerCase();
        return (
            initialConversations.find(
                (item) => item.phone === customer.phone || item.customerName.toLowerCase().includes(lowerName),
            ) || null
        );
    }, [customer]);

    const tabs = useMemo(
        () => [
            { id: "detail", label: "Chi tiết khách" },
            { id: "chat", label: "Lịch sử chat" },
            { id: "work", label: "Lịch sử chăm sóc" },
        ],
        [],
    );

    const handleUpdate = useCallback(
        async (formData: Partial<Customer>, groupIds: string[]) => {
            if (!customerId) {
                return;
            }

            const selectedAssignedUserIds = resolveAssignedUserIds(formData);

            try {
                await customersService.updateCustomer(customerId, mapFormToUpdatePayload(formData));
            } catch (error) {
                const message = error instanceof Error ? error.message : "Không thể cập nhật thông tin khách hàng.";
                toastRef.current.error("Cập nhật thất bại", message);
                return;
            }

            try {
                await customerAssignedUsersService.syncCustomerAssignedUsers(customerId, selectedAssignedUserIds);

                const normalizedNextGroupIds = Array.from(new Set(groupIds.filter(Boolean)));
                const existingLinksResponse = await customerTagsService.getCustomerTagsByCustomerId(customerId, {
                    currentPage: "1",
                    pageSize: "5000",
                });

                const existingLinks = existingLinksResponse.responseData?.rows || [];
                const existingGroupIdSet = new Set(existingLinks.map((link) => link.tag_id));
                const nextGroupIdSet = new Set(normalizedNextGroupIds);

                const groupsToAdd = normalizedNextGroupIds.filter((groupId) => !existingGroupIdSet.has(groupId));
                const linksToDelete = existingLinks.filter((link) => !nextGroupIdSet.has(link.tag_id));

                if (groupsToAdd.length > 0) {
                    await customerTagsService.createCustomerTags(
                        groupsToAdd.map((groupId) => ({
                            customer_id: customerId,
                            tag_id: groupId,
                        })),
                    );
                }

                if (linksToDelete.length > 0) {
                    await Promise.all(linksToDelete.map((link) => customerTagsService.deleteCustomerTag(link.id)));
                }
            } catch {
                toastRef.current.warning(
                    "Đã lưu thông tin",
                    "Cập nhật nhóm khách hàng hoặc người phụ trách chưa thành công, vui lòng thử lại.",
                );
            }

            toastRef.current.success("Cập nhật thành công", "Thông tin khách hàng đã được lưu.");
            setIsEditing(false);
            await loadCustomer();
        },
        [customerId, loadCustomer, toastRef],
    );

    const handleDelete = useCallback(() => {
        if (!customer) {
            return;
        }

        requestDeleteConfirmation({
            title: "Xóa khách hàng",
            description: `Bạn có chắc chắn muốn xóa khách hàng "${customer.customerName}"? Hành động này không thể hoàn tác.`,
            onConfirm: async () => {
                try {
                    await customersService.deleteCustomer(customer.id);
                    toastRef.current.success("Xóa thành công", `Khách hàng "${customer.customerName}" đã bị xóa.`);
                    router.push("/customers");
                } catch (error) {
                    const message = error instanceof Error ? error.message : "Không thể xóa khách hàng.";
                    toastRef.current.error("Xóa thất bại", message);
                }
            },
        });
    }, [customer, requestDeleteConfirmation, router, toastRef]);

    const goToCustomers = useCallback(() => {
        router.push("/customers");
    }, [router]);

    return {
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
    };
}
