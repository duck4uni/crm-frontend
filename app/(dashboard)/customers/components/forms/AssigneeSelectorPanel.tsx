"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatPermissionName } from "@/lib/utils";
import type { UserOption } from "./hooks/useCustomerEditorForm";

const LEADER_ROLE_NAME = "SITE LEADER";
const WORKER_ROLE_NAME = "SITE WORKER";

interface AssigneeSelectorPanelProps {
  isSubmitting: boolean;
  isLoadingUsers: boolean;
  assigneeSearchKeyword: string;
  onAssigneeSearchKeywordChange: (value: string) => void;
  userOptions: UserOption[];
  filteredUserOptions: UserOption[];
  filteredLeaderOptions: UserOption[];
  filteredWorkerOptions: UserOption[];
  selectedAssignedUserIds: string[];
  userNameById: Record<string, string>;
  allFilteredAssigneesSelected: boolean;
  onToggleSelectAllFilteredAssignees: () => void;
  onToggleAssigneeSelection: (userId: string) => void;
}

export function AssigneeSelectorPanel({
  isSubmitting,
  isLoadingUsers,
  assigneeSearchKeyword,
  onAssigneeSearchKeywordChange,
  userOptions,
  filteredUserOptions,
  filteredLeaderOptions,
  filteredWorkerOptions,
  selectedAssignedUserIds,
  userNameById,
  allFilteredAssigneesSelected,
  onToggleSelectAllFilteredAssignees,
  onToggleAssigneeSelection,
}: AssigneeSelectorPanelProps) {
  return (
    <div className="md:col-span-2 rounded-lg border border-gray-200 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="text-sm font-medium text-gray-700">Người phụ trách</p>
        <p className="text-xs text-gray-500">Đã chọn {selectedAssignedUserIds.length} người</p>
      </div>

      <Input
        name="assigneeSearch"
        value={assigneeSearchKeyword}
        onChange={(event) => onAssigneeSearchKeywordChange(event.target.value)}
        placeholder="Tìm theo tên user"
        disabled={isSubmitting || isLoadingUsers}
      />

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="text-xs text-gray-500">
          Hiển thị {filteredUserOptions.length}/{userOptions.length} user
        </p>
        <Button
          type="button"
          variant="outline"
          className="h-8 px-3 text-xs"
          onClick={onToggleSelectAllFilteredAssignees}
          disabled={isSubmitting || isLoadingUsers || filteredUserOptions.length === 0}
        >
          {allFilteredAssigneesSelected ? "Bỏ chọn user đang lọc" : "Chọn user đang lọc"}
        </Button>
      </div>

      {isLoadingUsers && <p className="text-sm text-gray-500">Đang tải danh sách user...</p>}

      {!isLoadingUsers && userOptions.length === 0 && (
        <p className="text-sm text-gray-500">Không có user nào để gán phụ trách.</p>
      )}

      {!isLoadingUsers && userOptions.length > 0 && filteredUserOptions.length === 0 && (
        <p className="text-sm text-gray-500">Không tìm thấy user phù hợp.</p>
      )}

      {!isLoadingUsers && filteredUserOptions.length > 0 && (
        <div className="space-y-4">
          <AssigneeRoleSection
            title={formatPermissionName(LEADER_ROLE_NAME)}
            users={filteredLeaderOptions}
            selectedIds={selectedAssignedUserIds}
            onToggle={onToggleAssigneeSelection}
            disabled={isSubmitting}
          />

          <AssigneeRoleSection
            title={formatPermissionName(WORKER_ROLE_NAME)}
            users={filteredWorkerOptions}
            selectedIds={selectedAssignedUserIds}
            onToggle={onToggleAssigneeSelection}
            disabled={isSubmitting}
          />
        </div>
      )}

      {selectedAssignedUserIds.length > 0 && (
        <div className="rounded-md border border-dashed border-gray-300 p-2">
          <p className="text-xs text-gray-500 mb-2">Đang phụ trách</p>
          <div className="flex flex-wrap gap-2">
            {selectedAssignedUserIds.map((userId) => (
              <span
                key={userId}
                className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-1 text-xs font-medium text-primary-700"
              >
                {userNameById[userId] || userId}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AssigneeRoleSection({
  title,
  users,
  selectedIds,
  onToggle,
  disabled,
}: {
  title: string;
  users: UserOption[];
  selectedIds: string[];
  onToggle: (userId: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="border border-gray-200 rounded-md overflow-hidden">
      <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-700 uppercase tracking-wider">
        {title} ({users.length})
      </div>

      {users.length === 0 ? (
        <p className="px-3 py-3 text-sm text-gray-500">Không có user phù hợp.</p>
      ) : (
        <div className="max-h-52 overflow-y-auto">
          <table className="w-full">
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => {
                const isChecked = selectedIds.includes(user.id);

                return (
                  <tr key={user.id} className={isChecked ? "bg-primary-50" : "hover:bg-gray-50"}>
                    <td className="px-3 py-2 w-10">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onToggle(user.id)}
                        disabled={disabled}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-900">{user.label}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
