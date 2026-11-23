import { useState } from 'react';
import { BookmarkPlus, CheckCircle2, Dumbbell, Flame, Layers, Trash2 } from 'lucide-react';
import type { WorkoutSession } from '../../db/types';
import { computeSessionTotals } from '../../utils/workoutStats';
import { formatDuration } from '../../utils/date';
import { Modal } from '../../components/ui/Modal';

interface WorkoutOverviewModalProps {
  open: boolean;
  onClose: () => void;
  session: WorkoutSession;
  elapsedSec: number;
  onFinish: (lumbarScore: number | null, notes: string) => Promise<void>;
  onSaveAsRoutine: () => Promise<void>;
  onDiscard: () => Promise<void>;
}

export function WorkoutOverviewModal({
  open,
  onClose,
  session,
  elapsedSec,
  onFinish,
  onSaveAsRoutine,
  onDiscard,
}: WorkoutOverviewModalProps) {
  const [lumbarScore, setLumbarScore] = useState<number | null>(session.lumbarScore ?? 0);
  const [notes, setNotes] = useState(session.notes ?? '');
  const [saving, setSaving] = useState(false);
  const [routineSavedMsg, setRoutineSavedMsg] = useState(false);

  const totals = computeSessionTotals(session.exercises);

  async function handleConfirmFinish() {
    setSaving(true);
    try {
      await onFinish(lumbarScore, notes.trim());
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveRoutine() {
    await onSaveAsRoutine();
    setRoutineSavedMsg(true);
    setTimeout(() => setRoutineSavedMsg(false), 2500);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Resumo do Treino"
      subtitle={`${session.routineName} · Duração ${formatDuration(elapsedSec)}`}
      maxWidthClass="sm:max-w-xl"
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void handleSaveRoutine()}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#1E1E24] text-xs font-medium text-[#D1D5DB] hover:bg-[#2A2A33]"
            >
              <BookmarkPlus className="w-4 h-4 text-[#84CC16]" />
              {routineSavedMsg ? 'Salvo como rotina!' : 'Salvar Rotina'}
            </button>
            <button
              type="button"
              onClick={() => void onDiscard()}
              className="inline-flex items-center gap-1 px-3 py-2.5 rounded-xl bg-red-500/10 text-xs font-medium text-red-400 hover:bg-red-500/20"
            >
              <Trash2 className="w-4 h-4" />
              Descartar
            </button>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={() => void handleConfirmFinish()}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#84CC16] text-black text-sm font-bold hover:bg-lime-400 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            {saving ? 'Salvando...' : 'Concluir Treino'}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Totais estilo imagem 1 */}
        <div>
          <p className="text-[0.8125rem] font-semibold uppercase tracking-wider text-[#9CA3AF] mb-2">
            Seus Totais
          </p>
          <div className="grid grid-cols-3 gap-2.5">
            <div className="rounded-xl bg-[#1E1E24] border border-[#2A2A33] p-3 text-center">
              <Dumbbell className="w-4 h-4 text-[#9CA3AF] mx-auto mb-1" />
              <p className="text-[0.75rem] uppercase text-[#9CA3AF]">Volume</p>
              <p className="text-base font-bold tabular-nums text-[#F4F4F6]">
                {totals.totalVolumeKg} kg
              </p>
            </div>
            <div className="rounded-xl bg-[#1E1E24] border border-[#2A2A33] p-3 text-center">
              <Flame className="w-4 h-4 text-[#9CA3AF] mx-auto mb-1" />
              <p className="text-[0.75rem] uppercase text-[#9CA3AF]">Repetições</p>
              <p className="text-base font-bold tabular-nums text-[#F4F4F6]">
                {totals.totalReps}
              </p>
            </div>
            <div className="rounded-xl bg-[#1E1E24] border border-[#2A2A33] p-3 text-center">
              <Layers className="w-4 h-4 text-[#9CA3AF] mx-auto mb-1" />
              <p className="text-[0.75rem] uppercase text-[#9CA3AF]">Séries</p>
              <p className="text-base font-bold tabular-nums text-[#F4F4F6]">
                {totals.totalSets}
              </p>
            </div>
          </div>
        </div>

        {/* Check-in discreto de bem-estar / lombar */}
        <div className="rounded-xl bg-[#1E1E24] border border-[#2A2A33] p-3.5 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-[#F4F4F6]">
                Check-in pós-treino: Bem-estar / Lombar
              </p>
              <p className="text-[0.8125rem] text-[#9CA3AF]">
                0 = sem desconforto · 10 = desconforto alto (salvo só no seu dispositivo)
              </p>
            </div>
            <button
              type="button"
              onClick={() => setLumbarScore(lumbarScore === null ? 0 : null)}
              className="text-[0.8125rem] text-[#9CA3AF] underline"
            >
              {lumbarScore === null ? 'Marcar' : 'Omitir'}
            </button>
          </div>

          {lumbarScore !== null && (
            <div className="grid grid-cols-11 gap-1">
              {Array.from({ length: 11 }, (_, n) => {
                const selected = lumbarScore === n;
                const tone =
                  n <= 2
                    ? 'border-[#84CC16] bg-[#84CC16]/20 text-[#84CC16]'
                    : n <= 5
                      ? 'border-[#F97316] bg-[#F97316]/20 text-[#F97316]'
                      : 'border-red-500 bg-red-500/20 text-red-400';
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setLumbarScore(n)}
                    className={`py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      selected
                        ? tone
                        : 'bg-[#141418] border-[#2C2C35] text-[#9CA3AF] hover:text-white'
                    }`}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
          )}

          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Observações do treino, sensação articular ou técnica (opcional)..."
            className="w-full px-3 py-2 rounded-xl bg-[#141418] border border-[#2C2C35] text-xs text-[#F4F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#F97316]"
          />
        </div>

        {/* Lista de exercícios registrados */}
        <div className="space-y-2.5">
          <p className="text-[0.8125rem] font-semibold uppercase tracking-wider text-[#9CA3AF]">
            Exercícios Registrados
          </p>
          {session.exercises.map((ex) => {
            const doneSets = ex.sets.filter((s) => s.completed);
            return (
              <div
                key={ex.id}
                className="rounded-xl bg-[#1E1E24] border border-[#2A2A33] border-l-4 border-l-[#84CC16] p-3 space-y-2"
              >
                <div>
                  <p className="text-sm font-semibold text-[#F4F4F6]">{ex.exerciseName}</p>
                  <p className="text-[0.8125rem] text-[#9CA3AF]">{ex.equipment}</p>
                </div>
                {doneSets.length === 0 ? (
                  <p className="text-xs text-[#6B7280]">Nenhuma série marcada como concluída.</p>
                ) : (
                  <div className="space-y-1">
                    {doneSets.map((s, idx) => (
                      <div
                        key={s.id}
                        className="grid grid-cols-4 text-xs text-[#D1D5DB] py-1 border-t border-[#272730]"
                      >
                        <span className="text-[#9CA3AF]">#{idx + 1}</span>
                        <span className="tabular-nums font-medium">
                          {s.weightKg != null ? `${s.weightKg} kg` : 'Peso corp.'}
                        </span>
                        <span className="tabular-nums">{s.reps ?? 0} reps</span>
                        <span className="text-right">
                          {s.intensity ?? '-'}
                          {s.rir !== null ? ` (RIR ${s.rir})` : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
