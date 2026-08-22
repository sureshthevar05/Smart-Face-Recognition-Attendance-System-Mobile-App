export type TimetableSlotStatus = "Completed" | "Pending" | "Locked";

export interface TimetableSlot {
  period: number;
  time: string;
  is_free: boolean;
  status: TimetableSlotStatus;
  timetable_slot_id?: number;
  course_code?: string;
  course_name?: string;
  target_department?: string;
  target_year?: string;
  target_section?: string;
}

export interface TimetableResponse {
  date: string;
  day_of_week: string;
  timetable: TimetableSlot[];
}
