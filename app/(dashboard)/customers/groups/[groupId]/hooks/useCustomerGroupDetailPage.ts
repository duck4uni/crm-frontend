import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";
import { customerAssignedUsersService } from "@/services/customer-assigned-users";
import { customerTagsService } from "@/services/customer-tags";
import { customersService } from "@/services/customers";
import { tagsService } from "@/services/tags";
import { usersService } from "@/services/users";
import { CustomerApiRow, CustomerTagApiRow } from "@/types/api";
import {
    AssigneeRole,
    buildAssigneeRolesByUserId,
    CUSTOMER_PAGE_SIZE,
    CustomerLookupItem,
    GroupMemberItem,
    LEADER_ROLE_NAME,
    LINK_PAGE_SIZE,
    mapAssignedUsersByCustomerId,
    resolveAssignedUsersForCustomer,
    toAssigneeDisplayNameByRole,
    toCustomerName,
    toErrorMessage,
    UserOption,
    WORKER_ROLE_NAME,
} from "../utils/customerGroupDetailUtils";

export function useCustomerGroupDetailPage() {
    const { groupId } = useParams<{ groupId: string }>();
    const router = useRouter();
    const toast = useToast();

    const assigneeEditorRef = useRef<HTMLDivElement>(null);
    const assigneeSearchInputRef = useRef<HTMLInputElement>(null);

    const [groupName, setGroupName] = useState("");
    const [allCustomers, setAllCustomers] = useState<CustomerLookupItem[]>([]);
    const [members, setMembers] = useState<GroupMemberItem[]>([]);

    const [searchAdd, setSearchAdd] = useState("");
    const [selectedToAdd, setSelectedToAdd] = useState<string[]>([]);
    const [selectedToRemove, setSelectedToRemove] = useState<string[]>([]);
    const [userOptions, setUserOptions] = useState<UserOption[]>([]);
    const [editingAssigneeCustomerId, setEditingAssigneeCustomerId] = useState<string | null>(null);
    const [assigneeSearchKeyword, setAssigneeSearchKeyword] = useState("");
    const [assigneeDraftIds, setAssigneeDraftIds] = useState<string[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [assigningCustomerId, setAssigningCustomerId] = useState<string | null>(null);

    const mapCustomerRow = useCallback(
        (
            row: CustomerApiRow,
            assignedUsersByCustomerId: Record<string, Array<{ id: string; full_name: string }>>,
            assigneeRolesByUserId: Record<string, Set<AssigneeRole>>,
        ): CustomerLookupItem => {
            const assignedUsers = resolveAssignedUsersForCustomer(row, assignedUsersByCustomerId);

            return {
                id: row.id,
                customerName: toCustomerName(row),
                phone: row.phone || undefined,
                assigneeIds: assignedUsers.map((user) => user.id),
                leaderAssigneeName: toAssigneeDisplayNameByRole(assignedUsers, assigneeRolesByUserId, "leader"),
                workerAssigneeName: toAssigneeDisplayNameByRole(assignedUsers, assigneeRolesByUserId, "worker"),
            };
        },
        [],
    );

    const getCustomerTagsByGroup = useCallback(async (): Promise<CustomerTagApiRow[]> => {
        const response = await customerTagsService.getCustomerTagsByTagId(groupId, {
            currentPage: "1",
            pageSize: LINK_PAGE_SIZE,
        });

        return response.responseData?.rows || [];
    }, [groupId]);

    const loadData = useCallback(async () => {
        if (!groupId) {
            return;
        }

        setIsLoading(true);
        try {
            const [groupRes, customersRes, links, usersRes, customerAssignedUsersRes] = await Promise.all([
                tagsService.getTag(groupId),
                customersService.getCustomers({ currentPage: "1", pageSize: CUSTOMER_PAGE_SIZE }),
                getCustomerTagsByGroup(),
                usersService.getAdminUsers({ currentPage: "1", pageSize: "500" }),
                customerAssignedUsersService.getCustomerAssignedUsers({
                    currentPage: "1",
                    pageSize: LINK_PAGE_SIZE,
                }),
            ]);

            const group = groupRes.responseData;
            if (!group?.id) {
                toast.error("Không tìm thấy nhóm", "Nhóm khách hàng không tồn tại.");
                router.push("/customers/groups");
                return;
            }

            setGroupName(group.name || "Nhóm khách hàng");

            const adminUsers = usersRes.responseData?.rows || [];
            const assigneeRolesByUserId = buildAssigneeRolesByUserId(adminUsers);

            const mappedUserOptions = adminUsers
                .map((user) => {
                    const permissionNames = (user.user_permisions || [])
                        .map((item) => item.permision?.name || "")
                        .map((name) => name.trim());

                    const isLeader = permissionNames.includes(LEADER_ROLE_NAME);
                    const isWorker = permissionNames.includes(WORKER_ROLE_NAME);

                    if (!isLeader && !isWorker) {
                        return null;
                    }

                    return {
                        id: user.id,
                        label: user.full_name?.trim() || user.email || user.id,
                        role: isLeader ? LEADER_ROLE_NAME : WORKER_ROLE_NAME,
                    };
                })
                .filter((user): user is UserOption => Boolean(user))
                .sort((a, b) => a.label.localeCompare(b.label, "vi"));

            setUserOptions(mappedUserOptions);

            const rows = customersRes.responseData?.rows || [];
            const assignedUsersByCustomerId = mapAssignedUsersByCustomerId(customerAssignedUsersRes.responseData?.rows || []);
            const mappedAllCustomers = rows.map((row) => mapCustomerRow(row, assignedUsersByCustomerId, assigneeRolesByUserId));
            setAllCustomers(mappedAllCustomers);

            const allById = new Map(mappedAllCustomers.map((item) => [item.id, item]));
            const missingIds = links.map((link) => link.customer_id).filter((customerId) => !allById.has(customerId));

            if (missingIds.length > 0) {
                const missingRows = await Promise.all(
                    missingIds.map(async (customerId) => {
                        try {
                            const response = await customersService.getCustomer(customerId);
                            return response.responseData || null;
                        } catch {
                            return null;
                        }
                    }),
                );

                const validMissingRows = missingRows.filter((row): row is CustomerApiRow => Boolean(row));
                if (validMissingRows.length > 0) {
                    validMissingRows.forEach((row) => {
                        allById.set(row.id, mapCustomerRow(row, assignedUsersByCustomerId, assigneeRolesByUserId));
                    });
                }
            }

            const mappedMembers: GroupMemberItem[] = links
                .map((link) => {
                    const customer = allById.get(link.customer_id);
                    if (!customer) {
                        return {
                            customerTagId: link.id,
                            id: link.customer_id,
                            customerName: "Khách hàng",
                            phone: undefined,
                            assigneeIds: [],
                            leaderAssigneeName: "-",
                            workerAssigneeName: "-",
                        };
                    }

                    return {
                        customerTagId: link.id,
                        ...customer,
                    };
                })
                .sort((a, b) => a.customerName.localeCompare(b.customerName, "vi"));

            setMembers(mappedMembers);
            setSelectedToAdd([]);
            setSelectedToRemove([]);
            setEditingAssigneeCustomerId(null);
            setAssigneeSearchKeyword("");
            setAssigneeDraftIds([]);
        } catch (error) {
            toast.error("Không thể tải dữ liệu nhóm", toErrorMessage(error, "Đã có lỗi xảy ra."));
        } finally {
            setIsLoading(false);
        }
    }, [getCustomerTagsByGroup, groupId, mapCustomerRow, router, toast]);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    const memberIdSet = useMemo(() => new Set(members.map((member) => member.id)), [members]);

    const addableCustomers = useMemo(() => {
        const source = allCustomers.filter((customer) => !memberIdSet.has(customer.id));
        if (!searchAdd.trim()) {
            return source;
        }

        const query = searchAdd.toLowerCase();
        return source.filter(
            (customer) =>
                customer.customerName.toLowerCase().includes(query) ||
                (customer.phone || "").includes(query) ||
                customer.id.toLowerCase().includes(query),
        );
    }, [allCustomers, memberIdSet, searchAdd]);

    const selectedToAddSet = useMemo(() => new Set(selectedToAdd), [selectedToAdd]);
    const selectedToRemoveSet = useMemo(() => new Set(selectedToRemove), [selectedToRemove]);
    const userNameById = useMemo(
        () => Object.fromEntries(userOptions.map((option) => [option.id, option.label])),
        [userOptions],
    );
    const userRolesById = useMemo(
        () => Object.fromEntries(userOptions.map((option) => [option.id, option.role])),
        [userOptions],
    );
    const editingAssigneeCustomer = useMemo(
        () => members.find((member) => member.id === editingAssigneeCustomerId) || null,
        [editingAssigneeCustomerId, members],
    );

    const findScrollableParent = useCallback((node: HTMLElement | null): HTMLElement | null => {
        if (!node) return null;
        let parent: HTMLElement | null = node.parentElement;
        while (parent) {
            try {
                const style = getComputedStyle(parent);
                const overflowY = style.overflowY;
                if (
                    (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") &&
                    parent.scrollHeight > parent.clientHeight
                ) {
                    return parent;
                }
            } catch {
                // ignore
            }
            parent = parent.parentElement;
        }

        return document.scrollingElement as HTMLElement | null;
    }, []);

    const scrollToEditor = useCallback(
        (node: HTMLElement) => {
            const scrollParent = findScrollableParent(node) || (document.scrollingElement as HTMLElement | null);
            if (
                !scrollParent ||
                scrollParent === document.scrollingElement ||
                scrollParent === document.body ||
                scrollParent === document.documentElement
            ) {
                node.scrollIntoView({ behavior: "smooth", block: "start" });
                setTimeout(() => assigneeSearchInputRef.current?.focus(), 120);
                return;
            }

            const nodeRect = node.getBoundingClientRect();
            const parentRect = scrollParent.getBoundingClientRect();
            const offsetTop = nodeRect.top - parentRect.top + scrollParent.scrollTop;
            scrollParent.scrollTo({ top: Math.max(0, offsetTop - 8), behavior: "smooth" });
            setTimeout(() => assigneeSearchInputRef.current?.focus(), 200);
        },
        [findScrollableParent],
    );

    useEffect(() => {
        if (!editingAssigneeCustomer) return;

        let raf1 = 0;
        let raf2 = 0;
        raf1 = requestAnimationFrame(() => {
            raf2 = requestAnimationFrame(() => {
                const el = assigneeEditorRef.current;
                if (el) {
                    scrollToEditor(el);
                }
            });
        });

        return () => {
            cancelAnimationFrame(raf1);
            cancelAnimationFrame(raf2);
        };
    }, [editingAssigneeCustomer, scrollToEditor]);

    const filteredAssigneeOptions = useMemo(() => {
        const keyword = assigneeSearchKeyword.trim().toLowerCase();
        if (!keyword) {
            return userOptions;
        }

        return userOptions.filter((option) => option.label.toLowerCase().includes(keyword));
    }, [assigneeSearchKeyword, userOptions]);

    const filteredLeaderOptions = useMemo(
        () => filteredAssigneeOptions.filter((option) => option.role === LEADER_ROLE_NAME),
        [filteredAssigneeOptions],
    );

    const filteredWorkerOptions = useMemo(
        () => filteredAssigneeOptions.filter((option) => option.role === WORKER_ROLE_NAME),
        [filteredAssigneeOptions],
    );

    const allFilteredAssigneesSelected =
        filteredAssigneeOptions.length > 0 &&
        filteredAssigneeOptions.every((option) => assigneeDraftIds.includes(option.id));
    const isAllMembersSelected =
        members.length > 0 && members.every((member) => selectedToRemoveSet.has(member.customerTagId));

    const toggleAddSelection = useCallback((customerId: string) => {
        setSelectedToAdd((prev) =>
            prev.includes(customerId) ? prev.filter((id) => id !== customerId) : [...prev, customerId],
        );
    }, []);

    const toggleRemoveSelection = useCallback((customerTagId: string) => {
        setSelectedToRemove((prev) =>
            prev.includes(customerTagId)
                ? prev.filter((id) => id !== customerTagId)
                : [...prev, customerTagId],
        );
    }, []);

    const toggleSelectAllMembers = useCallback(() => {
        if (isAllMembersSelected) {
            setSelectedToRemove([]);
            return;
        }

        setSelectedToRemove(members.map((member) => member.customerTagId));
    }, [isAllMembersSelected, members]);

    const openAssigneeEditor = useCallback((member: GroupMemberItem) => {
        setEditingAssigneeCustomerId(member.id);
        setAssigneeSearchKeyword("");
        setAssigneeDraftIds(member.assigneeIds);
    }, []);

    const cancelAssigneeEdit = useCallback(() => {
        setEditingAssigneeCustomerId(null);
        setAssigneeSearchKeyword("");
        setAssigneeDraftIds([]);
    }, []);

    const toggleAssigneeSelection = useCallback((userId: string) => {
        setAssigneeDraftIds((prev) =>
            prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
        );
    }, []);

    const toggleSelectAllFilteredAssignees = useCallback(() => {
        setAssigneeDraftIds((prev) => {
            const next = new Set(prev);

            if (allFilteredAssigneesSelected) {
                filteredAssigneeOptions.forEach((option) => next.delete(option.id));
            } else {
                filteredAssigneeOptions.forEach((option) => next.add(option.id));
            }

            return Array.from(next);
        });
    }, [allFilteredAssigneesSelected, filteredAssigneeOptions]);

    const handleAddSelectedCustomers = useCallback(async () => {
        if (selectedToAdd.length === 0) {
            toast.error("Chưa chọn khách hàng", "Vui lòng chọn ít nhất một khách hàng để thêm vào nhóm.");
            return;
        }

        setIsSaving(true);
        try {
            const payload = selectedToAdd.map((customerId) => ({
                customer_id: customerId,
                tag_id: groupId,
            }));

            await customerTagsService.createCustomerTags(payload);
            toast.success("Thêm khách hàng thành công", `Đã thêm ${payload.length} khách hàng vào nhóm.`);
            await loadData();
        } catch (error) {
            toast.error("Thêm khách hàng thất bại", toErrorMessage(error, "Không thể thêm khách hàng vào nhóm."));
        } finally {
            setIsSaving(false);
        }
    }, [groupId, loadData, selectedToAdd, toast]);

    const handleRemoveSelectedCustomers = useCallback(async () => {
        if (selectedToRemove.length === 0) {
            toast.error("Chưa chọn khách hàng", "Vui lòng chọn ít nhất một khách hàng để xóa khỏi nhóm.");
            return;
        }

        setIsSaving(true);
        try {
            await Promise.all(selectedToRemove.map((customerTagId) => customerTagsService.deleteCustomerTag(customerTagId)));
            toast.success("Xóa khách hàng thành công", `Đã xóa ${selectedToRemove.length} khách hàng khỏi nhóm.`);
            await loadData();
        } catch (error) {
            toast.error("Xóa khách hàng thất bại", toErrorMessage(error, "Không thể xóa khách hàng khỏi nhóm."));
        } finally {
            setIsSaving(false);
        }
    }, [loadData, selectedToRemove, toast]);

    const handleRemoveSingleCustomer = useCallback(async (customerTagId: string) => {
        setIsSaving(true);
        try {
            await customerTagsService.deleteCustomerTag(customerTagId);
            toast.success("Xóa khách hàng thành công", "Đã xóa khách hàng khỏi nhóm.");
            await loadData();
        } catch (error) {
            toast.error("Xóa khách hàng thất bại", toErrorMessage(error, "Không thể xóa khách hàng khỏi nhóm."));
        } finally {
            setIsSaving(false);
        }
    }, [loadData, toast]);

    const handleAssignCustomerOwner = useCallback(async () => {
        if (!editingAssigneeCustomer) {
            return;
        }

        const customerId = editingAssigneeCustomer.id;
        setAssigningCustomerId(customerId);
        try {
            await customerAssignedUsersService.syncCustomerAssignedUsers(customerId, assigneeDraftIds);

            const leaderAssigneeName =
                assigneeDraftIds
                    .filter((id) => userRolesById[id] === LEADER_ROLE_NAME)
                    .map((id) => userNameById[id] || id)
                    .filter(Boolean)
                    .join("\n") || "-";

            const workerAssigneeName =
                assigneeDraftIds
                    .filter((id) => userRolesById[id] === WORKER_ROLE_NAME)
                    .map((id) => userNameById[id] || id)
                    .filter(Boolean)
                    .join("\n") || "-";

            setMembers((prev) =>
                prev.map((member) =>
                    member.id === customerId
                        ? {
                            ...member,
                            assigneeIds: assigneeDraftIds,
                            leaderAssigneeName,
                            workerAssigneeName,
                        }
                        : member,
                ),
            );

            setAllCustomers((prev) =>
                prev.map((customer) =>
                    customer.id === customerId
                        ? {
                            ...customer,
                            assigneeIds: assigneeDraftIds,
                            leaderAssigneeName,
                            workerAssigneeName,
                        }
                        : customer,
                ),
            );

            cancelAssigneeEdit();
            toast.success("Cập nhật phụ trách", "Đã cập nhật người phụ trách cho khách hàng.");
        } catch (error) {
            toast.error("Cập nhật phụ trách thất bại", toErrorMessage(error, "Không thể cập nhật người phụ trách."));
        } finally {
            setAssigningCustomerId(null);
        }
    }, [assigneeDraftIds, cancelAssigneeEdit, editingAssigneeCustomer, toast, userNameById, userRolesById]);

    const goToGroupList = useCallback(() => {
        router.push("/customers/groups");
    }, [router]);

    const goToCustomers = useCallback(() => {
        router.push("/customers");
    }, [router]);

    return {
        groupName,
        isLoading,
        isSaving,
        members,
        selectedToRemoveSet,
        selectedToRemoveCount: selectedToRemove.length,
        isAllMembersSelected,
        addableCustomers,
        selectedToAddSet,
        selectedToAddCount: selectedToAdd.length,
        searchAdd,
        setSearchAdd,
        assigneeEditorRef,
        assigneeSearchInputRef,
        editingAssigneeCustomer,
        assigneeSearchKeyword,
        setAssigneeSearchKeyword,
        assigneeDraftIds,
        userOptionsLength: userOptions.length,
        filteredAssigneeOptionsLength: filteredAssigneeOptions.length,
        allFilteredAssigneesSelected,
        filteredLeaderOptions,
        filteredWorkerOptions,
        isAssigningCurrentCustomer:
            Boolean(editingAssigneeCustomer?.id) && assigningCustomerId === editingAssigneeCustomer?.id,
        toggleSelectAllMembers,
        toggleRemoveSelection,
        openAssigneeEditor,
        toggleAssigneeSelection,
        toggleSelectAllFilteredAssignees,
        toggleAddSelection,
        handleAddSelectedCustomers,
        handleRemoveSelectedCustomers,
        handleRemoveSingleCustomer,
        handleAssignCustomerOwner,
        cancelAssigneeEdit,
        goToGroupList,
        goToCustomers,
    };
}
