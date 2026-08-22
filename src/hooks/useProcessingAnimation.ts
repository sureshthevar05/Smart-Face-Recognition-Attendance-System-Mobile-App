import { useEffect, useRef, useState } from "react";

export const PROCESSING_STAGES = [
  "Analyzing Images",
  "Detecting Faces",
  "Matching Students",
  "Generating Attendance",
] as const;

export type StageStatus = "completed" | "in_progress" | "pending";

const DURATION_MS = 20000;
const WAITING_CAP = 99;
const STAGE_BOUNDS = [25, 50, 75, 100];

export function useProcessingAnimation(active: boolean, isSuccess: boolean) {
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);
  const startRef = useRef<number | null>(null);
  const accelRef = useRef<{ startTime: number; from: number } | null>(null);

  useEffect(() => {
    if (!active) return;

    let cancelled = false;
    let rafId: number;

    function tick(now: number) {
      if (cancelled) return;
      if (startRef.current === null) startRef.current = now;

      if (isSuccess) {
        if (!accelRef.current) accelRef.current = { startTime: now, from: progressRef.current };
        const { startTime, from } = accelRef.current;
        const duration = Math.max(500, (100 - from) * 25);
        const t = Math.min(1, (now - startTime) / duration);
        const next = from + (100 - from) * t;
        progressRef.current = next;
        setProgress(next);
        if (t < 1) rafId = requestAnimationFrame(tick);
        return;
      }

      const elapsed = now - (startRef.current ?? now);
      const next = Math.min(WAITING_CAP, (elapsed / DURATION_MS) * 100);
      progressRef.current = next;
      setProgress(next);
      if (next < WAITING_CAP) rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
    };
  }, [active, isSuccess]);

  const stageStatuses: StageStatus[] = PROCESSING_STAGES.map((_, i) => {
    const lower = i === 0 ? 0 : STAGE_BOUNDS[i - 1];
    const upper = STAGE_BOUNDS[i];
    const isLastStage = i === PROCESSING_STAGES.length - 1;

    if (progress >= upper) {
      if (isLastStage) return isSuccess ? "completed" : "in_progress";
      return "completed";
    }
    if (progress >= lower) return "in_progress";
    return "pending";
  });

  return { progress, stageStatuses, hasReachedFinalStage: progress >= 100 };
}
