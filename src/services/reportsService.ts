import { apiClient } from "./apiClient";
import type { ReportsResponse } from "../types/reports";

export async function getReports(facultyId: string, days: number = 30): Promise<ReportsResponse> {
  const response = await apiClient.get<ReportsResponse>("/api/reports/", {
    params: { faculty_id: facultyId, days },
  });
  return response.data;
}
