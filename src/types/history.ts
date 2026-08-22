import type { AttendanceRecord } from "./attendance";

export interface AttendanceHistoryRecord {
  session_id: number;
  course_code: string;
  course_name: string;
  class_group: string;
  date: string;
  time: string;
  status: string;
  total_students: number;
  present: number;
  absent: number;
  unknown: number;
  annotated_images: string[];
  attendance?: AttendanceRecord[];
}
