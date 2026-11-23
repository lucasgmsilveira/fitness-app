import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { db } from '../../db/database';
import { MEAL_LABELS, MEAL_ORDER, type FoodItem, type MealEntry, type MealType } from '../../db/types';
import { calculateScaledMacros } from '../../utils/nutritionMath';
import { Modal } from '../../components/ui/Modal';

interface AddMealEntryModalProps {
  open: boolean;
  onClose: () => void;
  date: string;
  initialMealType: MealType;
  foods: FoodItem[];
  editingEntry?: MealEntry | null;
}

function parseDecimal(raw: string): number {
  const normalized = raw.trim().replace(',', '.');
  if (!normalized) return 0;
  const num = Number(normalized);
  return Number.isFinite(num) ? num : 0;
}

export function AddMealEntryModal({
  open,
  onClose,
  date,
  initialMealType,
  foods,
  editingEntry = null,
}: AddMealEntryModalProps) {
  const [mode, setMode] = useState<'catalog' | 'quick'>('catalog');
  const [mealType, setMealType] = useState<MealType>(initialMealType);
  const [query, setQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [unitMode, setUnitMode] = useState<'grams' | 'servings'>('grams');
  const [quantityInput, setQuantityInput] = useState<string>('100');
  const [quantityError, setQuantityError] = useState<string | null>(null);

  // Quick entry fields
  const [quickName, setQuickName] = useState('');
  const [quickCal, setQuickCal] = useState(0);
  const [quickProt, setQuickProt] = useState(0);
  const [quickCarbs, setQuickCarbs] = useState(0);
  const [quickFat, setQuickFat] = useState(0);

  useEffect(() => {
    if (!open) return;
    setMealType(editingEntry?.mealType ?? initialMealType);
    setQuery('');
    setQuantityError(null);

    if (editingEntry) {
      const matched = editingEntry.foodId
        ? foods.find((f) => f.id === editingEntry.foodId) ?? null
        : null;
      if (matched) {
        setMode('catalog');
        setSelectedFood(matched);
        setUnitMode(editingEntry.unitMode);
        setQuantityInput(String(editingEntry.quantity));
      } else {
        setMode('quick');
        setSelectedFood(null);
        setQuickName(editingEntry.foodName);
        setQuickCal(editingEntry.calories);
        setQuickProt(editingEntry.protein);
        setQuickCarbs(editingEntry.carbs);
        setQuickFat(editingEntry.fat);
      }
    } else {
      setMode('catalog');
      setSelectedFood(null);
      setUnitMode('grams');
      setQuantityInput('100');
      setQuickName('');
      setQuickCal(0);
      setQuickProt(0);
      setQuickCarbs(0);
      setQuickFat(0);
    }
  }, [open, initialMealType, editingEntry, foods]);

  const parsedQuantity = useMemo(() => parseDecimal(quantityInput), [quantityInput]);

  const filteredFoods = useMemo(() => {
    const q = query.trim().toLowerCase();
    return foods
      .filter((f) => (q ? f.name.toLowerCase().includes(q) : true))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [foods, query]);

  const previewMacros = useMemo(() => {
    if (!selectedFood) return null;
    return calculateScaledMacros(selectedFood, unitMode, parsedQuantity);
  }, [selectedFood, unitMode, parsedQuantity]);

  function handleSelectFood(food: FoodItem) {
    setSelectedFood(food);
    setUnitMode('grams');
    setQuantityInput(String(food.servingGrams || 100));
    setQuantityError(null);
  }

  async function handleSaveCatalog(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFood || !previewMacros) return;
    if (parsedQuantity <= 0) {
      setQuantityError('Informe uma quantidade maior que zero.');
      return;
    }

    await db.mealEntries.put({
      id: editingEntry?.id ?? `me-${crypto.randomUUID()}`,
      date: editingEntry?.date ?? date,
      mealType,
      foodId: selectedFood.id,
      foodName: selectedFood.name,
      unitMode,
      quantity: parsedQuantity,
      calories: previewMacros.calories,
      protein: previewMacros.protein,
      carbs: previewMacros.carbs,
      fat: previewMacros.fat,
      createdAt: editingEntry?.createdAt ?? new Date().toISOString(),
    });
    onClose();
  }

  async function handleSaveQuick(e: React.FormEvent) {
    e.preventDefault();
    if (!quickName.trim()) return;
    await db.mealEntries.put({
      id: editingEntry?.id ?? `me-${crypto.randomUUID()}`,
      date: editingEntry?.date ?? date,
      mealType,
      foodName: quickName.trim(),
      unitMode: 'servings',
      quantity: 1,
      calories: Math.max(0, Math.round(Number(quickCal) || 0)),
      protein: Math.max(0, Math.round((Number(quickProt) || 0) * 10) / 10),
      carbs: Math.max(0, Math.round((Number(quickCarbs) || 0) * 10) / 10),
      fat: Math.max(0, Math.round((Number(quickFat) || 0) * 10) / 10),
      createdAt: editingEntry?.createdAt ?? new Date().toISOString(),
    });
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingEntry ? 'Editar Item da Refeição' : 'Adicionar Alimento'}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[#1E1E24] border border-[#2C2C35]">
          <button
            type="button"
            onClick={() => setMode('catalog')}
            className={`py-1.5 rounded-lg text-xs font-semibold ${
              mode === 'catalog' ? 'bg-[#F97316] text-black' : 'text-[#9CA3AF]'
            }`}
          >
            Do Catálogo
          </button>
          <button
            type="button"
            onClick={() => setMode('quick')}
            className={`py-1.5 rounded-lg text-xs font-semibold ${
              mode === 'quick' ? 'bg-[#F97316] text-black' : 'text-[#9CA3AF]'
            }`}
          >
            Entrada Rápida
          </button>
        </div>

        <div>
          <label className="block text-xs text-[#9CA3AF] mb-1">Refeição</label>
          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value as MealType)}
            className="w-full px-3 py-2 rounded-xl bg-[#1E1E24] border border-[#2C2C35] text-sm text-[#F4F4F6]"
          >
            {MEAL_ORDER.map((m) => (
              <option key={m} value={m}>
                {MEAL_LABELS[m]}
              </option>
            ))}
          </select>
        </div>

        {mode === 'catalog' ? (
          !selectedFood ? (
            <div className="space-y-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar alimento..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#1E1E24] border border-[#2C2C35] text-sm text-[#F4F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#F97316]"
                />
              </div>

              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                {filteredFoods.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => handleSelectFood(f)}
                    className="w-full text-left px-3 py-2.5 rounded-xl bg-[#1E1E24] hover:bg-[#272730] border border-[#2A2A33]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-[#F4F4F6] truncate">
                        {f.name}
                      </span>
                      <span className="text-xs font-semibold text-[#F97316] shrink-0 tabular-nums">
                        {f.calories} kcal
                      </span>
                    </div>
                    <p className="text-[0.8125rem] text-[#9CA3AF] mt-0.5">
                      Por {f.servingLabel}: {f.protein}g P · {f.carbs}g C · {f.fat}g G
                    </p>
                  </button>
                ))}
                {filteredFoods.length === 0 && (
                  <p className="text-xs text-[#9CA3AF] text-center py-6">
                    Nenhum alimento encontrado. Use "Entrada Rápida" ou cadastre na aba Alimentos.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveCatalog} className="space-y-3.5">
              <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-[#1E1E24] border border-[#2C2C35]">
                <div>
                  <p className="text-sm font-semibold text-[#F4F4F6]">{selectedFood.name}</p>
                  <p className="text-[0.8125rem] text-[#9CA3AF]">
                    Referência: {selectedFood.servingLabel} ({selectedFood.calories} kcal)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFood(null)}
                  className="text-xs text-[#F97316] hover:underline shrink-0"
                >
                  Trocar
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs text-[#9CA3AF] mb-1">Unidade</label>
                  <select
                    value={unitMode}
                    onChange={(e) => {
                      const nextMode = e.target.value as 'grams' | 'servings';
                      setUnitMode(nextMode);
                      setQuantityInput(
                        nextMode === 'grams' ? String(selectedFood.servingGrams) : '1'
                      );
                      setQuantityError(null);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#1E1E24] border border-[#2C2C35] text-sm text-[#F4F4F6]"
                  >
                    <option value="grams">Gramas / ml</option>
                    <option value="servings">Porções ({selectedFood.servingLabel})</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-[#9CA3AF] mb-1">
                    Quantidade ({unitMode === 'grams' ? 'g/ml' : 'porção'})
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    min={0}
                    required
                    value={quantityInput}
                    onChange={(e) => {
                      setQuantityInput(e.target.value);
                      if (quantityError) setQuantityError(null);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#1E1E24] border border-[#2C2C35] text-sm font-semibold text-[#F4F4F6]"
                  />
                </div>
              </div>

              {quantityError && (
                <p className="text-xs text-red-400">{quantityError}</p>
              )}

              {previewMacros && (
                <div className="grid grid-cols-4 gap-2 p-3 rounded-xl bg-[#141418] border border-[#25252C] text-center">
                  <div>
                    <p className="text-[0.75rem] text-[#9CA3AF]">Calorias</p>
                    <p className="text-sm font-bold text-[#F97316] tabular-nums">
                      {previewMacros.calories}
                    </p>
                  </div>
                  <div>
                    <p className="text-[0.75rem] text-red-400">Prot.</p>
                    <p className="text-sm font-bold text-[#F4F4F6] tabular-nums">
                      {previewMacros.protein}g
                    </p>
                  </div>
                  <div>
                    <p className="text-[0.75rem] text-sky-400">Carbo</p>
                    <p className="text-sm font-bold text-[#F4F4F6] tabular-nums">
                      {previewMacros.carbs}g
                    </p>
                  </div>
                  <div>
                    <p className="text-[0.75rem] text-yellow-400">Gord.</p>
                    <p className="text-sm font-bold text-[#F4F4F6] tabular-nums">
                      {previewMacros.fat}g
                    </p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#F97316] text-black text-sm font-bold hover:bg-orange-400"
              >
                {editingEntry ? 'Salvar Alteração' : 'Adicionar à Refeição'}
              </button>
            </form>
          )
        ) : (
          <form onSubmit={handleSaveQuick} className="space-y-3">
            <div>
              <label className="block text-xs text-[#9CA3AF] mb-1">Descrição</label>
              <input
                type="text"
                required
                value={quickName}
                onChange={(e) => setQuickName(e.target.value)}
                placeholder="Ex: Almoço fora / Prato feito"
                className="w-full px-3 py-2.5 rounded-xl bg-[#1E1E24] border border-[#2C2C35] text-sm text-[#F4F4F6]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs text-[#F97316] mb-1">Calorias (kcal)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min={0}
                  required
                  value={quickCal}
                  onChange={(e) => setQuickCal(Number(e.target.value))}
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
                  value={quickProt}
                  onChange={(e) => setQuickProt(Number(e.target.value))}
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
                  value={quickCarbs}
                  onChange={(e) => setQuickCarbs(Number(e.target.value))}
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
                  value={quickFat}
                  onChange={(e) => setQuickFat(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#1E1E24] border border-[#2C2C35] text-sm text-[#F4F4F6]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#F97316] text-black text-sm font-bold hover:bg-orange-400"
            >
              {editingEntry ? 'Salvar Alteração' : 'Salvar Entrada Rápida'}
            </button>
          </form>
        )}
      </div>
    </Modal>
  );
}
