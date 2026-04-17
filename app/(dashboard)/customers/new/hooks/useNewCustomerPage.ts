import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { customerAssignedUsersService } from "@/services/customer-assigned-users";
import { customerTagsService } from "@/services/customer-tags";
import { customersService } from "@/services/customers";
import { Customer } from "@/types/customer";
import { useStableToastRef } from "@/hooks/useStableToastRef";
import { mapFormToCreatePayload, resolveAssignedUserIds } from "../utils/newCustomerMappers";

export function useNewCustomerPage() {
    const router = useRouter();
    const toastRef = useStableToastRef();

    const goToCustomers = useCallback(() => {
        router.push("/customers");
    }, [router]);

    const handleSave = useCallback(
        async (formData: Partial<Customer>, groupIds: string[]) => {
            const assignedUserIds = resolveAssignedUserIds(formData);
            const response = await customersService.createCustomer(mapFormToCreatePayload(formData));
            const createdCustomerId = response.responseData?.id;

            if (!createdCustomerId) {
                throw new Error("Không nhận được mã khách hàng sau khi tạo.");
            }

            await customersService.updateCustomer(createdCustomerId, {
                assigned_user_id: assignedUserIds[0] || null,
            });

            if (assignedUserIds.length > 0) {
                await customerAssignedUsersService.setCustomerAssignedUsers({
                    customer_id: createdCustomerId,
                    assigned_user_ids: assignedUserIds,
                });
            }

            const normalizedGroupIds = Array.from(new Set(groupIds.filter(Boolean)));
            if (normalizedGroupIds.length > 0) {
                await customerTagsService.createCustomerTags(
                    normalizedGroupIds.map((groupId) => ({
                        customer_id: createdCustomerId,
                        tag_id: groupId,
                    })),
                );
            }

            toastRef.current.success("Thêm mới thành công", `Khách hàng \"${formData.customerName}\" đã được tạo.`);
            router.push(`/customers/${createdCustomerId}`);
        },
        [router, toastRef],
    );

    return {
        handleSave,
        goToCustomers,
    };
}
