import { useMemo, useState } from 'react';
import {
  Activity,
  ArrowUpRight,
  Award,
  Drumstick,
  Droplet,
  Flame,
  Scale,
  Wheat,
} from 'lucide-react';
import type {
  DailyCheckin,
  Exercise,
  MealEntry,
  NutritionGoal,
  WorkoutSession,
} from '../../db/types';
import { getLocalDateString } from '../../utils/date';
import { sumNutritionEntries } from '../../utils/nutritionMath';
import {
  computeRecentPRs,
  getExerciseProgressSeries,
  getWeeklyWorkoutFrequency,
} from '../../utils/workoutStats';
import { AppShell } from '../../components/layout/AppShell';
import { Card } from '../../components/ui/Card';
import { CalorieRing } from '../../components/charts/CalorieRing';
import { TrendLineChart, type TrendPoint } from '../../components/charts/TrendLineChart';
import { MiniBarChart } from '../../components/charts/MiniBarChart';

type ChartView = 'exercise' | 'weight' | 'frequency' | 'lumbar';

interface DashboardPageProps {
  mealEntries: MealEntry[];
  goal: NutritionGoal;
  sessions: WorkoutSession[];
  exercises: Exercise[];
  checkins: DailyCheckin[];
  activeSession: WorkoutSession | undefined;
  onGoNutrition: () => void;
  onGoWorkouts: () => void;
  onOpenActiveWorkout: () => void;
  onOpenQuickCheckin: () => void;
}

export function DashboardPage({
  mealEntries,
  goal,
  sessions,
  exercises,
  checkins,
  activeSession,
  onGoNutrition,
  onGoWorkouts,
  onOpenActiveWorkout,
  onOpenQuickCheckin,
}: DashboardPageProps) {
  const todayStr = getLocalDateString();
  const [chartView, setChartView] = useState<ChartView>('exercise');

  const todayMeals = useMemo(
    () => mealEntries.filter((e) => e.date === todayStr),
    [mealEntries, todayStr]
  );
  const todayMacros = useMemo(() => sumNutritionEntries(todayMeals), [todayMeals]);

  const completedSessions = useMemo(
    () => sessions.filter((s) => s.status === 'completed'),
    [sessions]
  );

  const recentPRs = useMemo(
    () => computeRecentPRs(completedSessions, 4),
    [completedSessions]
  );

  const recordedExercises = useMemo(() => {
    const ids = new Set<string>();
    for (const s of completedSessions) {
      for (const ex of s.exercises) {
        if (ex.sets.some((set) => set.completed && (set.weightKg ?? 0) > 0)) {
          ids.add(ex.exerciseId);
        }
      }
    }
    return exercises.filter((e) => ids.has(e.id));
  }, [completedSessions, exercises]);

  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
  const effectiveExerciseId =
    selectedExerciseId && recordedExercises.some((e) => e.id === selectedExerciseId)
      ? selectedExerciseId
      : recordedExercises[0]?.id ?? '';

  const exercisePoints: TrendPoint[] = useMemo(() => {
    if (!effectiveExerciseId) return [];
    return getExerciseProgressSeries(completedSessions, effectiveExerciseId).map((p) => ({
      date: p.date,
      value: p.maxWeightKg,
      extra: `${p.bestReps} reps`,
    }));
  }, [completedSessions, effectiveExerciseId]);

  const weightPoints: TrendPoint[] = useMemo(
    () =>
      checkins
        .filter((c) => c.weightKg != null && c.weightKg > 0)
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((c) => ({ date: c.date, value: c.weightKg as number })),
    [checkins]
  );

  const lumbarPoints: TrendPoint[] = useMemo(
    () =>
      checkins
        .filter((c) => c.lumbarScore !== null && c.lumbarScore !== undefined)
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((c) => ({ date: c.date, value: c.lumbarScore as number })),
    [checkins]
  );

  const weeklyFreq = useMemo(
    () => getWeeklyWorkoutFrequency(completedSessions, 6, todayStr),
    [completedSessions, todayStr]
  );

  const todayCheckin = useMemo(
    () => checkins.find((c) => c.date === todayStr),
    [checkins, todayStr]
  );

  const macroCards = [
    {
      label: 'Proteína',
      value: todayMacros.protein,
      target: goal.protein,
      color: 'bg-[#EF4444]',
      icon: <Drumstick className="w-3.5 h-3.5 text-[#EF4444]" />,
    },
    {
      label: 'Gordura',
      value: todayMacros.fat,
      target: goal.fat,
      color: 'bg-[#EAB308]',
      icon: <Droplet className="w-3.5 h-3.5 text-[#EAB308]" />,
    },
    {
      label: 'Carbos',
      value: todayMacros.carbs,
      target: goal.carbs,
      color: 'bg-[#38BDF8]',
      icon: <Wheat className="w-3.5 h-3.5 text-[#38BDF8]" />,
    },
  ];

  return (
    <AppShell title="Painel" subtitle="Resumo diário e evolução">
      {activeSession && (
        <button
          type="button"
          onClick={onOpenActiveWorkout}
          className="w-full text-left p-3.5 rounded-2xl bg-[#84CC16]/15 border border-[#84CC16]/40 flex items-center justify-between gap-3"
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#84CC16]">
              Treino Ativo
            </p>
            <p className="text-sm font-semibold text-[#F4F4F6]">
              {activeSession.routineName}
            </p>
          </div>
          <span className="px-3 py-1.5 rounded-xl bg-[#84CC16] text-black text-xs font-bold shrink-0">
            Retomar
          </span>
        </button>
      )}

      {/* Card Calorias Hoje (estilo imagem 2) */}
      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#F97316]" />
            <h2 className="text-sm font-semibold text-[#F4F4F6]">Calorias Hoje</h2>
          </div>
          <button
            type="button"
            onClick={onGoNutrition}
            aria-label="Abrir Nutrição"
            className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-white hover:bg-[#1E1E24]"
          >
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <CalorieRing consumed={todayMacros.calories} target={goal.calories} />
      </Card>

      {/* Grid 3 colunas de Macros (estilo imagem 2) */}
      <div className="grid grid-cols-3 gap-2.5">
        {macroCards.map((m) => {
          const pct = Math.min(
            100,
            Math.max(0, m.target > 0 ? (m.value / m.target) * 100 : 0)
          );
          return (
            <Card key={m.label} className="p-3 space-y-2">
              <div className="flex items-center gap-1.5">
                {m.icon}
                <span className="text-xs font-medium text-[#D1D5DB] truncate">
                  {m.label}
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-1 tabular-nums">
                <span className="text-sm font-bold text-[#F4F4F6]">{m.value}g</span>
                <span className="text-[11px] text-[#9CA3AF]">{m.target}g</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[#25252C] overflow-hidden">
                <div
                  className={`h-full rounded-full ${m.color} transition-all duration-300`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recordes Recentes (PRs) */}
      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-yellow-400" />
            <h2 className="text-sm font-semibold text-[#F4F4F6]">Recordes Recentes (PRs)</h2>
          </div>
          <button
            type="button"
            onClick={onGoWorkouts}
            className="text-xs text-[#9CA3AF] hover:text-white"
          >
            Ver treinos
          </button>
        </div>

        {recentPRs.length === 0 ? (
          <p className="text-xs text-[#9CA3AF] py-2">
            Conclua seu primeiro treino com cargas registradas para acompanhar seus recordes pessoais aqui.
          </p>
        ) : (
          <div className="divide-y divide-[#22222A]">
            {recentPRs.map((pr) => (
              <div
                key={pr.exerciseId}
                className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#F4F4F6] truncate">
                    {pr.exerciseName}
                  </p>
                  <p className="text-[11px] text-[#9CA3AF]">{pr.date}</p>
                </div>
                <span className="text-base font-bold text-[#F4F4F6] tabular-nums shrink-0">
                  {pr.maxWeightKg} kg
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Card Evolução (gráficos estilo imagem 2) */}
      <Card className="space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h2 className="text-sm font-semibold text-[#F4F4F6]">Evolução</h2>
          <div className="flex gap-1 bg-[#1E1E24] p-0.5 rounded-xl border border-[#2A2A33]">
            {(
              [
                ['exercise', 'Carga'],
                ['weight', 'Peso'],
                ['frequency', 'Freq.'],
                ['lumbar', 'Lombar'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setChartView(key)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                  chartView === key
                    ? 'bg-[#2C2C36] text-[#F4F4F6]'
                    : 'text-[#9CA3AF] hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {chartView === 'exercise' && (
          <div className="space-y-2">
            {recordedExercises.length > 0 && (
              <select
                value={effectiveExerciseId}
                onChange={(e) => setSelectedExerciseId(e.target.value)}
                aria-label="Selecionar exercício"
                className="w-full px-3 py-2 rounded-xl bg-[#1E1E24] border border-[#2C2C35] text-xs font-medium text-[#F4F4F6]"
              >
                {recordedExercises.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name}
                  </option>
                ))}
              </select>
            )}
            <TrendLineChart
              points={exercisePoints}
              unit="kg"
              color="#EF4444"
              emptyText="Registre cargas em exercícios nos treinos para visualizar a curva de progressão."
            />
          </div>
        )}

        {chartView === 'weight' && (
          <TrendLineChart
            points={weightPoints}
            unit="kg"
            color="#38BDF8"
            emptyText="Registre seu peso corporal em Ajustes ou pelo botão + para acompanhar a tendência."
          />
        )}

        {chartView === 'frequency' && <MiniBarChart data={weeklyFreq} />}

        {chartView === 'lumbar' && (
          <TrendLineChart
            points={lumbarPoints}
            unit="/10"
            color="#F43F5E"
            minFloor={0}
            maxCeil={10}
            emptyText="Faça check-ins diários ou pós-treino para monitorar a resposta lombar (0 a 10)."
          />
        )}
      </Card>

      {/* Check-in rápido de hoje */}
      <Card className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#1E1E24] border border-[#2A2A33] flex items-center justify-center shrink-0">
            <Scale className="w-4 h-4 text-sky-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#F4F4F6]">Check-in de Hoje</p>
            <p className="text-[11px] text-[#9CA3AF] truncate tabular-nums">
              Peso: {todayCheckin?.weightKg != null ? `${todayCheckin.weightKg} kg` : '—'} ·{' '}
              Lombar:{' '}
              {todayCheckin?.lumbarScore !== null && todayCheckin?.lumbarScore !== undefined
                ? `${todayCheckin.lumbarScore}/10`
                : '—'}{' '}
              · Água: {todayCheckin?.waterMl ?? 0} ml
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenQuickCheckin}
          className="shrink-0 inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-[#1E1E24] hover:bg-[#272730] border border-[#2C2C35] text-xs font-medium text-[#F4F4F6]"
        >
          <Activity className="w-3.5 h-3.5 text-[#F43F5E]" />
          Registrar
        </button>
      </Card>
    </AppShell>
  );
}
