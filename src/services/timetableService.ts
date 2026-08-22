import { apiClient } from "./apiClient";
import type { TimetableResponse } from "../types/timetable";

export async function getTimetable(params: {
  facultyId: string;
  date?: string;
  semester?: string;
}): Promise<TimetableResponse> {
  const response = await apiClient.get<TimetableResponse>("/api/timetable/", {
    params: {
      faculty_id: params.facultyId,
      ...(params.date ? { date: params.date } : {}),
      ...(params.semester ? { semester: params.semester } : {}),
    },
  });
  return response.data;
}
