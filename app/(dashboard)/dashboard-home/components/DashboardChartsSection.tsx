import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
    Area,
    AreaChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { growthData } from "@/mock-data/reports";

type DashboardChartsSectionProps = {
    pieData: Array<{ name: string; value: number }>;
    conversionRate: number;
    totalWeeklyCustomers: number;
    totalWeeklyConverted: number;
};

const PIE_COLORS = ["#2563eb", "#e5e7eb"];

export function DashboardChartsSection({
    pieData,
    conversionRate,
    totalWeeklyCustomers,
    totalWeeklyConverted,
}: DashboardChartsSectionProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Tăng trưởng khách hàng trong tuần</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={240}>
                        <AreaChart data={growthData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorCustomers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorConverted" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey="customers"
                                name="Khách hàng"
                                stroke="#2563eb"
                                fill="url(#colorCustomers)"
                                strokeWidth={2}
                            />
                            <Area
                                type="monotone"
                                dataKey="converted"
                                name="Chuyển đổi"
                                stroke="#16a34a"
                                fill="url(#colorConverted)"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Tỷ lệ chuyển đổi</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-3">
                    <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={54}
                                outerRadius={78}
                                paddingAngle={3}
                                dataKey="value"
                            >
                                {pieData.map((_, index) => (
                                    <Cell key={index} fill={PIE_COLORS[index]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                            <span className="inline-block w-3 h-3 rounded-full bg-primary-600" />
                            Đã chuyển đổi ({totalWeeklyConverted})
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="inline-block w-3 h-3 rounded-full bg-gray-200" />
                            Chưa ({totalWeeklyCustomers - totalWeeklyConverted})
                        </span>
                    </div>
                    <p className="text-2xl font-bold text-primary-600">{conversionRate}%</p>
                </CardContent>
            </Card>
        </div>
    );
}
