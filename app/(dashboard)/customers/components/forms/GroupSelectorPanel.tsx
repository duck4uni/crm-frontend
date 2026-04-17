"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface GroupOption {
  id: string;
  name: string;
}

interface GroupSelectorPanelProps {
  isLoadingGroups: boolean;
  groupOptions: GroupOption[];
  filteredGroupOptions: GroupOption[];
  selectedGroupIds: string[];
  selectedGroupNameById: Record<string, string>;
  groupSearchKeyword: string;
  onGroupSearchKeywordChange: (value: string) => void;
  allFilteredGroupsSelected: boolean;
  onToggleSelectAllFilteredGroups: () => void;
  onToggleGroupSelection: (groupId: string) => void;
  isSubmitting: boolean;
}

export function GroupSelectorPanel({
  isLoadingGroups,
  groupOptions,
  filteredGroupOptions,
  selectedGroupIds,
  selectedGroupNameById,
  groupSearchKeyword,
  onGroupSearchKeywordChange,
  allFilteredGroupsSelected,
  onToggleSelectAllFilteredGroups,
  onToggleGroupSelection,
  isSubmitting,
}: GroupSelectorPanelProps) {
  return (
    <div className="rounded-lg border border-gray-200 p-4 space-y-3">
      {isLoadingGroups && <p className="text-sm text-gray-500">Đang tải danh sách nhóm...</p>}
      {!isLoadingGroups && groupOptions.length === 0 && (
        <p className="text-sm text-gray-500">Chưa có nhóm khách hàng nào.</p>
      )}
      {!isLoadingGroups && groupOptions.length > 0 && (
        <div className="space-y-3">
          <Input
            name="groupSearch"
            value={groupSearchKeyword}
            onChange={(event) => onGroupSearchKeywordChange(event.target.value)}
            placeholder="Tìm theo tên nhóm khách hàng"
            disabled={isSubmitting}
          />

          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-gray-500">
              Hiển thị {filteredGroupOptions.length}/{groupOptions.length} nhóm
            </p>
            <Button
              type="button"
              variant="outline"
              className="h-8 px-3 text-xs"
              onClick={onToggleSelectAllFilteredGroups}
              disabled={isSubmitting || filteredGroupOptions.length === 0}
            >
              {allFilteredGroupsSelected ? "Bỏ chọn nhóm đang lọc" : "Chọn nhóm đang lọc"}
            </Button>
          </div>

          {filteredGroupOptions.length === 0 ? (
            <p className="text-sm text-gray-500">Không tìm thấy nhóm phù hợp.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
              {filteredGroupOptions.map((group) => {
                const isChecked = selectedGroupIds.includes(group.id);
                return (
                  <label
                    key={group.id}
                    className={`flex items-center gap-3 rounded-md border px-3 py-2 cursor-pointer transition-colors ${
                      isChecked ? "border-primary-500 bg-primary-50" : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onToggleGroupSelection(group.id)}
                      disabled={isSubmitting}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-900">{group.name}</span>
                  </label>
                );
              })}
            </div>
          )}

          {selectedGroupIds.length > 0 && (
            <div className="rounded-md border border-dashed border-gray-300 p-2">
              <p className="text-xs text-gray-500 mb-2">Nhóm đã chọn</p>
              <div className="flex flex-wrap gap-2">
                {selectedGroupIds.map((groupId) => (
                  <span
                    key={groupId}
                    className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-1 text-xs font-medium text-primary-700"
                  >
                    {selectedGroupNameById[groupId] || groupId}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      <p className="text-xs text-gray-500">Đã chọn {selectedGroupIds.length} nhóm.</p>
    </div>
  );
}
