"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useState } from "react";
import { Users, Plus, Trash2, Edit2, Check } from "lucide-react";

interface CustomerGroup {
    id: string;
    name: string;
    customerCount: number;
    color: string;
    description?: string;
}

interface CustomerGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectGroup: (groupId: string) => void;
}

const MOCK_GROUPS: CustomerGroup[] = [
    { id: "1", name: "VIP", customerCount: 45, color: "bg-purple-500", description: "Khách hàng VIP - chi tiêu cao" },
    { id: "2", name: "Doanh nghiệp", customerCount: 28, color: "bg-blue-500", description: "Khách hàng doanh nghiệp" },
    { id: "3", name: "Cá nhân", customerCount: 156, color: "bg-green-500", description: "Khách hàng cá nhân" },
    { id: "4", name: "Tiềm năng", customerCount: 89, color: "bg-yellow-500", description: "Khách hàng tiềm năng" },
    { id: "5", name: "Mất liên lạc", customerCount: 12, color: "bg-red-500", description: "Khách hàng mất liên lạc" },
];

export function CustomerGroupModal({ isOpen, onClose, onSelectGroup }: CustomerGroupModalProps) {
    const [groups, setGroups] = useState<CustomerGroup[]>(MOCK_GROUPS);
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [newGroupName, setNewGroupName] = useState("");

    const handleSelectGroup = (groupId: string) => {
        setSelectedGroupId(groupId);
    };

    const handleConfirm = () => {
        if (selectedGroupId) {
            onSelectGroup(selectedGroupId);
            onClose();
        }
    };

    const handleCreateGroup = () => {
        if (newGroupName.trim()) {
            const newGroup: CustomerGroup = {
                id: Date.now().toString(),
                name: newGroupName,
                customerCount: 0,
                color: "bg-gray-500",
            };
            setGroups([...groups, newGroup]);
            setNewGroupName("");
            setIsCreating(false);
        }
    };

    const handleDeleteGroup = (groupId: string) => {
        setGroups(groups.filter((g) => g.id !== groupId));
        if (selectedGroupId === groupId) {
            setSelectedGroupId(null);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Chọn nhóm khách hàng"
            size="lg"
            footer={
                <div className="flex gap-3 justify-end">
                    <Button variant="outline" onClick={onClose}>
                        Hủy
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleConfirm}
                        disabled={!selectedGroupId}
                    >
                        <Check className="w-4 h-4 mr-2" />
                        Áp dụng nhóm
                    </Button>
                </div>
            }
        >
            <div className="space-y-4">
                {/* Create New Group */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    {!isCreating ? (
                        <button
                            onClick={() => setIsCreating(true)}
                            className="w-full flex items-center justify-center gap-2 py-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Tạo nhóm mới
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <Input
                                placeholder="Tên nhóm khách hàng"
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && handleCreateGroup()}
                                autoFocus
                            />
                            <Button variant="primary" onClick={handleCreateGroup} size="sm">
                                Tạo
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsCreating(false);
                                    setNewGroupName("");
                                }}
                                size="sm"
                            >
                                Hủy
                            </Button>
                        </div>
                    )}
                </div>

                {/* Groups List */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {groups.map((group) => (
                        <div
                            key={group.id}
                            onClick={() => handleSelectGroup(group.id)}
                            className={`
                p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md group
                ${selectedGroupId === group.id
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-200 hover:border-gray-300 bg-white"
                                }
              `}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 ${group.color} rounded-lg flex items-center justify-center text-white flex-shrink-0`}>
                                    <Users className="w-5 h-5" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold text-gray-900">{group.name}</h4>
                                        {selectedGroupId === group.id && (
                                            <Check className="w-5 h-5 text-blue-600" />
                                        )}
                                    </div>
                                    {group.description && (
                                        <p className="text-sm text-gray-600 mt-0.5">{group.description}</p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">
                                        {group.customerCount} khách hàng
                                    </p>
                                </div>

                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            // Handle edit
                                        }}
                                        className="p-2 hover:bg-gray-100 rounded transition-colors"
                                        title="Chỉnh sửa"
                                    >
                                        <Edit2 className="w-4 h-4 text-gray-600" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteGroup(group.id);
                                        }}
                                        className="p-2 hover:bg-red-100 rounded transition-colors"
                                        title="Xóa"
                                    >
                                        <Trash2 className="w-4 h-4 text-red-600" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {groups.length === 0 && (
                    <div className="text-center py-12">
                        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-sm">Chưa có nhóm khách hàng</p>
                        <p className="text-gray-400 text-xs mt-1">Tạo nhóm mới để bắt đầu</p>
                    </div>
                )}
            </div>
        </Modal>
    );
}
