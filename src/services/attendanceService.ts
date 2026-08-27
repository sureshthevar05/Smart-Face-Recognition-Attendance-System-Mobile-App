import { apiClient, API_BASE_URL } from "./apiClient";
import type {
  AttendanceResponse,
  AttendanceUpdatePayload,
  AttendanceUpdateSuccessResponse,
  ProcessAttendancePayload,
} from "../types/attendance";

export async function processAttendance(
  payload: ProcessAttendancePayload
): Promise<AttendanceResponse> {
  const formData = new FormData();
  payload.images.forEach((asset) => {
    formData.append("images", asset as any);
    if (asset.captureTime) {
      formData.append("capture_times", asset.captureTime);
    } else {
      formData.append("capture_times", "MISSING");
    }
  });
  formData.append("timetable_slot_id", String(payload.timetableSlotId));
  formData.append("date", payload.date);
  if (payload.threshold !== undefined) {
    formData.append("threshold", String(payload.threshold));
  }

  const response = await apiClient.post<AttendanceResponse>(
    "/api/attendance/",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
}

export async function updateAttendance(
  payload: AttendanceUpdatePayload
): Promise<AttendanceUpdateSuccessResponse> {
  const response = await apiClient.post<AttendanceUpdateSuccessResponse>(
    "/api/attendance/update/",
    payload,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
}

export function resolveMediaUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}
