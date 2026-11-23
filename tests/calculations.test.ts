import { describe, expect, it } from 'vitest';
import {
  formatClockDuration,
  formatDuration,
  getLocalDateString,
  shiftDateString,
} from '../src/utils/date';
import { calculateScaledMacros, sumNutritionEntries } from '../src/utils/nutritionMath';
import {
  computeRecentPRs,
  computeSessionTotals,
  getExerciseProgressSeries,
  getWeeklyWorkoutFrequency,
} from '../src/utils/workoutStats';
import type { WorkoutSession } from '../src/db/types';

describe('Utilitários de data local', () => {
  it('formata data local sem sofrer deslocamento UTC', () => {
    const lateNight = new Date(2026, 10, 22, 23, 30, 0); // 22/11/2026 23:30 local
    expect(getLocalDateString(lateNight)).toBe('2026-11-22');
  });

  it('desloca datas corretamente mantendo YYYY-MM-DD', () => {
    expect(shiftDateString('2026-11-01', -1)).toBe('2026-10-31');
    expect(shiftDateString('2026-11-22', 2)).toBe('2026-11-24');
  });

  it('formata durações em MM:SS e HH:MM:SS', () => {
    expect(formatDuration(95)).toBe('01:35');
    expect(formatDuration(3665)).toBe('01:01:05');
    expect(formatClockDuration(95)).toBe('00:01:35');
  });
});

describe('Cálculos nutricionais', () => {
  const chicken = {
    servingGrams: 100,
    calories: 159,
    protein: 32,
    carbs: 0,
    fat: 2.5,
  };

  it('escala macros proporcionalmente em gramas e porções', () => {
    expect(calculateScaledMacros(chicken, 'grams', 150)).toEqual({
      calories: 239,
      protein: 48,
      carbs: 0,
      fat: 3.8,
    });

    expect(calculateScaledMacros(chicken, 'servings', 2)).toEqual({
      calories: 318,
      protein: 64,
      carbs: 0,
      fat: 5,
    });
  });

  it('soma múltiplas entradas diárias corretamente', () => {
    const totals = sumNutritionEntries([
      { calories: 300, protein: 30, carbs: 20.5, fat: 5.2 },
      { calories: 450, protein: 25.4, carbs: 50, fat: 12.1 },
    ]);
    expect(totals).toEqual({
      calories: 750,
      protein: 55.4,
      carbs: 70.5,
      fat: 17.3,
    });
  });
});

describe('Estatísticas de treino', () => {
  const sampleSessions: WorkoutSession[] = [
    {
      id: 's1',
      routineName: 'Treino A',
      status: 'completed',
      date: '2026-11-16',
      startedAt: '2026-11-16T10:00:00.000Z',
      durationSec: 2400,
      totalVolumeKg: 0,
      totalReps: 0,
      totalSets: 0,
      lumbarScore: 1,
      exercises: [
        {
          id: 'we1',
          exerciseId: 'ex-supino',
          exerciseName: 'Supino com Halteres',
          equipment: 'Halteres',
          sets: [
            { id: '1', weightKg: 20, reps: 10, intensity: 'M', rir: 2, completed: true },
            { id: '2', weightKg: 22, reps: 8, intensity: 'P', rir: 1, completed: true },
            { id: '3', weightKg: 30, reps: 10, intensity: 'P', rir: 0, completed: false },
          ],
        },
      ],
    },
    {
      id: 's2',
      routineName: 'Treino A',
      status: 'completed',
      date: '2026-11-20',
      startedAt: '2026-11-20T10:00:00.000Z',
      durationSec: 2500,
      totalVolumeKg: 0,
      totalReps: 0,
      totalSets: 0,
      lumbarScore: 0,
      exercises: [
        {
          id: 'we2',
          exerciseId: 'ex-supino',
          exerciseName: 'Supino com Halteres',
          equipment: 'Halteres',
          sets: [
            { id: '4', weightKg: 24, reps: 8, intensity: 'P', rir: 1, completed: true },
          ],
        },
      ],
    },
  ];

  it('calcula volume, reps e séries contando apenas séries concluídas', () => {
    const totals = computeSessionTotals(sampleSessions[0].exercises);
    expect(totals).toEqual({
      totalVolumeKg: 20 * 10 + 22 * 8,
      totalReps: 18,
      totalSets: 2,
    });
  });

  it('extrai PRs recentes e série temporal de progressão do exercício', () => {
    const prs = computeRecentPRs(sampleSessions, 5);
    expect(prs).toHaveLength(1);
    expect(prs[0]).toMatchObject({
      exerciseId: 'ex-supino',
      maxWeightKg: 24,
      date: '2026-11-20',
    });

    const series = getExerciseProgressSeries(sampleSessions, 'ex-supino');
    expect(series).toEqual([
      { date: '2026-11-16', maxWeightKg: 22, volumeKg: 376, bestReps: 8 },
      { date: '2026-11-20', maxWeightKg: 24, volumeKg: 192, bestReps: 8 },
    ]);
  });

  it('calcula frequência semanal alinhada à segunda-feira', () => {
    const freq = getWeeklyWorkoutFrequency(sampleSessions, 3, '2026-11-22');
    expect(freq.map((w) => w.count)).toEqual([0, 0, 2]);
  });
});
