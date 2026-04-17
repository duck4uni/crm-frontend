import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ListPageLayout } from "@/components/ui/ListPageLayout";
import { useDeleteConfirmation } from "@/components/ui/useDeleteConfirmation";
import { customerAssignedUsersService } from "@/services/customer-assigned-users";
import { customerTagsService } from "@/services/customer-tags";
import { customersService } from "@/services/customers";
import { tagsService } from "@/services/tags";
import { usersService } from "@/services/users";
import { Customer } from "@/types/customer";
import { useStableToastRef } from "@/hooks/useStableToastRef";
import {
    buildAllowedAssigneeIdSet,
    buildAssigneeRolesByUserId,
    DEFAULT_ALL_GROUP_FILTER,
    GROUP_FILTER_PAGE_SIZE,
    mapApiRowToCustomerWithAssignee,
    mapAssignedUsersByCustomerId,
    mapCustomerGroupNamesByCustomerId,
    mapCustomerTagRows,
    mapTagRowsToFilters,
} from "../utils/customerListMappers";
import { CustomerFilterOption, ImportFeedback } from "../types";

export function useCustomersPage(onCountChange?: (count: number) => void) {
    const router = useRouter();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState<string>("all");
    const [groupFilters, setGroupFilters] = useState<CustomerFilterOption[]>([DEFAULT_ALL_GROUP_FILTER]);
    const [customerIdsByGroup, setCustomerIdsByGroup] = useState<Record<string, Set<string>>>({});
    const [isLoading, setIsLoading] = useState(true);
    const toastRef = useStableToastRef();
    const { requestDeleteConfirmation, DeleteConfirmationDialog } = useDeleteConfirmation();

    const loadCustomers = useCallback(async () => {
        setIsLoading(true);
        try {
            const [
                customersResponse,
                tagsResponse,
                customerTagsResponse,
                customerAssignedUsersResponse,
                adminUsersResponse,
            ] = await Promise.all([
                customersService.getCustomers({
                    currentPage: "1",
                    pageSize: "200",
                }),
                tagsService.getTags({
                    currentPage: "1",
                    pageSize: GROUP_FILTER_PAGE_SIZE,
                }),
                customerTagsService.getCustomerTags({
                    currentPage: "1",
                    pageSize: GROUP_FILTER_PAGE_SIZE,
                }),
                customerAssignedUsersService.getCustomerAssignedUsers({
                    currentPage: "1",
                    pageSize: GROUP_FILTER_PAGE_SIZE,
                }),
                usersService.getAdminUsers({
                    currentPage: "1",
                    pageSize: "500",
                }),
            ]);

            const data = customersResponse.responseData;
            const rows = data?.rows ?? [];
            const tagRows = tagsResponse.responseData?.rows || [];
            const customerTagRows = customerTagsResponse.responseData?.rows || [];
            const assignedUserRows = customerAssignedUsersResponse.responseData?.rows || [];
            const adminUsers = adminUsersResponse.responseData?.rows || [];
            const allowedAssigneeIdSet = buildAllowedAssigneeIdSet(adminUsers);
            const assigneeRolesByUserId = buildAssigneeRolesByUserId(adminUsers);
            const assignedUsersByCustomerId = mapAssignedUsersByCustomerId(assignedUserRows, allowedAssigneeIdSet);
            const tagNameById = tagRows.reduce<Record<string, string>>((acc, tag) => {
                acc[tag.id] = tag.name;
                return acc;
            }, {});
            const mappedGroupNamesByCustomerId = mapCustomerGroupNamesByCustomerId(
                customerTagRows,
                tagNameById,
            );
            const mappedCustomers = rows.map((row, idx) =>
                mapApiRowToCustomerWithAssignee(
                    row,
                    idx,
                    assignedUsersByCustomerId,
                    mappedGroupNamesByCustomerId,
                    assigneeRolesByUserId,
                    allowedAssigneeIdSet,
                ),
            );
            const mappedGroupFilters = mapTagRowsToFilters(tagRows);
            const mappedCustomerIdsByGroup = mapCustomerTagRows(customerTagRows);

            setCustomers(mappedCustomers);
            setGroupFilters(mappedGroupFilters);
            setCustomerIdsByGroup(mappedCustomerIdsByGroup);
            setActiveFilter((prev) =>
                prev === "all" || mappedGroupFilters.some((filter) => filter.id === prev) ? prev : "all",
            );
            onCountChange?.(data?.count ?? rows.length);
        } catch (error) {
            const msg =
                error instanceof Error ? error.message : "Không thể tải danh sách khách hàng.";
            toastRef.current.error("Tải dữ liệu thất bại", msg);
        } finally {
            setIsLoading(false);
        }
    }, [onCountChange, toastRef]);

    useEffect(() => {
        void loadCustomers();
    }, [loadCustomers]);

    const filterCounts = useMemo(() => {
        const counts: Record<string, number> = {
            all: customers.length,
        };

        groupFilters.forEach((filter) => {
            if (filter.id === "all") {
                return;
            }

            const customerIds = customerIdsByGroup[filter.id];
            if (!customerIds) {
                counts[filter.id] = 0;
                return;
            }

            counts[filter.id] = customers.filter((customer) => customerIds.has(customer.id)).length;
        });

        return counts;
    }, [customerIdsByGroup, customers, groupFilters]);

    const filteredCustomers = useMemo(() => {
        let filtered = customers;

        if (activeFilter !== "all") {
            const customerIds = customerIdsByGroup[activeFilter];
            if (!customerIds) {
                return [];
            }

            filtered = filtered.filter((customer) => customerIds.has(customer.id));
        }

        if (!searchQuery.trim()) {
            return filtered;
        }

        const query = searchQuery.toLowerCase();
        return filtered.filter(
            (customer) =>
                customer.customerName.toLowerCase().includes(query) ||
                customer.phone.includes(query) ||
                customer.mobilePhone.includes(query) ||
                customer.id.toLowerCase().includes(query),
        );
    }, [activeFilter, customerIdsByGroup, customers, searchQuery]);

    const handleCustomerClick = useCallback(
        (customer: Customer) => {
            router.push(`/customers/${customer.id}?tab=detail`);
        },
        [router],
    );

    const handleAddCustomer = useCallback(() => {
        router.push("/customers/new");
    }, [router]);

    const handleEditCustomer = useCallback(
        (customer: Customer) => {
            router.push(`/customers/${customer.id}?tab=detail&mode=edit`);
        },
        [router],
    );

    const handleDeleteCustomer = useCallback(
        async (customer: Customer) => {
            try {
                await customersService.deleteCustomer(customer.id);
                await loadCustomers();
                toastRef.current.success(
                    "Xóa thành công",
                    `Khách hàng "${customer.customerName}" đã bị xóa.`,
                );
            } catch (error) {
                const msg =
                    error instanceof Error ? error.message : "Không thể xóa khách hàng.";
                toastRef.current.error("Xóa thất bại", msg);
            }
        },
        [loadCustomers, toastRef],
    );

    const handleRequestDeleteCustomer = useCallback(
        (customer: Customer) => {
            requestDeleteConfirmation({
                title: "Xóa khách hàng",
                description: `Bạn có chắc chắn muốn xóa khách hàng "${customer.customerName}"? Hành động này không thể hoàn tác.`,
                onConfirm: async () => {
                    await handleDeleteCustomer(customer);
                },
            });
        },
        [handleDeleteCustomer, requestDeleteConfirmation],
    );

    const handleExport = useCallback(async () => {
        try {
            const blob = await customersService.exportCustomers();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `khach-hang-${Date.now()}.xlsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toastRef.current.success("Xuất file thành công", "Đã xuất danh sách khách hàng");
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Không thể xuất file.";
            toastRef.current.error("Xuất file thất bại", msg);
        }
    }, [toastRef]);

    const handleImport = useCallback(
        async (_data: unknown[], file?: File): Promise<ImportFeedback | undefined> => {
            if (!file) {
                return undefined;
            }

            try {
                const response = await customersService.importCustomers(file);
                const result = response.responseData;
                const successCount = result?.successCount ?? 0;
                const failedCount = (result?.skippedCount ?? 0) + (result?.errorCount ?? 0);
                const errors = (result?.errors || []).map(
                    (item) => `Dòng ${item.row}: ${item.message}`,
                );

                toastRef.current.success(
                    "Nhập dữ liệu thành công",
                    `Thành công ${successCount}, lỗi/bỏ qua ${failedCount}`,
                );

                await loadCustomers();

                return {
                    success: successCount,
                    failed: failedCount,
                    errors,
                };
            } catch (error) {
                const msg = error instanceof Error ? error.message : "Không thể nhập file.";
                toastRef.current.error("Nhập dữ liệu thất bại", msg);
                throw error;
            }
        },
        [loadCustomers, toastRef],
    );

    return {
        isLoading,
        searchQuery,
        setSearchQuery,
        activeFilter,
        setActiveFilter,
        groupFilters,
        filterCounts,
        filteredCustomers,
        handleCustomerClick,
        handleAddCustomer,
        handleEditCustomer,
        handleRequestDeleteCustomer,
        handleExport,
        handleImport,
        DeleteConfirmationDialog,
    };
}
