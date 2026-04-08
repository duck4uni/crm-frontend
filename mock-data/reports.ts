import { GrowthItem, PerformanceItem } from "@/types/reports";

export const growthData: GrowthItem[] = [
  { label: "T2", customers: 34, converted: 9 },
  { label: "T3", customers: 52, converted: 14 },
  { label: "T4", customers: 47, converted: 12 },
  { label: "T5", customers: 69, converted: 20 },
  { label: "T6", customers: 73, converted: 24 },
  { label: "T7", customers: 64, converted: 19 },
  { label: "CN", customers: 58, converted: 17 },
];

export const performanceData: PerformanceItem[] = [
  { name: "Leader A", closedJobs: 42, responseRate: 93 },
  { name: "Leader B", closedJobs: 37, responseRate: 88 },
  { name: "Thợ 1", closedJobs: 54, responseRate: 90 },
  { name: "Thợ 2", closedJobs: 49, responseRate: 86 },
];
