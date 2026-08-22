import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { processAttendance, updateAttendance } from "../services/attendanceService";
import { ApiError } from "../services/apiClient";
import type { AttendanceResponse, AttendanceRecord, ImageAsset } from "../types/attendance";

interface AttendanceFlowContextValue {
  images: ImageAsset[];
  addImages: (assets: ImageAsset[]) => void;
  removeImage: (index: number) => void;
  clearImages: () => void;
  selectedSlot: any | null; // using any for simplicity, can type if needed
  setSelectedSlot: (slot: any) => void;
  submitForProcessing: () => void;
  processStatus: "idle" | "pending" | "error" | "success";
  processError: string | null;
  result: AttendanceResponse | null;
  retryProcessing: () => void;
  isEditing: boolean;
  setIsEditing: (val: boolean) => void;
  pendingCorrections: Map<number, "present" | "absent">;
  toggleStatus: (studentId: number) => void;
  cancelChanges: () => void;
  effectiveAttendance: AttendanceRecord[];
  hasPendingChanges: boolean;
  saveAttendance: () => void;
  saveStatus: "idle" | "pending" | "error" | "success";
  saveError: string | null;
  resetFlow: () => void;
}

const AttendanceFlowContext = createContext<AttendanceFlowContextValue | null>(null);

export function AttendanceFlowProvider({ children }: { children: React.ReactNode }) {
  const [images, setImages] = useState<ImageAsset[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);
  
  const [processStatus, setProcessStatus] = useState<"idle" | "pending" | "error" | "success">("idle");
  const [processError, setProcessError] = useState<string | null>(null);
  const [result, setResult] = useState<AttendanceResponse | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [pendingCorrections, setPendingCorrections] = useState<Map<number, "present" | "absent">>(new Map());
  
  const [saveStatus, setSaveStatus] = useState<"idle" | "pending" | "error" | "success">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  const addImages = useCallback((assets: ImageAsset[]) => {
    setImages((current) => [...current, ...assets]);
  }, []);

  const removeImage = useCallback((index: number) => {
    setImages((current) => current.filter((_, i) => i !== index));
  }, []);

  const clearImages = useCallback(() => {
    setImages([]);
  }, []);

  const submitForProcessing = useCallback(async () => {
    if (!selectedSlot) return;
    
    setProcessStatus("pending");
    setProcessError(null);
    try {
      const res = await processAttendance({
        images,
        timetableSlotId: selectedSlot.timetableSlotId,
        date: selectedSlot.date,
      });
      setResult(res);
      setProcessStatus("success");
    } catch (err) {
      if (err instanceof ApiError) {
        setProcessError(err.message);
      } else {
        setProcessError("Failed to process attendance.");
      }
      setProcessStatus("error");
    }
  }, [images, selectedSlot]);

  const retryProcessing = submitForProcessing;

  const toggleStatus = useCallback((studentId: number) => {
    const record = result?.attendance.find((r) => r.student_id === studentId);
    if (!record) return;

    const currentlyPending = pendingCorrections.get(studentId);
    const currentEffectiveStatus = currentlyPending || record.status;
    const newStatus = currentEffectiveStatus === "present" ? "absent" : "present";

    setPendingCorrections((current) => {
      const next = new Map(current);
      if (record.status === newStatus) {
        next.delete(studentId);
      } else {
        next.set(studentId, newStatus);
      }
      return next;
    });
  }, [result, pendingCorrections]);

  const cancelChanges = useCallback(() => {
    setPendingCorrections(new Map());
    setIsEditing(false);
  }, []);

  const effectiveAttendance = useMemo(() => {
    if (!result) return [];
    return result.attendance.map((record) => {
      const override = pendingCorrections.get(record.student_id);
      if (!override) return record;
      return { ...record, status: override, similarity: null };
    });
  }, [result, pendingCorrections]);

  const saveAttendance = useCallback(async () => {
    if (pendingCorrections.size === 0 || !result) {
      setIsEditing(false);
      return;
    }
    
    setSaveStatus("pending");
    setSaveError(null);
    try {
      const payload = {
        session_id: result.session_id,
        attendance: Array.from(pendingCorrections.entries()).map(
          ([student_id, status]) => ({ student_id, status })
        ),
      };
      await updateAttendance(payload);
      setPendingCorrections(new Map());
      setIsEditing(false);
      setSaveStatus("success");
    } catch (err) {
      if (err instanceof ApiError) {
        setSaveError(err.message);
      } else {
        setSaveError("Failed to save changes.");
      }
      setSaveStatus("error");
    }
  }, [pendingCorrections, result]);

  const resetFlow = useCallback(() => {
    clearImages();
    setSelectedSlot(null);
    setProcessStatus("idle");
    setProcessError(null);
    setResult(null);
    setPendingCorrections(new Map());
    setIsEditing(false);
    setSaveStatus("idle");
    setSaveError(null);
  }, [clearImages]);

  const value: AttendanceFlowContextValue = {
    images, addImages, removeImage, clearImages,
    selectedSlot, setSelectedSlot,
    submitForProcessing, processStatus, processError, result, retryProcessing,
    isEditing, setIsEditing, pendingCorrections, toggleStatus, cancelChanges,
    effectiveAttendance, hasPendingChanges: pendingCorrections.size > 0,
    saveAttendance, saveStatus, saveError, resetFlow,
  };

  return (
    <AttendanceFlowContext.Provider value={value}>
      {children}
    </AttendanceFlowContext.Provider>
  );
}

export function useAttendanceFlow() {
  const ctx = useContext(AttendanceFlowContext);
  if (!ctx) throw new Error("useAttendanceFlow must be used within AttendanceFlowProvider");
  return ctx;
}
