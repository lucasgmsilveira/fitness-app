import type { WorkoutExerciseLog, WorkoutSession } from '../db/types';
import { getLocalDateString, parseLocalDate, shiftDateString } from './date';

export interface SessionTotals {
  totalVolumeKg: number;
  totalReps: number;
  totalSets: number;
}

export interface RecentPR {
  exerciseId: string;
  exerciseName: string;
  maxWeightKg: number;
  reps: number;
  date: string;
}

export interface ExerciseProgressPoint {
  date: string;
  maxWeightKg: number;
  volumeKg: number;
  bestReps: number;
}

export interface WeeklyFrequencyPoint {
  label: string;
  weekStart: string;
  count: number;
}

export function computeSessionTotals(exercises: WorkoutExerciseLog[]): SessionTotals {
  let totalVolumeKg = 0;
  let totalReps = 0;
  let totalSets = 0;

  for (const ex of exercises) {
    for (const set of ex.sets) {
      if (!set.completed) continue;
      totalSets += 1;
      const reps = set.reps && set.reps > 0 ? set.reps : 0;
      const weight = set.weightKg && set.weightKg > 0 ? set.weightKg : 0;
      totalReps += reps;
      totalVolumeKg += weight * reps;
    }
  }

  return {
    totalVolumeKg: Math.round(totalVolumeKg * 10) / 10,
    totalReps,
    totalSets,
  };
}

export function computeRecentPRs(sessions: WorkoutSession[], limit = 4): RecentPR[] {
  const completed = sessions
    .filter((s) => s.status === 'completed')
    .sort((a, b) => a.date.localeCompare(b.date) || a.startedAt.localeCompare(b.startedAt));

  const bestByExercise = new Map<string, RecentPR>();

  for (const session of completed) {
    for (const ex of session.exercises) {
      for (const set of ex.sets) {
        if (!set.completed || !set.weightKg || set.weightKg <= 0) continue;
        const reps = set.reps ?? 0;
        const current = bestByExercise.get(ex.exerciseId);
        if (
          !current ||
          set.weightKg > current.maxWeightKg ||
          (set.weightKg === current.maxWeightKg && reps > current.reps)
        ) {
          bestByExercise.set(ex.exerciseId, {
            exerciseId: ex.exerciseId,
            exerciseName: ex.exerciseName,
            maxWeightKg: set.weightKg,
            reps,
            date: session.date,
          });
        }
      }
    }
  }

  return Array.from(bestByExercise.values())
    .sort((a, b) => b.date.localeCompare(a.date) || b.maxWeightKg - a.maxWeightKg)
    .slice(0, limit);
}

export function getExerciseProgressSeries(
  sessions: WorkoutSession[],
  exerciseId: string
): ExerciseProgressPoint[] {
  const completed = sessions
    .filter((s) => s.status === 'completed')
    .sort((a, b) => a.date.localeCompare(b.date) || a.startedAt.localeCompare(b.startedAt));

  const byDate = new Map<string, ExerciseProgressPoint>();

  for (const session of completed) {
    for (const ex of session.exercises) {
      if (ex.exerciseId !== exerciseId) continue;

      let sessionMax = 0;
      let sessionVol = 0;
      let sessionBestReps = 0;
      let hasCompleted = false;

      for (const set of ex.sets) {
        if (!set.completed) continue;
        hasCompleted = true;
        const w = set.weightKg && set.weightKg > 0 ? set.weightKg : 0;
        const r = set.reps && set.reps > 0 ? set.reps : 0;
        sessionVol += w * r;
        if (w > sessionMax) {
          sessionMax = w;
          sessionBestReps = r;
        } else if (w === sessionMax && r > sessionBestReps) {
          sessionBestReps = r;
        }
      }

      if (!hasCompleted) continue;

      const prev = byDate.get(session.date);
      if (!prev) {
        byDate.set(session.date, {
          date: session.date,
          maxWeightKg: sessionMax,
          volumeKg: Math.round(sessionVol * 10) / 10,
          bestReps: sessionBestReps,
        });
      } else {
        byDate.set(session.date, {
          date: session.date,
          maxWeightKg: Math.max(prev.maxWeightKg, sessionMax),
          volumeKg: Math.round((prev.volumeKg + sessionVol) * 10) / 10,
          bestReps: sessionMax >= prev.maxWeightKg ? sessionBestReps : prev.bestReps,
        });
      }
    }
  }

  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export function getPreviousExercisePerformance(
  sessions: WorkoutSession[],
  exerciseId: string
): { date: string; summary: string } | null {
  const completed = sessions
    .filter((s) => s.status === 'completed')
    .sort((a, b) => b.date.localeCompare(a.date) || b.startedAt.localeCompare(a.startedAt));

  for (const session of completed) {
    const match = session.exercises.find((e) => e.exerciseId === exerciseId);
    if (!match) continue;
    const doneSets = match.sets.filter((s) => s.completed);
    if (doneSets.length === 0) continue;

    const parts = doneSets.slice(0, 4).map((s) => {
      const w = s.weightKg != null ? `${s.weightKg}kg` : 'PC';
      const r = s.reps != null ? `${s.reps}` : '-';
      return `${w}×${r}`;
    });
    const extra = doneSets.length > 4 ? ` (+${doneSets.length - 4})` : '';
    return {
      date: session.date,
      summary: parts.join(' · ') + extra,
    };
  }

  return null;
}

export function getWeeklyWorkoutFrequency(
  sessions: WorkoutSession[],
  weeks = 6,
  referenceDateStr: string = getLocalDateString()
): WeeklyFrequencyPoint[] {
  const refDate = parseLocalDate(referenceDateStr);
  const dayOfWeek = refDate.getDay(); // 0=Dom .. 6=Sáb
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const currentMondayStr = shiftDateString(referenceDateStr, diffToMonday);

  const completedDates = sessions.filter((s) => s.status === 'completed').map((s) => s.date);
  const result: WeeklyFrequencyPoint[] = [];

  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = shiftDateString(currentMondayStr, -i * 7);
    const weekEnd = shiftDateString(weekStart, 6);
    const count = completedDates.filter((d) => d >= weekStart && d <= weekEnd).length;
    const [, m, d] = weekStart.split('-');
    result.push({
      label: `${d}/${m}`,
      weekStart,
      count,
    });
  }

  return result;
}
