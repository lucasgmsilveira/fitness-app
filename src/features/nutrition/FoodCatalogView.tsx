import { useMemo, useState } from 'react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { db } from '../../db/database';
import type { FoodItem } from '../../db/types';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

interface FoodCatalogViewProps {
  foods: FoodItem[];
}

export function FoodCatalogView({ foods }: FoodCatalogViewProps) {
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<FoodItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FoodItem | null>(null);

  const [name, setName] = useState('');
  const [servingLabel, setServingLabel] = useState('100g');
  const [servingGrams, setServingGrams] = useState(100);
  const [calories, setCalories] = useState(100);
  const [protein, setProtein] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fat, setFat] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return foods
      .filter((f) => (q ? f.name.toLowerCase().includes(q) : true))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [foods, query]);

  function openNew() {
    setEditing(null);
    setName('');
    setServingLabel('100g');
    setServingGrams(100);
    setCalories(100);
    setProtein(0);
    setCarbs(0);
    setFat(0);
    setModalOpen(true);
  }

  function openEdit(food: FoodItem) {
    setEditing(food);
    setName(food.name);
    setServingLabel(food.servingLabel);
    setServingGrams(food.servingGrams);
    setCalories(food.calories);
    setProtein(food.protein);
    setCarbs(food.carbs);
    setFat(food.fat);
    setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    await db.foods.put({
      id: editing?.id ?? `fd-${crypto.randomUUID()}`,
      name: name.trim(),
      servingLabel: servingLabel.trim() || `${servingGrams}g`,
      servingGrams: Math.max(1, Number(servingGrams) || 100),
      calories: Math.max(0, Math.round(Number(calories) || 0)),
      protein: Math.max(0, Number(protein) || 0),
      carbs: Math.max(0, Number(carbs) || 0),
      fat: Math.max(0, Number(fat) || 0),
      isCustom: editing?.isCustom ?? true,
      createdAt: editing?.createdAt ?? new Date().toISOString(),
    });
    setModalOpen(false);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await db.foods.delete(deleteTarget.id);
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
            placeholder="Buscar no catálogo de alimentos..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#16161A] border border-[#25252C] text-sm text-[#F4F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#F97316]"
          />
        </div>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#F97316] text-black text-xs font-bold hover:bg-orange-400 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Novo
        </button>
      </div>

      <div className="space-y-2">
        {filtered.map((food) => (
          <Card key={food.id} className="p-3.5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#F4F4F6] truncate">{food.name}</p>
              <p className="text-xs text-[#9CA3AF] mt-0.5 tabular-nums">
                {food.servingLabel}: <span className="text-[#F97316] font-medium">{food.calories} kcal</span> ·{' '}
                {food.protein}g P · {food.carbs}g C · {food.fat}g G
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => openEdit(food)}
                aria-label="Editar alimento"
                className="p-2 rounded-xl text-[#9CA3AF] hover:text-white hover:bg-[#1E1E24]"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(food)}
                aria-label="Excluir alimento"
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
        title={editing ? 'Editar Alimento' : 'Novo Alimento'}
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
              form="food-catalog-form"
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#F97316] text-black"
            >
              Salvar
            </button>
          </div>
        }
      >
        <form id="food-catalog-form" onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block text-xs text-[#9CA3AF] mb-1">Nome do alimento</label>
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
              <label className="block text-xs text-[#9CA3AF] mb-1">Descrição da porção</label>
              <input
                type="text"
                value={servingLabel}
                onChange={(e) => setServingLabel(e.target.value)}
                placeholder="Ex: 100g ou 1 unidade"
                className="w-full px-3 py-2 rounded-xl bg-[#1E1E24] border border-[#2C2C35] text-sm text-[#F4F4F6]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#9CA3AF] mb-1">Peso da porção (g/ml)</label>
              <input
                type="number"
                inputMode="decimal"
                step="any"
                min={1}
                required
                value={servingGrams}
                onChange={(e) => setServingGrams(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[#1E1E24] border border-[#2C2C35] text-sm text-[#F4F4F6]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#F97316] mb-1">Calorias (kcal)</label>
              <input
                type="number"
                inputMode="decimal"
                step="any"
                min={0}
                required
                value={calories}
                onChange={(e) => setCalories(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[#1E1E24] border border-[#2C2C35] text-sm text-[#F4F4F6]"
              />
            </div>
            <div>
              <label className="block text-xs text-red-400 mb-1">Proteína (g)</label>
              <input
                type="number"
                inputMode="decimal"
                step="any"
                min={0}
                value={protein}
                onChange={(e) => setProtein(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[#1E1E24] border border-[#2C2C35] text-sm text-[#F4F4F6]"
              />
            </div>
            <div>
              <label className="block text-xs text-sky-400 mb-1">Carboidrato (g)</label>
              <input
                type="number"
                inputMode="decimal"
                step="any"
                min={0}
                value={carbs}
                onChange={(e) => setCarbs(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[#1E1E24] border border-[#2C2C35] text-sm text-[#F4F4F6]"
              />
            </div>
            <div>
              <label className="block text-xs text-yellow-400 mb-1">Gordura (g)</label>
              <input
                type="number"
                inputMode="decimal"
                step="any"
                min={0}
                value={fat}
                onChange={(e) => setFat(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[#1E1E24] border border-[#2C2C35] text-sm text-[#F4F4F6]"
              />
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Excluir alimento?"
        description={`Remover "${deleteTarget?.name}" do catálogo? Refeições já registradas não serão alteradas.`}
        confirmLabel="Excluir"
      />
    </div>
  );
}
