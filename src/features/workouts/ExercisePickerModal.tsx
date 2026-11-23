import { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { db } from '../../db/database';
import { MUSCLE_GROUPS, type Exercise, type MuscleGroup } from '../../db/types';
import { Modal } from '../../components/ui/Modal';

interface ExercisePickerModalProps {
  open: boolean;
  onClose: () => void;
  exercises: Exercise[];
  onSelect: (exercise: Exercise) => void;
  title?: string;
}

export function ExercisePickerModal({
  open,
  onClose,
  exercises,
  onSelect,
  title = 'Selecionar Exercício',
}: ExercisePickerModalProps) {
  const [query, setQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState<MuscleGroup | 'Todos'>('Todos');
  const [showCreate, setShowCreate] = useState(false);

  const [newName, setNewName] = useState('');
  const [newGroup, setNewGroup] = useState<MuscleGroup>('Peito');
  const [newEquip, setNewEquip] = useState('Halteres');
  const [newRest, setNewRest] = useState(90);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return exercises
      .filter((ex) => (groupFilter === 'Todos' ? true : ex.muscleGroup === groupFilter))
      .filter((ex) =>
        q
          ? ex.name.toLowerCase().includes(q) || ex.equipment.toLowerCase().includes(q)
          : true
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [exercises, query, groupFilter]);

  async function handleCreateAndSelect(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    const item: Exercise = {
      id: `ex-${crypto.randomUUID()}`,
      name: trimmed,
      muscleGroup: newGroup,
      equipment: newEquip.trim() || 'Outro',
      defaultRestSec: Math.max(15, Number(newRest) || 90),
      isCustom: true,
      createdAt: new Date().toISOString(),
    };
    await db.exercises.put(item);
    setNewName('');
    setShowCreate(false);
    onSelect(item);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={title}>
      {!showCreate ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar exercício ou equipamento..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#1E1E24] border border-[#2C2C35] text-sm text-[#F4F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#F97316]"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="shrink-0 inline-flex items-center gap-1 px-3 py-2.5 rounded-xl bg-[#84CC16]/15 text-[#84CC16] border border-[#84CC16]/30 text-xs font-semibold hover:bg-[#84CC16]/25"
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
                onClick={() => setGroupFilter(grp)}
                className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  groupFilter === grp
                    ? 'bg-[#F97316] text-black border-[#F97316]'
                    : 'bg-[#1E1E24] text-[#9CA3AF] border-[#2C2C35] hover:text-[#F4F4F6]'
                }`}
              >
                {grp}
              </button>
            ))}
          </div>

          <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
            {filtered.map((ex) => (
              <button
                key={ex.id}
                type="button"
                onClick={() => {
                  onSelect(ex);
                  onClose();
                }}
                className="w-full text-left px-3.5 py-2.5 rounded-xl bg-[#1E1E24] hover:bg-[#272730] border border-[#2A2A33] flex items-center justify-between gap-2 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#F4F4F6] truncate">{ex.name}</p>
                  <p className="text-[11px] text-[#9CA3AF]">
                    {ex.muscleGroup} · {ex.equipment} · {ex.defaultRestSec}s
                  </p>
                </div>
                <Plus className="w-4 h-4 text-[#84CC16] shrink-0" />
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-xs text-[#9CA3AF] text-center py-6">
                Nenhum exercício encontrado. Crie um novo clicando em "+ Novo".
              </p>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleCreateAndSelect} className="space-y-3">
          <div>
            <label className="block text-xs text-[#9CA3AF] mb-1">Nome do exercício</label>
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ex: Supino inclinado na máquina"
              className="w-full px-3 py-2.5 rounded-xl bg-[#1E1E24] border border-[#2C2C35] text-sm text-[#F4F4F6] focus:outline-none focus:border-[#F97316]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#9CA3AF] mb-1">Grupo muscular</label>
              <select
                value={newGroup}
                onChange={(e) => setNewGroup(e.target.value as MuscleGroup)}
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
                value={newEquip}
                onChange={(e) => setNewEquip(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#1E1E24] border border-[#2C2C35] text-sm text-[#F4F4F6]"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-[#9CA3AF] mb-1">Descanso padrão (segundos)</label>
            <input
              type="number"
              min={15}
              max={600}
              value={newRest}
              onChange={(e) => setNewRest(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl bg-[#1E1E24] border border-[#2C2C35] text-sm text-[#F4F4F6]"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 rounded-xl text-sm bg-[#1E1E24] text-[#D1D5DB]"
            >
              Voltar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#84CC16] text-black"
            >
              Salvar e Adicionar
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
