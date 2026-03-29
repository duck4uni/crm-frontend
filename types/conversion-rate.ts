export interface ConversionMetricItem {
  label: string;
  value: number;
  percentage?: number;
  indent?: number; // 0, 1, 2 for different levels
}

export interface ConversionStage {
  id: string;
  order: number;
  title: string;
  total: number;
  items: ConversionMetricItem[];
  isRevenue?: boolean; // Special styling for revenue stage
}

export interface ConversionRateData {
  stages: ConversionStage[];
}
