import { useEffect, useMemo, useState } from 'react';
import { Clock, Search } from 'lucide-react';
import { db } from '../../db/database';
import {
  FOOD_CATEGORIES,
  FOOD_PREPARATION_LABELS,
  MEAL_LABELS,
  MEAL_ORDER,
  type FoodItem,
  type MealEntry,
  type MealType,
} from '../../db/types';
import {
  calculatePer100,
  calculateScaledFiber,
  calculateScaledMacros,
} from '../../utils/nutritionMath';
import { filterAndRankFoods, type FoodFilterCategory } from '../../utils/foodSearch';
import { Modal } from '../../components/ui/Modal';

interface AddMealEntryModalProps {
  open: boolean;
  onClose: () => void;
  date: string;
  initialMealType: MealType;
  foods: FoodItem[];
  editingEntry?: MealEntry | null;
  recentFoodIds?: string[];
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
  recentFoodIds = [],
}: AddMealEntryModalProps) {
  const [mode, setMode] = useState<'catalog' | 'quick'>('catalog');
  const [mealType, setMealType] = useState<MealType>(initialMealType);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<FoodFilterCategory>('all');
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
    setCategoryFilter('all');
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

  const filteredFoods = useMemo(
    () =>
      filterAndRankFoods(foods, {
        query,
        category: categoryFilter,
        recentIds: recentFoodIds,
      }),
    [foods, query, categoryFilter, recentFoodIds]
  );

  const recentFoods = useMemo(() => {
    if (query.trim() !== '' || categoryFilter !== 'all' || recentFoodIds.length === 0) {
      return [];
    }
    const foodMap = new Map(foods.map((f) => [f.id, f]));
    const list: FoodItem[] = [];
    for (const id of recentFoodIds) {
      const found = foodMap.get(id);
      if (found) list.push(found);
      if (list.length >= 4) break;
    }
    return list;
  }, [foods, query, categoryFilter, recentFoodIds]);

  const previewMacros = useMemo(() => {
    if (!selectedFood) return null;
    return calculateScaledMacros(selectedFood, unitMode, parsedQuantity);
  }, [selectedFood, unitMode, parsedQuantity]);

  const previewFiber = useMemo(() => {
    if (!selectedFood) return null;
    return calculateScaledFiber(selectedFood, unitMode, parsedQuantity);
  }, [selectedFood, unitMode, parsedQuantity]);

  const per100Info = useMemo(() => {
    if (!selectedFood || selectedFood.servingGrams === 100) return null;
    return calculatePer100(selectedFood);
  }, [selectedFood]);

  const quickQuantityOptions = useMemo(() => {
    if (!selectedFood) return [];
    if (unitMode === 'servings') return [0.5, 1, 1.5, 2];
    const defaults = [50, 100, 150, 200];
    const sg = Math.round(selectedFood.servingGrams);
    if (sg > 0 && !defaults.includes(sg)) {
      return [sg, 50, 100, 150];
    }
    return defaults;
  }, [selectedFood, unitMode]);

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
      fiber: previewFiber,
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
      fiber: editingEntry?.fiber ?? null,
      createdAt: editingEntry?.createdAt ?? new Date().toISOString(),
    });
    onClose();
  }

  const unitSuffix = selectedFood?.unit === 'ml' ? 'ml' : 'g';

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
                  placeholder="Buscar alimento (ex: cacetinho, arroz, vazio)..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#1E1E24] border border-[#2C2C35] text-sm text-[#F4F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#F97316]"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {(
                  [
                    { key: 'all', label: 'Todos' },
                    { key: 'rs', label: 'RS' },
                    { key: 'recipes', label: 'Receitas' },
                    ...FOOD_CATEGORIES.map((c) => ({ key: c, label: c })),
                  ] as Array<{ key: FoodFilterCategory; label: string }>
                ).map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={() => setCategoryFilter(chip.key)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap border transition-colors ${
                      categoryFilter === chip.key
                        ? 'bg-[#F97316]/15 border-[#F97316]/50 text-[#F97316]'
                        : 'bg-[#1E1E24] border-[#2C2C35] text-[#9CA3AF] hover:text-[#F4F4F6]'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {recentFoods.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[0.75rem] font-medium text-[#9CA3AF] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#F97316]" />
                    Recentes
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {recentFoods.map((rf) => (
                      <button
                        key={`recent-${rf.id}`}
                        type="button"
                        onClick={() => handleSelectFood(rf)}
                        className="text-left px-2.5 py-2 rounded-xl bg-[#1E1E24] hover:bg-[#272730] border border-[#2C2C35]"
                      >
                        <p className="text-xs font-medium text-[#F4F4F6] truncate">{rf.name}</p>
                        <p className="text-[0.75rem] text-[#9CA3AF] tabular-nums">
                          {rf.servingLabel} · {rf.calories} kcal
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {filteredFoods.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => handleSelectFood(f)}
                    className="w-full text-left px-3 py-2.5 rounded-xl bg-[#1E1E24] hover:bg-[#272730] border border-[#2A2A33]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-sm font-medium text-[#F4F4F6] truncate">
                          {f.name}
                        </span>
                        {f.preparation && f.preparation !== 'pronto' && (
                          <span className="px-1.5 py-0.5 rounded bg-[#25252C] text-[0.6875rem] text-[#D1D5DB] shrink-0">
                            {FOOD_PREPARATION_LABELS[f.preparation]}
                          </span>
                        )}
                        {f.isRegionalRS && (
                          <span className="px-1.5 py-0.5 rounded bg-lime-500/15 border border-lime-500/30 text-[0.6875rem] font-semibold text-lime-400 shrink-0">
                            RS
                          </span>
                        )}
                      </div>
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
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#F4F4F6] truncate">
                    {selectedFood.name}
                  </p>
                  <p className="text-[0.8125rem] text-[#9CA3AF]">
                    Porção: {selectedFood.servingLabel} ({selectedFood.calories} kcal)
                  </p>
                  {(per100Info || selectedFood.source || selectedFood.preparation) && (
                    <p className="text-[0.75rem] text-[#6B7280] mt-0.5">
                      {per100Info
                        ? `100${unitSuffix}: ${per100Info.calories} kcal · ${per100Info.protein}P/${per100Info.carbs}C/${per100Info.fat}G`
                        : ''}
                      {per100Info && (selectedFood.preparation || selectedFood.source) ? ' · ' : ''}
                      {selectedFood.preparation
                        ? FOOD_PREPARATION_LABELS[selectedFood.preparation]
                        : ''}
                      {selectedFood.preparation && selectedFood.source ? ' · ' : ''}
                      {selectedFood.source ?? ''}
                    </p>
                  )}
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
                    Quantidade ({unitMode === 'grams' ? unitSuffix : 'porção'})
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

              <div className="flex items-center gap-1.5 flex-wrap">
                {quickQuantityOptions.map((val) => {
                  const isActive = parsedQuantity === val;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        setQuantityInput(String(val));
                        setQuantityError(null);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                        isActive
                          ? 'bg-[#F97316]/15 border-[#F97316]/50 text-[#F97316]'
                          : 'bg-[#1E1E24] border-[#2C2C35] text-[#D1D5DB] hover:text-white'
                      }`}
                    >
                      {unitMode === 'grams' ? `${val}${unitSuffix}` : `${val}×`}
                    </button>
                  );
                })}
              </div>

              {quantityError && <p className="text-xs text-red-400">{quantityError}</p>}

              {previewMacros && (
                <div className="p-3 rounded-xl bg-[#141418] border border-[#25252C] space-y-2">
                  <div className="grid grid-cols-4 gap-2 text-center">
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
                  <p className="text-[0.75rem] text-center text-[#6B7280]">
                    {previewFiber !== null
                      ? `Fibra alimentar: ${previewFiber}g`
                      : 'Fibra alimentar: não informada'}
                  </p>
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
