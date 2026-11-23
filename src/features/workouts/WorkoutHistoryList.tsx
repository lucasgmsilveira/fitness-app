import { useState } from 'react';
import { Calendar, ChevronDown, ChevronUp, Clock, Dumbbell, Trash2 } from 'lucide-react';
import { db } from '../../db/database';
import type { WorkoutSession } from '../../db/types';
import { formatDateBr, formatDuration } from '../../utils/date';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

interface WorkoutHistoryListProps {
  sessions: WorkoutSession[];
}

export function WorkoutHistoryList({ sessions }: WorkoutHistoryListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WorkoutSession | null>(null);

  const sorted = [...sessions]
    .filter((s) => s.status === 'completed')
    .sort((a, b) => b.date.localeCompare(a.date) || b.startedAt.localeCompare(a.startedAt));

  async function updateLumbarScore(sessionId: string, score: number | null) {
    await db.workoutSessions.update(sessionId, { lumbarScore: score });
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await db.workoutSessions.delete(deleteTarget.id);
    setDeleteTarget(null);
  }

  if (sorted.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<Calendar className="w-6 h-6" />}
          title="Nenhum treino concluído ainda"
          description="Inicie uma rotina na aba Rotinas ou crie um treino livre para registrar suas cargas e séries."
        />
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {sorted.map((session) => {
        const isOpen = expandedId === session.id;
        return (
          <Card key={session.id} className="p-0 overflow-hidden">
            <button
              type="button"
              onClick={() => setExpandedId(isOpen ? null : session.id)}
              className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-[#1A1A20] transition-colors"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-[#F4F4F6] truncate">
                    {session.routineName}
                  </p>
                  {session.lumbarScore !== null && (
                    <Badge
                      tone={
                        session.lumbarScore <= 2
                          ? 'lime'
                          : session.lumbarScore <= 5
                            ? 'orange'
                            : 'red'
                      }
                    >
                      Lombar {session.lumbarScore}/10
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-[#9CA3AF]">
                  <span>{formatDateBr(session.date)}</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDuration(session.durationSec)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Dumbbell className="w-3.5 h-3.5" />
                    {session.totalVolumeKg} kg · {session.totalSets} séries
                  </span>
                </div>
              </div>
              {isOpen ? (
                <ChevronUp className="w-5 h-5 text-[#9CA3AF] shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[#9CA3AF] shrink-0" />
              )}
            </button>

            {isOpen && (
              <div className="px-4 pb-4 pt-2 border-t border-[#25252C] space-y-3">
                {session.notes && (
                  <p className="text-xs text-[#D1D5DB] bg-[#1E1E24] rounded-xl p-2.5">
                    {session.notes}
                  </p>
                )}

                <div className="space-y-2">
                  {session.exercises.map((ex) => {
                    const done = ex.sets.filter((s) => s.completed);
                    return (
                      <div
                        key={ex.id}
                        className="rounded-xl bg-[#1E1E24] border border-[#272730] p-3"
                      >
                        <p className="text-xs font-semibold text-[#F4F4F6]">{ex.exerciseName}</p>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {done.length === 0 ? (
                            <span className="text-[0.8125rem] text-[#6B7280]">Sem séries concluídas</span>
                          ) : (
                            done.map((s, idx) => (
                              <span
                                key={s.id}
                                className="px-2 py-1 rounded-lg bg-[#141418] border border-[#2C2C35] text-[0.8125rem] text-[#D1D5DB] tabular-nums"
                              >
                                #{idx + 1}: {s.weightKg ?? 0}kg × {s.reps ?? 0}
                                {s.intensity ? ` (${s.intensity})` : ''}
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Atualização tardia da resposta lombar (24-48h) */}
                <div className="rounded-xl bg-[#1E1E24] p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[0.8125rem] text-[#9CA3AF]">
                      Ajustar check-in lombar desta sessão:
                    </span>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(session)}
                      className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Excluir treino
                    </button>
                  </div>
                  <div className="grid grid-cols-11 gap-1">
                    {Array.from({ length: 11 }, (_, n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() =>
                          void updateLumbarScore(
                            session.id,
                            session.lumbarScore === n ? null : n
                          )
                        }
                        className={`py-1 rounded text-[0.8125rem] font-semibold border ${
                          session.lumbarScore === n
                            ? 'border-[#84CC16] bg-[#84CC16]/20 text-[#84CC16]'
                            : 'border-[#2C2C35] bg-[#141418] text-[#9CA3AF]'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Card>
        );
      })}

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Excluir treino do histórico?"
        description={`O registro "${deleteTarget?.routineName}" de ${
          deleteTarget ? formatDateBr(deleteTarget.date) : ''
        } será removido permanentemente.`}
        confirmLabel="Excluir"
      />
    </div>
  );
}
