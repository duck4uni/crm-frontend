import { Card, CardContent } from "@/components/ui/Card";

type DashboardKpiCard = {
    title: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
    sub: string;
};

type DashboardKpiGridProps = {
    cards: DashboardKpiCard[];
};

export function DashboardKpiGrid({ cards }: DashboardKpiGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((stat) => {
                const Icon = stat.icon;
                return (
                    <Card key={stat.title}>
                        <CardContent className="flex items-center justify-between pt-5">
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                                <p className="mt-1 text-3xl font-bold text-gray-900">{stat.value}</p>
                                <p className="mt-1 text-xs text-gray-400">{stat.sub}</p>
                            </div>
                            <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                                <Icon className={`w-7 h-7 ${stat.color}`} />
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
