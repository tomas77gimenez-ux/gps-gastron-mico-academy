import { useEffect, useRef, useState, useCallback, type RefObject } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";

export interface ProgressRow {
  lesson_id: string;
  progress_seconds: number;
  duration_seconds: number | null;
  completed: boolean;
}

/**
 * Loads progress for all lessons in a course for the current user.
 */
export function useCourseProgress(courseId: string | undefined) {
  const { user, isReady } = useAuthSession();
  const [progress, setProgress] = useState<Record<string, ProgressRow>>({});
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!user || !courseId) {
      setProgress({});
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("lesson_progress")
      .select("lesson_id, progress_seconds, duration_seconds, completed")
      .eq("user_id", user.id)
      .eq("course_id", courseId);
    const map: Record<string, ProgressRow> = {};
    (data ?? []).forEach((r: any) => { map[r.lesson_id] = r; });
    setProgress(map);
    setLoading(false);
  }, [user, courseId]);

  useEffect(() => {
    if (!isReady) return;
    reload();
  }, [isReady, reload]);

  return { progress, loading, reload };
}

/**
 * Manual completion toggle — used for Bunny Stream lessons and
 * material-only lessons where there is no playback event to track.
 */
export function useLessonCompletion(courseId: string | undefined, onUpdate?: () => void) {
  const { user } = useAuthSession();
  const [saving, setSaving] = useState(false);

  const setCompleted = useCallback(
    async (lessonId: string, completed: boolean) => {
      if (!user || !courseId) return;
      setSaving(true);
      await supabase.from("lesson_progress").upsert(
        {
          user_id: user.id,
          lesson_id: lessonId,
          course_id: courseId,
          completed,
          last_watched_at: new Date().toISOString(),
        },
        { onConflict: "user_id,lesson_id" },
      );
      setSaving(false);
      onUpdate?.();
    },
    [user, courseId, onUpdate],
  );

  return { setCompleted, saving, canTrack: !!user && !!courseId };
}

/**
 * Listens to Panda Video player postMessage events and persists progress.
 * Saves at most every 10 seconds while playing, and immediately on pause/end.
 */
export function usePandaProgressTracker(opts: {
  lessonId: string | null;
  courseId: string | null;
  enabled: boolean;
  mode?: "iframe" | "html5";
  videoRef?: RefObject<HTMLVideoElement | null>;
  onUpdate?: () => void;
}) {
  const { user } = useAuthSession();
  const lastSaved = useRef<number>(0);
  const stateRef = useRef<{ current: number; duration: number }>({ current: 0, duration: 0 });
  const [completed, setCompleted] = useState(false);

  const save = useCallback(async (force = false) => {
    if (!user || !opts.lessonId || !opts.courseId || !opts.enabled) return;
    const { current, duration } = stateRef.current;
    if (current <= 0) return;
    const now = Date.now();
    if (!force && now - lastSaved.current < 10000) return;
    lastSaved.current = now;
    const isCompleted = duration > 0 && current / duration >= 0.9;
    if (isCompleted) setCompleted(true);
    await supabase.from("lesson_progress").upsert({
      user_id: user.id,
      lesson_id: opts.lessonId,
      course_id: opts.courseId,
      progress_seconds: Math.floor(current),
      duration_seconds: duration > 0 ? Math.floor(duration) : null,
      completed: isCompleted,
      last_watched_at: new Date().toISOString(),
    }, { onConflict: "user_id,lesson_id" });
    opts.onUpdate?.();
  }, [user, opts.lessonId, opts.courseId, opts.enabled, opts.onUpdate]);

  useEffect(() => {
    if (!opts.enabled || !opts.lessonId || opts.mode === "html5") return;
    setCompleted(false);
    stateRef.current = { current: 0, duration: 0 };
    lastSaved.current = 0;

    function handleMessage(e: MessageEvent) {
      if (typeof e.data !== "object" || !e.data) return;
      // Panda Video sends messages like { message: "panda_timeupdate", currentTime, duration } or similar
      const data: any = e.data;
      const msg = data.message ?? data.event ?? "";
      if (typeof msg !== "string" || !msg.includes("panda")) return;

      if (typeof data.currentTime === "number") stateRef.current.current = data.currentTime;
      if (typeof data.duration === "number" && data.duration > 0) stateRef.current.duration = data.duration;

      if (msg.includes("timeupdate") || msg.includes("progress")) {
        save(false);
      } else if (msg.includes("pause") || msg.includes("ended") || msg.includes("end")) {
        save(true);
      }
    }

    window.addEventListener("message", handleMessage);
    const interval = setInterval(() => save(false), 15000);
    return () => {
      window.removeEventListener("message", handleMessage);
      clearInterval(interval);
      save(true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.lessonId, opts.enabled, opts.mode]);

  useEffect(() => {
    if (!opts.enabled || !opts.lessonId || opts.mode !== "html5") return;

    const video = opts.videoRef?.current;
    if (!video) return;

    setCompleted(false);
    stateRef.current = {
      current: video.currentTime || 0,
      duration: Number.isFinite(video.duration) ? video.duration : 0,
    };
    lastSaved.current = 0;

    const syncState = () => {
      stateRef.current.current = video.currentTime || 0;
      stateRef.current.duration = Number.isFinite(video.duration) ? video.duration : 0;
    };

    const handleTimeUpdate = () => {
      syncState();
      save(false);
    };

    const handlePauseOrEnd = () => {
      syncState();
      save(true);
    };

    video.addEventListener("loadedmetadata", syncState);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("pause", handlePauseOrEnd);
    video.addEventListener("ended", handlePauseOrEnd);

    const interval = setInterval(() => {
      syncState();
      save(false);
    }, 15000);

    return () => {
      video.removeEventListener("loadedmetadata", syncState);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("pause", handlePauseOrEnd);
      video.removeEventListener("ended", handlePauseOrEnd);
      clearInterval(interval);
      syncState();
      save(true);
    };
  }, [opts.lessonId, opts.enabled, opts.mode, opts.videoRef, save]);

  return { completed };
}