export interface InsightTrend {
  value: number;
  trend: number;
}
export interface InsightSecondsTrend {
  value_seconds: number;
  trend?: number;
}
export interface InsightPercentageTrend {
  value_percentage: number;
  trend: number;
}

export interface KeyInsights {
  time_saved: InsightSecondsTrend;
  processing_time: InsightSecondsTrend;
  overall_attendance: InsightPercentageTrend;
  total_sessions: InsightTrend;
  manual_time: InsightSecondsTrend;
}

export interface ChartDataPoint {
  date: string;
  manual_time: number;
  app_time: number;
}

export interface AtRiskStudent {
  student_id: number;
  roll_number: string;
  name: string;
  class_group: string;
  section: string;
  attendance: number;
}

export interface ReportsResponse {
  insights: KeyInsights;
  chart_data: ChartDataPoint[];
  at_risk_students: AtRiskStudent[];
}
