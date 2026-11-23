import { useMemo, useState } from 'react';
import { Copy, Dumbbell, Pencil, Play, Plus, Trash2 } from 'lucide-react';
import { db } from '../../db/database';
import type { Exercise, Routine, WorkoutExerciseLog, WorkoutSession } from '../../db/types';
import { getLocalDateString } from '../../utils/date';
import { getPreviousExercisePerformance } from '../../utils/workoutStats';
import { AppShell } from '../../components/layout/AppShell';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { RoutineEditorModal } from './RoutineEditorModal';
import { WorkoutHistoryList } from './WorkoutHistoryList';
import { ExerciseCatalogView } from './ExerciseCatalogView';

type WorkoutSubTab = 'routines' | 'history' | 'exercises';

interface WorkoutsPageProps {
  routines: Routine[];
  exercises: Exercise[];
  sessions: WorkoutSession[];
  activeSession: WorkoutSession | undefined;
  onOpenActiveSession: () => void;
}

export function WorkoutsPage({
  routines,
  exercises,
  sessions,
  activeSession,
  onOpenActiveSession,
}: WorkoutsPageProps) {
  const [subTab, setSubTab] = useState<WorkoutSubTab>('routines');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
  const [deleteRoutineTarget, setDeleteRoutineTarget] = useState<Routine | null>(null);

  const exerciseMap = useMemo(
    () => new Map(exercises.map((e) => [e.id, e])),
    [exercises]
  );

  const sortedRoutines = useMemo(
    () => [...routines].sort((a, b) => a.order - b.order),
    [routines]
  );

  const completedSessions = useMemo(
    () => sessions.filter((s) => s.status === 'completed'),
    [sessions]
  );

  async function startSessionFromRoutine(routine?: Routine) {
    if (activeSession) {
      onOpenActiveSession();
      return;
    }

    const exerciseLogs: WorkoutExerciseLog[] = routine
      ? routine.exercises.map((item) => {
          const meta = exerciseMap.get(item.exerciseId);
          return {
            id: `wex-${crypto.randomUUID()}`,
            exerciseId: item.exerciseId,
            exerciseName: meta?.name ?? 'Exercício',
            equipment: meta?.equipment ?? 'Livre',
            supersetGroup: item.supersetGroup,
            notes: item.notes,
            sets: Array.from({ length: Math.max(1, item.targetSets) }, () => ({
              id: `set-${crypto.randomUUID()}`,
              weightKg: null,
              reps: null,
              intensity: null,
              rir: null,
              completed: false,
            })),
          };
        })
      : [];

    const newSession: WorkoutSession = {
      id: `ws-${crypto.randomUUID()}`,
      routineId: routine?.id,
      routineName: routine?.name ?? 'Treino Livre',
      status: 'active',
      date: getLocalDateString(),
      startedAt: new Date().toISOString(),
      durationSec: 0,
      exercises: exerciseLogs,
      totalVolumeKg: 0,
      totalReps: 0,
      totalSets: 0,
      lumbarScore: null,
    };

    await db.workoutSessions.put(newSession);
    onOpenActiveSession();
  }

  async function duplicateRoutine(routine: Routine) {
    await db.routines.put({
      ...routine,
      id: `rt-${crypto.randomUUID()}`,
      name: `${routine.name} (Cópia)`,
      order: routines.length,
      updatedAt: new Date().toISOString(),
    });
  }

  async function handleDeleteRoutine() {
    if (!deleteRoutineTarget) return;
    await db.routines.delete(deleteRoutineTarget.id);
    setDeleteRoutineTarget(null);
  }

  return (
    <AppShell
      title="Treinos"
      subtitle="Rotinas editáveis, execução e histórico"
      headerRight={
        <button
          type="button"
          onClick={() => void startSessionFromRoutine()}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#84CC16] text-black text-xs font-bold hover:bg-lime-400"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          {activeSession ? 'Retomar' : 'Treino Livre'}
        </button>
      }
    >
      {activeSession && (
        <button
          type="button"
          onClick={onOpenActiveSession}
          className="w-full text-left p-3.5 rounded-2xl bg-[#84CC16]/15 border border-[#84CC16]/40 flex items-center justify-between gap-3"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#84CC16]">
              Treino em Andamento
            </p>
            <p className="text-sm font-semibold text-[#F4F4F6] mt-0.5">
              {activeSession.routineName}
            </p>
          </div>
          <span className="px-3 py-1.5 rounded-xl bg-[#84CC16] text-black text-xs font-bold shrink-0">
            Abrir
          </span>
        </button>
      )}

      {/* Sub-navegação */}
      <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-[#16161A] border border-[#25252C]">
        {(
          [
            ['routines', `Rotinas (${routines.length})`],
            ['history', `Histórico (${completedSessions.length})`],
            ['exercises', 'Exercícios'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setSubTab(id)}
            className={`py-2 rounded-xl text-xs font-semibold transition-colors ${
              subTab === id
                ? 'bg-[#25252C] text-[#F4F4F6]'
                : 'text-[#9CA3AF] hover:text-[#F4F4F6]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {subTab === 'routines' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#9CA3AF]">
              Monte suas fichas A/B/C e edite a qualquer momento
            </p>
            <button
              type="button"
              onClick={() => {
                setEditingRoutine(null);
                setEditorOpen(true);
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#1E1E24] border border-[#2C2C35] text-xs font-semibold text-[#84CC16] hover:bg-[#272730]"
            >
              <Plus className="w-4 h-4" />
              Nova Rotina
            </button>
          </div>

          {sortedRoutines.length === 0 ? (
            <Card>
              <EmptyState
                icon={<Dumbbell className="w-6 h-6" />}
                title="Nenhuma rotina cadastrada"
                description="Crie sua primeira rotina (Treino A, Treino B...) para iniciar seus treinos em um toque."
                action={
                  <button
                    type="button"
                    onClick={() => {
                      setEditingRoutine(null);
                      setEditorOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#84CC16] text-black text-xs font-bold"
                  >
                    Criar Rotina
                  </button>
                }
              />
            </Card>
          ) : (
            sortedRoutines.map((routine) => (
              <Card key={routine.id} className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="text-base font-bold text-[#F4F4F6] truncate">
                      {routine.name}
                    </h2>
                    {routine.description && (
                      <p className="text-xs text-[#9CA3AF] mt-0.5">{routine.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingRoutine(routine);
                        setEditorOpen(true);
                      }}
                      aria-label="Editar rotina"
                      className="p-2 rounded-xl text-[#9CA3AF] hover:text-white hover:bg-[#1E1E24]"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void duplicateRoutine(routine)}
                      aria-label="Duplicar rotina"
                      className="p-2 rounded-xl text-[#9CA3AF] hover:text-white hover:bg-[#1E1E24]"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteRoutineTarget(routine)}
                      aria-label="Excluir rotina"
                      className="p-2 rounded-xl text-red-400/80 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {routine.exercises.map((item, idx) => {
                    const ex = exerciseMap.get(item.exerciseId);
                    const prev = getPreviousExercisePerformance(
                      completedSessions,
                      item.exerciseId
                    );
                    return (
                      <div
                        key={`${item.exerciseId}-${idx}`}
                        className="flex items-center justify-between gap-2 text-xs py-1 border-t border-[#22222A]"
                      >
                        <span className="text-[#D1D5DB] truncate">
                          {ex?.name ?? 'Exercício'}
                        </span>
                        <span className="text-[#9CA3AF] shrink-0 tabular-nums">
                          {item.targetSets}×{item.targetReps}
                          {prev ? ` · Últ: ${prev.summary.split(' · ')[0]}` : ''}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => void startSessionFromRoutine(routine)}
                  className="w-full py-2.5 rounded-xl bg-[#84CC16] hover:bg-lime-400 text-black text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Play className="w-4 h-4 fill-current" />
                  {activeSession ? 'Retomar Treino Ativo' : 'Iniciar esta Rotina'}
                </button>
              </Card>
            ))
          )}
        </div>
      )}

      {subTab === 'history' && <WorkoutHistoryList sessions={sessions} />}

      {subTab === 'exercises' && <ExerciseCatalogView exercises={exercises} />}

      <RoutineEditorModal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        routine={editingRoutine}
        exercises={exercises}
        nextOrder={routines.length}
      />

      <ConfirmDialog
        open={deleteRoutineTarget !== null}
        onClose={() => setDeleteRoutineTarget(null)}
        onConfirm={handleDeleteRoutine}
        title="Excluir rotina?"
        description={`A rotina "${deleteRoutineTarget?.name}" será removida. Seu histórico de treinos já realizados não será afetado.`}
        confirmLabel="Excluir"
      />
    </AppShell>
  );
}
