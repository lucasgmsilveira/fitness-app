import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { db } from '../../db/database';
import type { Exercise, Routine, RoutineExercise } from '../../db/types';
import { Modal } from '../../components/ui/Modal';
import { ExercisePickerModal } from './ExercisePickerModal';

interface RoutineEditorModalProps {
  open: boolean;
  onClose: () => void;
  routine: Routine | null;
  exercises: Exercise[];
  nextOrder: number;
}

export function RoutineEditorModal({
  open,
  onClose,
  routine,
  exercises,
  nextOrder,
}: RoutineEditorModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [items, setItems] = useState<RoutineExercise[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (routine) {
      setName(routine.name);
      setDescription(routine.description || '');
      setItems(routine.exercises.map((item) => ({ ...item })));
    } else {
      setName('');
      setDescription('');
      setItems([]);
    }
  }, [open, routine]);

  const exerciseMap = new Map(exercises.map((e) => [e.id, e]));

  function addExercise(ex: Exercise) {
    setItems((prev) => [
      ...prev,
      {
        exerciseId: ex.id,
        targetSets: 3,
        targetReps: '8-12',
        restSec: ex.defaultRestSec || 90,
      },
    ]);
  }

  function updateItem(index: number, patch: Partial<RoutineExercise>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function moveItem(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    setItems((prev) => {
      const copy = [...prev];
      const [moved] = copy.splice(index, 1);
      copy.splice(target, 0, moved);
      return copy;
    });
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) return;

    const payload: Routine = {
      id: routine?.id ?? `rt-${crypto.randomUUID()}`,
      name: cleanName,
      description: description.trim() || undefined,
      order: routine?.order ?? nextOrder,
      exercises: items,
      updatedAt: new Date().toISOString(),
    };
    await db.routines.put(payload);
    onClose();
  }

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={routine ? 'Editar Rotina' : 'Nova Rotina de Treino'}
        maxWidthClass="sm:max-w-xl"
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm bg-[#1E1E24] text-[#D1D5DB]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="routine-editor-form"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#84CC16] text-black hover:bg-lime-400"
            >
              Salvar Rotina
            </button>
          </div>
        }
      >
        <form id="routine-editor-form" onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs text-[#9CA3AF] mb-1">Nome da rotina</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Treino A — Superiores"
              className="w-full px-3 py-2.5 rounded-xl bg-[#1E1E24] border border-[#2C2C35] text-sm text-[#F4F4F6] focus:outline-none focus:border-[#F97316]"
            />
          </div>

          <div>
            <label className="block text-xs text-[#9CA3AF] mb-1">Descrição / Foco (opcional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Priorizar controle excêntrico e postura"
              className="w-full px-3 py-2.5 rounded-xl bg-[#1E1E24] border border-[#2C2C35] text-sm text-[#F4F4F6]"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
                Exercícios ({items.length})
              </span>
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#84CC16]/15 text-[#84CC16] border border-[#84CC16]/30 text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar Exercício
              </button>
            </div>

            {items.length === 0 ? (
              <div className="p-5 rounded-xl border border-dashed border-[#2C2C35] text-center text-xs text-[#9CA3AF]">
                Nenhum exercício adicionado ainda. Clique em "+ Adicionar Exercício".
              </div>
            ) : (
              <div className="space-y-2.5">
                {items.map((item, idx) => {
                  const ex = exerciseMap.get(item.exerciseId);
                  return (
                    <div
                      key={`${item.exerciseId}-${idx}`}
                      className="p-3 rounded-xl bg-[#1E1E24] border border-[#2A2A33] space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#F4F4F6] truncate">
                            {idx + 1}. {ex?.name ?? 'Exercício removido'}
                          </p>
                          <p className="text-[0.8125rem] text-[#9CA3AF]">
                            {ex ? `${ex.muscleGroup} · ${ex.equipment}` : item.exerciseId}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => moveItem(idx, -1)}
                            disabled={idx === 0}
                            className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-white disabled:opacity-30"
                            aria-label="Mover para cima"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveItem(idx, 1)}
                            disabled={idx === items.length - 1}
                            className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-white disabled:opacity-30"
                            aria-label="Mover para baixo"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeItem(idx)}
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10"
                            aria-label="Remover exercício"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[0.75rem] text-[#9CA3AF] mb-0.5">Séries</label>
                          <input
                            type="number"
                            min={1}
                            max={15}
                            value={item.targetSets}
                            onChange={(e) =>
                              updateItem(idx, { targetSets: Math.max(1, Number(e.target.value) || 1) })
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg bg-[#141418] border border-[#2C2C35] text-xs text-[#F4F4F6]"
                          />
                        </div>
                        <div>
                          <label className="block text-[0.75rem] text-[#9CA3AF] mb-0.5">Reps alvo</label>
                          <input
                            type="text"
                            value={item.targetReps}
                            onChange={(e) => updateItem(idx, { targetReps: e.target.value })}
                            placeholder="8-12"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-[#141418] border border-[#2C2C35] text-xs text-[#F4F4F6]"
                          />
                        </div>
                        <div>
                          <label className="block text-[0.75rem] text-[#9CA3AF] mb-0.5">Descanso (s)</label>
                          <input
                            type="number"
                            min={15}
                            max={600}
                            value={item.restSec}
                            onChange={(e) =>
                              updateItem(idx, { restSec: Math.max(15, Number(e.target.value) || 60) })
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg bg-[#141418] border border-[#2C2C35] text-xs text-[#F4F4F6]"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </form>
      </Modal>

      <ExercisePickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        exercises={exercises}
        onSelect={addExercise}
      />
    </>
  );
}
