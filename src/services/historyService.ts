import { apiClient } from "./apiClient";
import type { AttendanceHistoryRecord } from "../types/history";

export async function getAttendanceHistory(
  facultyId: string
): Promise<AttendanceHistoryRecord[]> {
  const response = await apiClient.get<AttendanceHistoryRecord[]>(
    "/api/attendance/history/",
    { params: { faculty_id: facultyId } }
  );
  return response.data;
}
