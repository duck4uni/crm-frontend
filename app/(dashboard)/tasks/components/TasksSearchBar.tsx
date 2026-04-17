import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FiPlus, FiSearch } from "react-icons/fi";

type TasksSearchBarProps = {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    resultCount: number;
    onCreate: () => void;
};

export function TasksSearchBar({
    searchQuery,
    onSearchChange,
    resultCount,
    onCreate,
}: TasksSearchBarProps) {
    return (
        <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center gap-3">
            <div className="flex-1 relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                    type="text"
                    placeholder="Tìm kiếm theo tên hoặc nội dung..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10"
                />
            </div>
            <span className="text-sm text-gray-500 whitespace-nowrap">{resultCount} kết quả</span>
            <Button onClick={onCreate}>
                <FiPlus className="w-4 h-4 mr-1.5" />
                Thêm công việc
            </Button>
        </div>
    );
}
