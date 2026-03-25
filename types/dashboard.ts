export interface DashboardStats {
  totalContacts: number;
  totalCompanies: number;
  activeDeals: number;
  totalRevenue: number;
  monthlyRevenue: number;
  dealsWonThisMonth: number;
  tasksOverdue: number;
  tasksDueToday: number;
}

export interface RevenueData {
  month: string;
  revenue: number;
}

export interface DealsByStage {
  stage: string;
  count: number;
  value: number;
}

export interface TopPerformer {
  id: string;
  name: string;
  dealsWon: number;
  revenue: number;
  avatar?: string;
}
