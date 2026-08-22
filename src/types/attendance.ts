export type AttendanceStatus = "present" | "absent";

export interface AttendanceRecord {
  student_id: number;
  roll_number: string;
  display_name: string;
  department: string;
  year: string;
  section: string;
  status: AttendanceStatus;
  similarity: number | null;
}

export interface AttendanceSummary {
  total_students: number;
  present: number;
  absent: number;
  unknown: number;
}

export interface PendingReviewItem {
  id: string;
  student_id: number;
  display_name: string;
  similarity: number;
  image_url: string;
}

export interface AttendanceResponse {
  session_id: number;
  summary: AttendanceSummary;
  attendance: AttendanceRecord[];
  annotated_images: string[];
  pending_review?: PendingReviewItem[];
}

export interface ImageAsset {
  uri: string;
  name: string;
  type: string;
}

export interface ProcessAttendancePayload {
  images: ImageAsset[];
  timetableSlotId: number;
  date: string;
  threshold?: number;
}

export interface AttendanceUpdateEntry {
  student_id: number;
  status: AttendanceStatus;
}

export interface AttendanceUpdatePayload {
  session_id: number;
  attendance: AttendanceUpdateEntry[];
}

export interface AttendanceUpdateSuccessResponse {
  success: true;
  message: string;
}

export interface ApiErrorResponse {
  error: string;
}
