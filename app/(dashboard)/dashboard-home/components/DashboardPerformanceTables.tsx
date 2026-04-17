import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { FiAward, FiCheckCircle } from "react-icons/fi";

type PerformanceItem = {
    name: string;
    closedJobs: number;
    responseRate: number;
};

type DashboardPerformanceTablesProps = {
    leaderData: PerformanceItem[];
    workerData: PerformanceItem[];
};

function PerformanceTable({
    title,
    icon: Icon,
    iconClass,
    rows,
}: {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    iconClass: string;
    rows: PerformanceItem[];
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Icon className={iconClass} />
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b bg-gray-50">
                            <th className="text-left px-4 py-2 font-medium text-gray-600">Tên</th>
                            <th className="text-center px-4 py-2 font-medium text-gray-600">Việc hoàn thành</th>
                            <th className="text-center px-4 py-2 font-medium text-gray-600">Tỷ lệ phản hồi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((item) => (
                            <tr key={item.name} className="border-b last:border-0 hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium text-gray-800">{item.name}</td>
                                <td className="px-4 py-3 text-center text-primary-600 font-semibold">{item.closedJobs}</td>
                                <td className="px-4 py-3 text-center">
                                    <span
                                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${item.responseRate >= 90 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                                            }`}
                                    >
                                        {item.responseRate}%
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </CardContent>
        </Card>
    );
}

export function DashboardPerformanceTables({
    leaderData,
    workerData,
}: DashboardPerformanceTablesProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PerformanceTable title="Hiệu suất Leader" icon={FiAward} iconClass="text-indigo-600" rows={leaderData} />
            <PerformanceTable title="Hiệu suất Thợ" icon={FiCheckCircle} iconClass="text-green-600" rows={workerData} />
        </div>
    );
}
