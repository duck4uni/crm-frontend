import { RefObject } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { formatPermissionName } from "@/lib/utils";
import { Trash2, Users } from "lucide-react";
import {
    GroupMemberItem,
    LEADER_ROLE_NAME,
    splitAssigneeLines,
    UserOption,
    WORKER_ROLE_NAME,
} from "../utils/customerGroupDetailUtils";
import { AssigneeRoleSection } from "./AssigneeRoleSection";

type GroupMembersPanelProps = {
    members: GroupMemberItem[];
    selectedToRemoveSet: Set<string>;
    isAllMembersSelected: boolean;
    isSaving: boolean;
    selectedToRemoveCount: number;
    onToggleSelectAllMembers: () => void;
    onRemoveSelected: () => void;
    onToggleRemoveSelection: (customerTagId: string) => void;
    onOpenAssigneeEditor: (member: GroupMemberItem) => void;
    onRemoveSingleCustomer: (customerTagId: string) => void;
    editingAssigneeCustomer: GroupMemberItem | null;
    assigneeEditorRef: RefObject<HTMLDivElement>;
    assigneeSearchInputRef: RefObject<HTMLInputElement>;
    assigneeSearchKeyword: string;
    onAssigneeSearchKeywordChange: (value: string) => void;
    assigneeDraftIds: string[];
    userOptionsLength: number;
    filteredAssigneeOptionsLength: number;
    allFilteredAssigneesSelected: boolean;
    isAssigningCurrentCustomer: boolean;
    onCancelAssigneeEdit: () => void;
    onSaveAssignee: () => void;
    onToggleSelectAllFilteredAssignees: () => void;
    filteredLeaderOptions: UserOption[];
    filteredWorkerOptions: UserOption[];
    onToggleAssigneeSelection: (userId: string) => void;
};

export function GroupMembersPanel({
    members,
    selectedToRemoveSet,
    isAllMembersSelected,
    isSaving,
    selectedToRemoveCount,
    onToggleSelectAllMembers,
    onRemoveSelected,
    onToggleRemoveSelection,
    onOpenAssigneeEditor,
    onRemoveSingleCustomer,
    editingAssigneeCustomer,
    assigneeEditorRef,
    assigneeSearchInputRef,
    assigneeSearchKeyword,
    onAssigneeSearchKeywordChange,
    assigneeDraftIds,
    userOptionsLength,
    filteredAssigneeOptionsLength,
    allFilteredAssigneesSelected,
    isAssigningCurrentCustomer,
    onCancelAssigneeEdit,
    onSaveAssignee,
    onToggleSelectAllFilteredAssignees,
    filteredLeaderOptions,
    filteredWorkerOptions,
    onToggleAssigneeSelection,
}: GroupMembersPanelProps) {
    return (
        <Card className="overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between gap-2 flex-wrap bg-gray-50">
                <div>
                    <h2 className="text-sm font-semibold text-gray-900">Khách hàng trong nhóm ({members.length})</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Danh sách thành viên hiện có của nhóm.</p>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={onToggleSelectAllMembers} disabled={members.length === 0}>
                        {isAllMembersSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                    </Button>
                    <Button
                        variant="danger"
                        size="sm"
                        onClick={onRemoveSelected}
                        disabled={isSaving || selectedToRemoveCount === 0}
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Xóa đã chọn ({selectedToRemoveCount})
                    </Button>
                </div>
            </div>

            <div className="max-h-[560px] overflow-y-auto">
                <table className="w-full table-fixed">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3 text-left w-12 sticky top-0 z-20 bg-gray-50" />
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap w-[26%] sticky top-0 z-20 bg-gray-50">Tên khách hàng</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap w-[26%] sticky top-0 z-20 bg-gray-50">Leader</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap w-[24%] sticky top-0 z-20 bg-gray-50">Worker</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap w-[24%] sticky top-0 z-20 bg-gray-50">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {members.map((member) => (
                            <tr
                                key={member.customerTagId}
                                className={selectedToRemoveSet.has(member.customerTagId) ? "bg-red-50" : "hover:bg-gray-50"}
                            >
                                <td className="px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedToRemoveSet.has(member.customerTagId)}
                                        onChange={() => onToggleRemoveSelection(member.customerTagId)}
                                        className="rounded border-gray-300"
                                    />
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                    <div className="font-medium truncate" title={member.customerName}>{member.customerName}</div>
                                    <div className="text-xs text-gray-500 truncate" title={member.phone || "-"}>{member.phone || "-"}</div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700 align-top">
                                    <div className="space-y-1">
                                        {splitAssigneeLines(member.leaderAssigneeName || "-").map((line, index) => (
                                            <p key={`${member.id}-leader-${index}`} className="whitespace-nowrap">{line}</p>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700 align-top">
                                    <div className="space-y-1">
                                        {splitAssigneeLines(member.workerAssigneeName || "-").map((line, index) => (
                                            <p key={`${member.id}-worker-${index}`} className="whitespace-nowrap">{line}</p>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="p-2"
                                            onClick={() => onOpenAssigneeEditor(member)}
                                            disabled={isSaving}
                                            title="Phân người phụ trách"
                                        >
                                            <Users className="w-4 h-4" />
                                        </Button>
                                        <button
                                            onClick={() => onRemoveSingleCustomer(member.customerTagId)}
                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                            title="Xóa khách khỏi nhóm"
                                            disabled={isSaving}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {members.length === 0 && (
                    <div className="p-8 text-center text-sm text-gray-500">Nhóm này hiện chưa có khách hàng.</div>
                )}
            </div>

            {editingAssigneeCustomer && (
                <div ref={assigneeEditorRef} className="border-t border-gray-200 p-4 space-y-3 bg-white">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div>
                            <p className="text-sm font-semibold text-gray-900">Phân người phụ trách: {editingAssigneeCustomer.customerName}</p>
                            <p className="text-xs text-gray-500 mt-0.5">Đã chọn {assigneeDraftIds.length} người</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={onCancelAssigneeEdit} disabled={isAssigningCurrentCustomer}>
                                Hủy
                            </Button>
                            <Button type="button" size="sm" onClick={onSaveAssignee} disabled={isAssigningCurrentCustomer}>
                                Lưu phụ trách
                            </Button>
                        </div>
                    </div>

                    <Input
                        ref={assigneeSearchInputRef}
                        value={assigneeSearchKeyword}
                        onChange={(event) => onAssigneeSearchKeywordChange(event.target.value)}
                        placeholder="Tìm theo tên user"
                        disabled={isAssigningCurrentCustomer}
                    />

                    <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="text-xs text-gray-500">Hiển thị {filteredAssigneeOptionsLength}/{userOptionsLength} user</p>
                        <Button
                            type="button"
                            variant="outline"
                            className="h-8 px-3 text-xs"
                            onClick={onToggleSelectAllFilteredAssignees}
                            disabled={filteredAssigneeOptionsLength === 0 || isAssigningCurrentCustomer}
                        >
                            {allFilteredAssigneesSelected ? "Bỏ chọn user đang lọc" : "Chọn user đang lọc"}
                        </Button>
                    </div>

                    <CardContent className="space-y-3 p-0">
                        <AssigneeRoleSection
                            title={formatPermissionName(LEADER_ROLE_NAME)}
                            users={filteredLeaderOptions}
                            selectedIds={assigneeDraftIds}
                            onToggle={onToggleAssigneeSelection}
                            disabled={isAssigningCurrentCustomer}
                        />
                        <AssigneeRoleSection
                            title={formatPermissionName(WORKER_ROLE_NAME)}
                            users={filteredWorkerOptions}
                            selectedIds={assigneeDraftIds}
                            onToggle={onToggleAssigneeSelection}
                            disabled={isAssigningCurrentCustomer}
                        />
                    </CardContent>
                </div>
            )}
        </Card>
    );
}
