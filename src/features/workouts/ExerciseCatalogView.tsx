import { useMemo, useState } from 'react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { db } from '../../db/database';
import { MUSCLE_GROUPS, type Exercise, type MuscleGroup } from '../../db/types';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

interface ExerciseCatalogViewProps {
  exercises: Exercise[];
}

export function ExerciseCatalogView({ exercises }: ExerciseCatalogViewProps) {
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState<MuscleGroup | 'Todos'>('Todos');
  const [editing, setEditing] = useState<Exercise | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Exercise | null>(null);

  const [name, setName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup>('Peito');
  const [equipment, setEquipment] = useState('');
  const [restSec, setRestSec] = useState(90);
  const [notes, setNotes] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return exercises
      .filter((e) => (group === 'Todos' ? true : e.muscleGroup === group))
      .filter((e) =>
        q ? e.name.toLowerCase().includes(q) || e.equipment.toLowerCase().includes(q) : true
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [exercises, query, group]);

  function openNew() {
    setEditing(null);
    setName('');
    setMuscleGroup('Peito');
    setEquipment('Halteres');
    setRestSec(90);
    setNotes('');
    setModalOpen(true);
  }

  function openEdit(ex: Exercise) {
    setEditing(ex);
    setName(ex.name);
    setMuscleGroup(ex.muscleGroup);
    setEquipment(ex.equipment);
    setRestSec(ex.defaultRestSec);
    setNotes(ex.notes ?? '');
    setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await db.exercises.put({
      id: editing?.id ?? `ex-${crypto.randomUUID()}`,
      name: name.trim(),
      muscleGroup,
      equipment: equipment.trim() || 'Outro',
      defaultRestSec: Math.max(15, Number(restSec) || 90),
      notes: notes.trim() || undefined,
      isCustom: editing?.isCustom ?? true,
      createdAt: editing?.createdAt ?? new Date().toISOString(),
    });
    setModalOpen(false);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await db.exercises.delete(deleteTarget.id);
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar exercício..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#16161A] border border-[#25252C] text-sm text-[#F4F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#F97316]"
          />
        </div>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#84CC16] text-black text-xs font-bold hover:bg-lime-400 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Novo
        </button>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {(['Todos', ...MUSCLE_GROUPS] as const).map((grp) => (
          <button
            key={grp}
            type="button"
            onClick={() => setGroup(grp)}
            className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium border ${
              group === grp
                ? 'bg-[#F97316] text-black border-[#F97316]'
                : 'bg-[#16161A] text-[#9CA3AF] border-[#25252C]'
            }`}
          >
            {grp}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((ex) => (
          <Card key={ex.id} className="p-3.5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-[#F4F4F6] truncate">{ex.name}</p>
                <Badge>{ex.muscleGroup}</Badge>
              </div>
              <p className="text-xs text-[#9CA3AF] mt-0.5">
                {ex.equipment} · Descanso padrão {ex.defaultRestSec}s
              </p>
              {ex.notes && (
                <p className="text-[11px] text-[#6B7280] mt-1">{ex.notes}</p>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => openEdit(ex)}
                aria-label="Editar exercício"
                className="p-2 rounded-xl text-[#9CA3AF] hover:text-white hover:bg-[#1E1E24]"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(ex)}
                aria-label="Excluir exercício"
                className="p-2 rounded-xl text-red-400/80 hover:text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar Exercício' : 'Novo Exercício'}
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl text-sm bg-[#1E1E24] text-[#D1D5DB]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="exercise-catalog-form"
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#84CC16] text-black"
            >
              Salvar
            </button>
          </div>
        }
      >
        <form id="exercise-catalog-form" onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block text-xs text-[#9CA3AF] mb-1">Nome</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#1E1E24] border border-[#2C2C35] text-sm text-[#F4F4F6]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#9CA3AF] mb-1">Grupo muscular</label>
              <select
                value={muscleGroup}
                onChange={(e) => setMuscleGroup(e.target.value as MuscleGroup)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#1E1E24] border border-[#2C2C35] text-sm text-[#F4F4F6]"
              >
                {MUSCLE_GROUPS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#9CA3AF] mb-1">Equipamento</label>
              <input
                type="text"
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#1E1E24] border border-[#2C2C35] text-sm text-[#F4F4F6]"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-[#9CA3AF] mb-1">Descanso padrão (s)</label>
            <input
              type="number"
              min={15}
              max={600}
              value={restSec}
              onChange={(e) => setRestSec(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl bg-[#1E1E24] border border-[#2C2C35] text-sm text-[#F4F4F6]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#9CA3AF] mb-1">Notas técnicas (opcional)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#1E1E24] border border-[#2C2C35] text-sm text-[#F4F4F6]"
            />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Excluir exercício?"
        description={`Remover "${deleteTarget?.name}" do catálogo? Treinos já salvos no histórico permanecem intactos.`}
        confirmLabel="Excluir"
      />
    </div>
  );
}
