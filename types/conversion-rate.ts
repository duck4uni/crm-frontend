export interface ConversionMetricItem {
  label: string;
  value: number;
  percentage?: number;
  indent?: number;
}

export interface ConversionStage {
  id: string;
  order: number;
  title: string;
  total: number;
  items: ConversionMetricItem[];
  isRevenue?: boolean;
}

export interface ConversionRateData {
  stages: ConversionStage[];
}
