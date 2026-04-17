import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Trash2, Users } from "lucide-react";
import { GroupItem, UserOption } from "../hooks/useCustomerGroupsPage";

type CustomerGroupsTableProps = {
    groups: GroupItem[];
    isLoading: boolean;
    userOptions: UserOption[];
    groupOwnerByTagId: Record<string, string>;
    assigningGroupId: string | null;
    onAssignGroupOwner: (groupId: string, userId: string) => void;
    onOpenGroupDetail: (groupId: string) => void;
    onDeleteGroup: (group: GroupItem) => void;
};

export function CustomerGroupsTable({
    groups,
    isLoading,
    userOptions,
    groupOwnerByTagId,
    assigningGroupId,
    onAssignGroupOwner,
    onOpenGroupDetail,
    onDeleteGroup,
}: CustomerGroupsTableProps) {
    return (
        <Card>
            <CardContent className="p-0 overflow-x-auto">
                <table className="w-full table-fixed">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[44%]">Tên nhóm</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Số khách hàng</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[28%]">Người phụ trách</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-44">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {groups.map((group) => (
                            <tr key={group.id} className="hover:bg-gray-50">
                                <td className="px-4 py-4">
                                    <div className="font-medium text-gray-900 truncate">{group.name}</div>
                                </td>
                                <td className="px-4 py-4 text-sm text-gray-700">{group.customerCount}</td>
                                <td className="px-4 py-4">
                                    <Select
                                        value={groupOwnerByTagId[group.id] || ""}
                                        onChange={(e) => onAssignGroupOwner(group.id, e.target.value)}
                                        disabled={isLoading || assigningGroupId === group.id}
                                        variant="subtle"
                                        size="sm"
                                        placeholder="Chưa gán"
                                        options={userOptions.map((option) => ({
                                            value: option.id,
                                            label: option.label,
                                        }))}
                                    />
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                                        <Button variant="outline" size="sm" onClick={() => onOpenGroupDetail(group.id)}>
                                            <Users className="w-4 h-4 mr-2" />
                                            Quản lý
                                        </Button>

                                        <Button
                                            variant="danger"
                                            size="sm"
                                            className="px-3"
                                            onClick={() => onDeleteGroup(group)}
                                            disabled={isLoading}
                                            title="Xóa nhóm"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {!isLoading && groups.length === 0 && (
                    <div className="p-10 text-center text-sm text-gray-500">Không tìm thấy nhóm phù hợp.</div>
                )}
            </CardContent>
        </Card>
    );
}
