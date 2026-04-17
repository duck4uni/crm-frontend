import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Search, UserPlus } from "lucide-react";
import { CustomerLookupItem, splitAssigneeLines } from "../utils/customerGroupDetailUtils";

type AddableCustomersPanelProps = {
    addableCustomers: CustomerLookupItem[];
    selectedToAddSet: Set<string>;
    selectedToAddCount: number;
    searchAdd: string;
    isSaving: boolean;
    onSearchAddChange: (value: string) => void;
    onToggleAddSelection: (customerId: string) => void;
    onAddSelectedCustomers: () => void;
};

export function AddableCustomersPanel({
    addableCustomers,
    selectedToAddSet,
    selectedToAddCount,
    searchAdd,
    isSaving,
    onSearchAddChange,
    onToggleAddSelection,
    onAddSelectedCustomers,
}: AddableCustomersPanelProps) {
    return (
        <Card className="overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 space-y-3 bg-gray-50">
                <div>
                    <h2 className="text-sm font-semibold text-gray-900">Thêm khách hàng vào nhóm</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Chọn nhiều khách để thêm cùng lúc.</p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative flex-1 min-w-[260px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Tìm khách hàng để thêm vào nhóm"
                            value={searchAdd}
                            onChange={(e) => onSearchAddChange(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={onAddSelectedCustomers}
                        disabled={isSaving || selectedToAddCount === 0}
                        className="whitespace-nowrap"
                    >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Thêm ({selectedToAddCount})
                    </Button>
                </div>
            </div>

            <div className="max-h-[560px] overflow-y-auto">
                <table className="w-full table-fixed">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3 text-left w-12 sticky top-0 z-20 bg-gray-50" />
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap w-[40%] sticky top-0 z-20 bg-gray-50">Tên khách hàng</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap w-[30%] sticky top-0 z-20 bg-gray-50">Leader</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap w-[30%] sticky top-0 z-20 bg-gray-50">Worker</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {addableCustomers.map((customer) => (
                            <tr key={customer.id} className={selectedToAddSet.has(customer.id) ? "bg-green-50" : "hover:bg-gray-50"}>
                                <td className="px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedToAddSet.has(customer.id)}
                                        onChange={() => onToggleAddSelection(customer.id)}
                                        className="rounded border-gray-300"
                                    />
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                    <div className="font-medium truncate" title={customer.customerName}>{customer.customerName}</div>
                                    <div className="text-xs text-gray-500 truncate" title={customer.phone || "-"}>{customer.phone || "-"}</div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700 align-top">
                                    <div className="space-y-1">
                                        {splitAssigneeLines(customer.leaderAssigneeName || "-").map((line, index) => (
                                            <p key={`${customer.id}-leader-${index}`} className="whitespace-nowrap">{line}</p>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700 align-top">
                                    <div className="space-y-1">
                                        {splitAssigneeLines(customer.workerAssigneeName || "-").map((line, index) => (
                                            <p key={`${customer.id}-worker-${index}`} className="whitespace-nowrap">{line}</p>
                                        ))}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {addableCustomers.length === 0 && (
                    <div className="p-8 text-center text-sm text-gray-500">Không còn khách hàng phù hợp để thêm vào nhóm.</div>
                )}
            </div>
        </Card>
    );
}
