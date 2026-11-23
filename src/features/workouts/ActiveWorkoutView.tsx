import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Layers,
  Minimize2,
  Plus,
  Timer,
  Trash2,
} from 'lucide-react';
import { db } from '../../db/database';
import type {
  Exercise,
  IntensityLevel,
  Routine,
  WorkoutExerciseLog,
  WorkoutSession,
  WorkoutSet,
} from '../../db/types';
import { formatClockDuration, formatDateBr } from '../../utils/date';
import { computeSessionTotals, getPreviousExercisePerformance } from '../../utils/workoutStats';
import { RestTimerBar } from './RestTimerBar';
import { ExercisePickerModal } from './ExercisePickerModal';
import { WorkoutOverviewModal } from './WorkoutOverviewModal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

interface ActiveWorkoutViewProps {
  session: WorkoutSession;
  exercises: Exercise[];
  completedSessions: WorkoutSession[];
  onMinimize: () => void;
  onFinished: () => void;
}

const INTENSITY_STYLES: Record<
  IntensityLevel,
  { label: string; classes: string }
> = {
  L: {
    label: 'L',
    classes: 'border-sky-400/70 bg-sky-500/15 text-sky-300',
  },
  M: {
    label: 'M',
    classes: 'border-[#84CC16]/70 bg-[#84CC16]/15 text-[#84CC16]',
  },
  P: {
    label: 'P',
    classes: 'border-[#F97316]/80 bg-[#F97316]/20 text-[#F97316]',
  },
};

function nextIntensity(current: IntensityLevel | null): IntensityLevel | null {
  if (current === null) return 'L';
  if (current === 'L') return 'M';
  if (current === 'M') return 'P';
  return null;
}

export function ActiveWorkoutView({
  session,
  exercises,
  completedSessions,
  onMinimize,
  onFinished,
}: ActiveWorkoutViewProps) {
  const [elapsedSec, setElapsedSec] = useState(() =>
    Math.max(0, Math.floor((Date.now() - Date.parse(session.startedAt)) / 1000))
  );
  const [expandedId, setExpandedId] = useState<string | null>(
    session.exercises[0]?.id ?? null
  );
  const [pickerMode, setPickerMode] = useState<'normal' | 'superset' | null>(null);
  const [overviewOpen, setOverviewOpen] = useState(false);
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false);

  // Rest timer state
  const [restOpen, setRestOpen] = useState(false);
  const [restTotalSec, setRestTotalSec] = useState(90);
  const [restRemainingSec, setRestRemainingSec] = useState(90);
  const [restRunning, setRestRunning] = useState(false);

  const exerciseMap = useMemo(
    () => new Map(exercises.map((e) => [e.id, e])),
    [exercises]
  );

  // Cronômetro principal baseado no timestamp real de início
  useEffect(() => {
    const update = () => {
      const diff = Math.max(0, Math.floor((Date.now() - Date.parse(session.startedAt)) / 1000));
      setElapsedSec(diff);
    };
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [session.startedAt]);

  // Cronômetro de descanso
  useEffect(() => {
    if (!restRunning) return;
    const timer = window.setInterval(() => {
      setRestRemainingSec((prev) => {
        if (prev <= 1) {
          setRestRunning(false);
          if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate?.([180, 90, 180]);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [restRunning]);

  function startRestTimer(seconds: number) {
    const clean = Math.max(15, seconds);
    setRestTotalSec(clean);
    setRestRemainingSec(clean);
    setRestRunning(true);
    setRestOpen(true);
  }

  async function saveExercises(nextExercises: WorkoutExerciseLog[]) {
    const totals = computeSessionTotals(nextExercises);
    await db.workoutSessions.update(session.id, {
      exercises: nextExercises,
      totalVolumeKg: totals.totalVolumeKg,
      totalReps: totals.totalReps,
      totalSets: totals.totalSets,
    });
  }

  function updateSet(
    exLogId: string,
    setId: string,
    patch: Partial<WorkoutSet>,
    autoStartRestSec?: number
  ) {
    const next = session.exercises.map((ex) => {
      if (ex.id !== exLogId) return ex;
      return {
        ...ex,
        sets: ex.sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)),
      };
    });
    void saveExercises(next);
    if (autoStartRestSec) {
      startRestTimer(autoStartRestSec);
    }
  }

  function addSet(exLogId: string) {
    const next = session.exercises.map((ex) => {
      if (ex.id !== exLogId) return ex;
      const last = ex.sets[ex.sets.length - 1];
      const newSet: WorkoutSet = {
        id: `set-${crypto.randomUUID()}`,
        weightKg: last?.weightKg ?? null,
        reps: last?.reps ?? null,
        intensity: last?.intensity ?? null,
        rir: last?.rir ?? null,
        completed: false,
      };
      return { ...ex, sets: [...ex.sets, newSet] };
    });
    void saveExercises(next);
  }

  function removeSet(exLogId: string, setId: string) {
    const next = session.exercises.map((ex) => {
      if (ex.id !== exLogId) return ex;
      if (ex.sets.length <= 1) return ex;
      return { ...ex, sets: ex.sets.filter((s) => s.id !== setId) };
    });
    void saveExercises(next);
  }

  function updateExerciseNotes(exLogId: string, notes: string) {
    const next = session.exercises.map((ex) =>
      ex.id === exLogId ? { ...ex, notes } : ex
    );
    void saveExercises(next);
  }

  function removeExercise(exLogId: string) {
    const next = session.exercises.filter((ex) => ex.id !== exLogId);
    void saveExercises(next);
    if (expandedId === exLogId) {
      setExpandedId(next[0]?.id ?? null);
    }
  }

  function handleAddPickedExercise(ex: Exercise) {
    const supersetCode =
      pickerMode === 'superset'
        ? `SS-${session.exercises.filter((e) => e.supersetGroup).length + 1}`
        : undefined;

    const newLog: WorkoutExerciseLog = {
      id: `wex-${crypto.randomUUID()}`,
      exerciseId: ex.id,
      exerciseName: ex.name,
      equipment: ex.equipment,
      supersetGroup: supersetCode,
      sets: [
        {
          id: `set-${crypto.randomUUID()}`,
          weightKg: null,
          reps: null,
          intensity: null,
          rir: null,
          completed: false,
        },
      ],
    };

    const next = [...session.exercises, newLog];
    void saveExercises(next);
    setExpandedId(newLog.id);
    setPickerMode(null);
  }

  async function handleFinish(lumbarScore: number | null, notes: string) {
    const totals = computeSessionTotals(session.exercises);
    await db.workoutSessions.update(session.id, {
      status: 'completed',
      finishedAt: new Date().toISOString(),
      durationSec: elapsedSec,
      totalVolumeKg: totals.totalVolumeKg,
      totalReps: totals.totalReps,
      totalSets: totals.totalSets,
      lumbarScore,
      notes: notes || undefined,
    });

    if (lumbarScore !== null) {
      const existing = await db.dailyCheckins.get(session.date);
      await db.dailyCheckins.put({
        ...existing,
        date: session.date,
        lumbarScore,
        updatedAt: new Date().toISOString(),
      });
    }

    setOverviewOpen(false);
    onFinished();
  }

  async function handleSaveAsRoutine() {
    const count = await db.routines.count();
    const routine: Routine = {
      id: `rt-${crypto.randomUUID()}`,
      name: `${session.routineName} (Cópia)`,
      description: 'Salva a partir de um treino realizado',
      order: count,
      updatedAt: new Date().toISOString(),
      exercises: session.exercises.map((ex) => {
        const meta = exerciseMap.get(ex.exerciseId);
        return {
          exerciseId: ex.exerciseId,
          targetSets: Math.max(1, ex.sets.length),
          targetReps: '8-12',
          restSec: meta?.defaultRestSec ?? 90,
          supersetGroup: ex.supersetGroup,
          notes: ex.notes,
        };
      }),
    };
    await db.routines.put(routine);
  }

  async function handleDiscard() {
    await db.workoutSessions.delete(session.id);
    setDiscardConfirmOpen(false);
    setOverviewOpen(false);
    onFinished();
  }

  return (
    <div className="min-h-dvh bg-[#0B0B0D] text-[#F4F4F6] flex flex-col">
      {/* Barra superior estilo imagem 1 */}
      <header className="sticky top-0 z-30 bg-[#0B0B0D]/95 backdrop-blur-md border-b border-[#1E1E24] safe-top">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onMinimize}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#16161A] border border-[#25252C] text-xs font-medium text-[#D1D5DB] hover:text-white"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            Minimizar
          </button>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#16161A] border border-[#25252C]">
            <Clock className="w-3.5 h-3.5 text-[#F97316]" />
            <span className="text-sm font-bold tabular-nums tracking-wide">
              {formatClockDuration(elapsedSec)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setOverviewOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#84CC16] text-black text-xs font-bold hover:bg-lime-400"
          >
            Finalizar
          </button>
        </div>
        <div className="max-w-3xl mx-auto px-4 pb-2">
          <p className="text-xs text-[#9CA3AF] truncate">{session.routineName}</p>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-4 space-y-3 pb-32">
        {restOpen && (
          <RestTimerBar
            remainingSec={restRemainingSec}
            totalSec={restTotalSec}
            running={restRunning}
            onToggleRun={() => setRestRunning((r) => !r)}
            onAdjust={(delta) =>
              setRestRemainingSec((prev) => Math.max(0, prev + delta))
            }
            onResetPreset={(sec) => startRestTimer(sec)}
            onDismiss={() => {
              setRestRunning(false);
              setRestOpen(false);
            }}
          />
        )}

        {session.exercises.map((exLog) => {
          const isExpanded = expandedId === exLog.id;
          const totalSets = exLog.sets.length;
          const doneCount = exLog.sets.filter((s) => s.completed).length;
          const allDone = totalSets > 0 && doneCount === totalSets;
          const inProgress = doneCount > 0 && !allDone;
          const borderAccent = allDone
            ? 'border-l-[#84CC16]'
            : inProgress || isExpanded
              ? 'border-l-[#F97316]'
              : 'border-l-[#3F3F46]';

          const meta = exerciseMap.get(exLog.exerciseId);
          const restSec = meta?.defaultRestSec ?? 90;
          const previous = getPreviousExercisePerformance(
            completedSessions,
            exLog.exerciseId
          );

          return (
            <div
              key={exLog.id}
              className={`rounded-2xl bg-[#16161A] border border-[#25252C] border-l-4 ${borderAccent} overflow-hidden`}
            >
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : exLog.id)}
                className="w-full px-4 py-3.5 flex items-center justify-between gap-3 text-left"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-[#F4F4F6] truncate">
                      {exLog.exerciseName}
                    </p>
                    {exLog.supersetGroup && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-300 border border-sky-500/30">
                        {exLog.supersetGroup}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-[#9CA3AF]">{exLog.equipment}</span>
                    <span className="text-[#3F3F46]">|</span>
                    <div className="flex items-center gap-1">
                      {exLog.sets.map((s) => (
                        <span
                          key={s.id}
                          className={`w-2.5 h-2.5 rounded-full border ${
                            s.completed
                              ? 'border-[#84CC16] bg-[#84CC16]/30'
                              : s.weightKg || s.reps
                                ? 'border-[#F97316]'
                                : 'border-[#4B5563]'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-[#9CA3AF] shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[#9CA3AF] shrink-0" />
                )}
              </button>

              {isExpanded && (
                <div className="px-3.5 pb-4 pt-1 border-t border-[#22222A] space-y-3">
                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="text-[#9CA3AF] truncate">
                      {previous
                        ? `Anterior (${formatDateBr(previous.date)}): ${previous.summary}`
                        : 'Sem histórico anterior para este exercício'}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeExercise(exLog.id)}
                      className="text-red-400/80 hover:text-red-400 shrink-0 inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remover
                    </button>
                  </div>

                  {/* Cabeçalho da tabela de séries */}
                  <div className="grid grid-cols-[2rem_1fr_1fr_4.5rem_2.4rem] gap-1.5 text-[11px] font-medium text-[#9CA3AF] px-1 text-center">
                    <span>Série</span>
                    <span>Carga (kg)</span>
                    <span>Reps</span>
                    <span>Esforço</span>
                    <span>✓</span>
                  </div>

                  <div className="space-y-1.5">
                    {exLog.sets.map((set, idx) => {
                      const intensityMeta = set.intensity
                        ? INTENSITY_STYLES[set.intensity]
                        : null;
                      return (
                        <div key={set.id} className="space-y-1">
                          <div className="grid grid-cols-[2rem_1fr_1fr_4.5rem_2.4rem] gap-1.5 items-center">
                            <button
                              type="button"
                              onClick={() => removeSet(exLog.id, set.id)}
                              title={
                                exLog.sets.length > 1
                                  ? 'Toque para remover série'
                                  : 'Série 1'
                              }
                              className="text-xs font-semibold text-[#9CA3AF] hover:text-red-400 text-center py-2"
                            >
                              {idx + 1}
                            </button>

                            <input
                              type="number"
                              inputMode="decimal"
                              step="0.5"
                              min={0}
                              placeholder="0"
                              value={set.weightKg ?? ''}
                              onChange={(e) =>
                                updateSet(exLog.id, set.id, {
                                  weightKg:
                                    e.target.value === ''
                                      ? null
                                      : Math.max(0, Number(e.target.value)),
                                })
                              }
                              className="w-full text-center py-2 px-1 rounded-xl bg-[#1E1E24] border border-[#2C2C35] text-sm font-medium text-[#F4F4F6] tabular-nums focus:outline-none focus:border-[#F97316]"
                            />

                            <input
                              type="number"
                              inputMode="numeric"
                              min={0}
                              placeholder="0"
                              value={set.reps ?? ''}
                              onChange={(e) =>
                                updateSet(exLog.id, set.id, {
                                  reps:
                                    e.target.value === ''
                                      ? null
                                      : Math.max(0, Math.round(Number(e.target.value))),
                                })
                              }
                              className="w-full text-center py-2 px-1 rounded-xl bg-[#1E1E24] border border-[#2C2C35] text-sm font-medium text-[#F4F4F6] tabular-nums focus:outline-none focus:border-[#F97316]"
                            />

                            <button
                              type="button"
                              onClick={() =>
                                updateSet(exLog.id, set.id, {
                                  intensity: nextIntensity(set.intensity),
                                })
                              }
                              title="Alternar intensidade: L (Leve) / M (Moderada) / P (Pesada)"
                              className={`py-2 px-1.5 rounded-xl border text-xs font-bold transition-colors ${
                                intensityMeta
                                  ? intensityMeta.classes
                                  : 'border-dashed border-[#3B3B46] text-[#6B7280] bg-[#141418]'
                              }`}
                            >
                              {intensityMeta ? intensityMeta.label : '—'}
                              {set.rir !== null ? ` · ${set.rir}` : ''}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const nextDone = !set.completed;
                                updateSet(
                                  exLog.id,
                                  set.id,
                                  { completed: nextDone },
                                  nextDone ? restSec : undefined
                                );
                              }}
                              aria-label="Concluir série"
                              className={`w-9 h-9 mx-auto rounded-full border-2 flex items-center justify-center transition-colors ${
                                set.completed
                                  ? 'border-[#84CC16] bg-[#84CC16]/20 text-[#84CC16]'
                                  : 'border-[#3F3F46] text-[#6B7280] hover:border-[#84CC16]/60'
                              }`}
                            >
                              <Check className="w-4 h-4 stroke-[2.5]" />
                            </button>
                          </div>

                          {/* Seletor rápido de RIR quando intensidade estiver marcada */}
                          {set.intensity !== null && (
                            <div className="flex items-center justify-end gap-1 pr-1">
                              <span className="text-[10px] text-[#9CA3AF] mr-1">RIR:</span>
                              {[0, 1, 2, 3, 4].map((rirVal) => (
                                <button
                                  key={rirVal}
                                  type="button"
                                  onClick={() =>
                                    updateSet(exLog.id, set.id, {
                                      rir: set.rir === rirVal ? null : rirVal,
                                    })
                                  }
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                                    set.rir === rirVal
                                      ? 'bg-[#F97316]/20 border-[#F97316]/60 text-[#F97316]'
                                      : 'bg-[#141418] border-[#25252C] text-[#9CA3AF]'
                                  }`}
                                >
                                  {rirVal}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => addSet(exLog.id)}
                    className="w-full py-2 rounded-xl bg-[#1E1E24] hover:bg-[#272730] border border-[#2C2C35] text-xs font-semibold text-[#84CC16] flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    Próxima Série
                  </button>

                  <input
                    type="text"
                    value={exLog.notes ?? ''}
                    onChange={(e) => updateExerciseNotes(exLog.id, e.target.value)}
                    placeholder="Adicionar nota técnica ou ajuste de banco..."
                    className="w-full px-3 py-2 rounded-xl bg-[#1E1E24] border border-[#25252C] text-xs text-[#F4F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#F97316]"
                  />
                </div>
              )}
            </div>
          );
        })}

        {/* Botões + Superset / + Exercício como na imagem 1 */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => setPickerMode('superset')}
            className="py-3 rounded-2xl bg-[#16161A] border border-[#25252C] hover:border-[#84CC16]/50 text-xs font-semibold text-[#84CC16] flex items-center justify-center gap-1.5"
          >
            <Layers className="w-4 h-4" />
            + Superset
          </button>
          <button
            type="button"
            onClick={() => setPickerMode('normal')}
            className="py-3 rounded-2xl bg-[#16161A] border border-[#25252C] hover:border-[#84CC16]/50 text-xs font-semibold text-[#84CC16] flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            + Exercício
          </button>
        </div>
      </main>

      {/* Barra inferior fixa do treino ativo */}
      <footer className="fixed bottom-0 inset-x-0 z-30 bg-[#121216]/95 backdrop-blur-md border-t border-[#25252C] safe-bottom">
        <div className="max-w-3xl mx-auto grid grid-cols-3 h-16 px-4 items-center">
          <button
            type="button"
            onClick={() => {
              if (!restOpen) {
                startRestTimer(restTotalSec);
              } else {
                setRestOpen(false);
              }
            }}
            className="flex flex-col items-center justify-center gap-1 text-[11px] font-medium text-[#D1D5DB] hover:text-[#F97316]"
          >
            <Timer className="w-5 h-5" />
            <span>Descanso</span>
          </button>

          <button
            type="button"
            onClick={onMinimize}
            className="flex flex-col items-center justify-center gap-1 text-[11px] font-medium text-[#D1D5DB] hover:text-white"
          >
            <Minimize2 className="w-5 h-5" />
            <span>Minimizar</span>
          </button>

          <button
            type="button"
            onClick={() => setOverviewOpen(true)}
            className="flex flex-col items-center justify-center gap-1 text-[11px] font-semibold text-[#84CC16]"
          >
            <Check className="w-5 h-5" />
            <span>Finalizar</span>
          </button>
        </div>
      </footer>

      <ExercisePickerModal
        open={pickerMode !== null}
        onClose={() => setPickerMode(null)}
        exercises={exercises}
        onSelect={handleAddPickedExercise}
        title={
          pickerMode === 'superset'
            ? 'Adicionar Exercício em Superset'
            : 'Adicionar Exercício ao Treino'
        }
      />

      <WorkoutOverviewModal
        open={overviewOpen}
        onClose={() => setOverviewOpen(false)}
        session={session}
        elapsedSec={elapsedSec}
        onFinish={handleFinish}
        onSaveAsRoutine={handleSaveAsRoutine}
        onDiscard={async () => setDiscardConfirmOpen(true)}
      />

      <ConfirmDialog
        open={discardConfirmOpen}
        onClose={() => setDiscardConfirmOpen(false)}
        onConfirm={handleDiscard}
        title="Descartar treino atual?"
        description="Todas as séries registradas nesta sessão em andamento serão removidas permanentemente."
        confirmLabel="Descartar"
      />
    </div>
  );
}
