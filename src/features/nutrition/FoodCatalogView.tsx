import { useMemo, useState } from 'react';
import { Barcode, ChefHat, Info, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { db } from '../../db/database';
import {
  FOOD_CATEGORIES,
  FOOD_PREPARATION_LABELS,
  FOOD_SOURCES,
  type FoodCategory,
  type FoodItem,
  type FoodPreparation,
  type FoodSource,
  type RecipeIngredient,
} from '../../db/types';
import { filterAndRankFoods, type FoodFilterCategory } from '../../utils/foodSearch';
import {
  calculatePer100,
  calculateScaledFiber,
  calculateScaledMacros,
  computeRecipeNutrition,
} from '../../utils/nutritionMath';
import { fetchOpenFoodFactsByBarcode } from '../../utils/openFoodFacts';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

interface FoodCatalogViewProps {
  foods: FoodItem[];
}

const PREP_KEYS: FoodPreparation[] = ['pronto', 'cru', 'cozido', 'grelhado', 'assado', 'frito'];

export function FoodCatalogView({ foods }: FoodCatalogViewProps) {
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<FoodFilterCategory>('all');
  const [infoOpen, setInfoOpen] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalKind, setModalKind] = useState<'food' | 'recipe'>('food');
  const [editing, setEditing] = useState<FoodItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FoodItem | null>(null);

  // Alimento individual
  const [name, setName] = useState('');
  const [servingLabel, setServingLabel] = useState('100g');
  const [servingGrams, setServingGrams] = useState(100);
  const [unit, setUnit] = useState<'g' | 'ml'>('g');
  const [calories, setCalories] = useState(100);
  const [protein, setProtein] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fat, setFat] = useState(0);
  const [fiberInput, setFiberInput] = useState('');
  const [category, setCategory] = useState<FoodCategory>('Suplementos e Outros');
  const [preparation, setPreparation] = useState<FoodPreparation>('pronto');
  const [source, setSource] = useState<string>('Rótulo / Fabricante');
  const [sourceId, setSourceId] = useState('');
  const [barcode, setBarcode] = useState('');
  const [aliasesInput, setAliasesInput] = useState('');
  const [isRegionalRS, setIsRegionalRS] = useState(false);

  // Open Food Facts
  const [barcodeQuery, setBarcodeQuery] = useState('');
  const [offLoading, setOffLoading] = useState(false);
  const [offFeedback, setOffFeedback] = useState<{ tone: 'ok' | 'err'; text: string } | null>(null);

  // Receita própria
  const [recipeName, setRecipeName] = useState('');
  const [recipeCategory, setRecipeCategory] = useState<FoodCategory>('Pratos Gaúchos e Caseiros');
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredient[]>([]);
  const [recipeYieldInput, setRecipeYieldInput] = useState('');
  const [recipeServingLabel, setRecipeServingLabel] = useState('1 porção (200g)');
  const [recipeServingGrams, setRecipeServingGrams] = useState(200);
  const [recipeRegionalRS, setRecipeRegionalRS] = useState(false);
  const [ingSearch, setIngSearch] = useState('');
  const [selectedIngFood, setSelectedIngFood] = useState<FoodItem | null>(null);
  const [ingGramsInput, setIngGramsInput] = useState('100');

  const filtered = useMemo(
    () => filterAndRankFoods(foods, { query, category: categoryFilter }),
    [foods, query, categoryFilter]
  );

  const ingredientSearchResults = useMemo(() => {
    const q = ingSearch.trim();
    if (!q) return [];
    return filterAndRankFoods(
      foods.filter((f) => f.id !== editing?.id),
      { query: q }
    ).slice(0, 6);
  }, [foods, ingSearch, editing]);

  const recipeSummary = useMemo(
    () =>
      computeRecipeNutrition(
        recipeIngredients,
        Number(recipeYieldInput.replace(',', '.')) || 0,
        recipeServingGrams
      ),
    [recipeIngredients, recipeYieldInput, recipeServingGrams]
  );

  const recipePer100 = useMemo(
    () =>
      computeRecipeNutrition(
        recipeIngredients,
        Number(recipeYieldInput.replace(',', '.')) || 0,
        100
      ),
    [recipeIngredients, recipeYieldInput]
  );

  function resetFormFields() {
    setName('');
    setServingLabel('100g');
    setServingGrams(100);
    setUnit('g');
    setCalories(100);
    setProtein(0);
    setCarbs(0);
    setFat(0);
    setFiberInput('');
    setCategory('Suplementos e Outros');
    setPreparation('pronto');
    setSource('Rótulo / Fabricante');
    setSourceId('');
    setBarcode('');
    setAliasesInput('');
    setIsRegionalRS(false);
    setBarcodeQuery('');
    setOffFeedback(null);

    setRecipeName('');
    setRecipeCategory('Pratos Gaúchos e Caseiros');
    setRecipeIngredients([]);
    setRecipeYieldInput('');
    setRecipeServingLabel('1 porção (200g)');
    setRecipeServingGrams(200);
    setRecipeRegionalRS(false);
    setIngSearch('');
    setSelectedIngFood(null);
    setIngGramsInput('100');
  }

  function openNew(kind: 'food' | 'recipe' = 'food') {
    setEditing(null);
    resetFormFields();
    setModalKind(kind);
    setModalOpen(true);
  }

  function openEdit(food: FoodItem) {
    setEditing(food);
    resetFormFields();

    if (food.isRecipe && food.recipeIngredients) {
      setModalKind('recipe');
      setRecipeName(food.name);
      setRecipeCategory(food.category ?? 'Pratos Gaúchos e Caseiros');
      setRecipeIngredients(food.recipeIngredients);
      setRecipeYieldInput(food.recipeYieldGrams ? String(food.recipeYieldGrams) : '');
      setRecipeServingLabel(food.servingLabel);
      setRecipeServingGrams(food.servingGrams);
      setRecipeRegionalRS(Boolean(food.isRegionalRS));
    } else {
      setModalKind('food');
      setName(food.name);
      setServingLabel(food.servingLabel);
      setServingGrams(food.servingGrams);
      setUnit(food.unit ?? 'g');
      setCalories(food.calories);
      setProtein(food.protein);
      setCarbs(food.carbs);
      setFat(food.fat);
      setFiberInput(
        food.fiber !== null && food.fiber !== undefined ? String(food.fiber) : ''
      );
      setCategory(food.category ?? 'Suplementos e Outros');
      setPreparation(food.preparation ?? 'pronto');
      setSource(food.source ?? 'Rótulo / Fabricante');
      setSourceId(food.sourceId ?? '');
      setBarcode(food.barcode ?? '');
      setBarcodeQuery(food.barcode ?? '');
      setAliasesInput((food.aliases ?? []).join(', '));
      setIsRegionalRS(Boolean(food.isRegionalRS));
    }

    setModalOpen(true);
  }

  async function handleBarcodeLookup() {
    setOffFeedback(null);
    setOffLoading(true);
    try {
      const result = await fetchOpenFoodFactsByBarcode(barcodeQuery);
      if (!result.ok) {
        setOffFeedback({ tone: 'err', text: result.error });
        return;
      }

      const f = result.food;
      setName(f.name);
      setServingLabel(f.servingLabel);
      setServingGrams(f.servingGrams);
      setUnit('g');
      setCalories(f.calories);
      setProtein(f.protein);
      setCarbs(f.carbs);
      setFat(f.fat);
      setFiberInput(f.fiber !== null ? String(f.fiber) : '');
      setSource(f.source);
      setSourceId(f.sourceId);
      setBarcode(f.barcode);
      setPreparation('pronto');
      setOffFeedback({
        tone: 'ok',
        text: 'Dados preenchidos por 100g via Open Food Facts. Confira os valores no rótulo da embalagem antes de salvar.',
      });
    } finally {
      setOffLoading(false);
    }
  }

  function handleAddRecipeIngredient() {
    if (!selectedIngFood) return;
    const grams = Number(ingGramsInput.replace(',', '.'));
    if (!Number.isFinite(grams) || grams <= 0) return;

    const scaled = calculateScaledMacros(selectedIngFood, 'grams', grams);
    const scaledFiber = calculateScaledFiber(selectedIngFood, 'grams', grams);

    setRecipeIngredients((prev) => [
      ...prev,
      {
        foodId: selectedIngFood.id,
        foodName: selectedIngFood.name,
        grams: Math.round(grams * 10) / 10,
        calories: scaled.calories,
        protein: scaled.protein,
        carbs: scaled.carbs,
        fat: scaled.fat,
        fiber: scaledFiber,
      },
    ]);
    setSelectedIngFood(null);
    setIngSearch('');
    setIngGramsInput('100');
  }

  function handleRemoveRecipeIngredient(index: number) {
    setRecipeIngredients((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSaveFood(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    const trimmedFiber = fiberInput.trim().replace(',', '.');
    const parsedFiber =
      trimmedFiber === ''
        ? null
        : Number.isFinite(Number(trimmedFiber))
          ? Math.max(0, Math.round(Number(trimmedFiber) * 10) / 10)
          : null;

    const aliases = aliasesInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const safeServingGrams = Math.max(1, Number(servingGrams) || 100);

    await db.foods.put({
      id: editing?.id ?? `fd-${crypto.randomUUID()}`,
      name: name.trim(),
      servingLabel: servingLabel.trim() || `${safeServingGrams}${unit}`,
      servingGrams: safeServingGrams,
      unit,
      calories: Math.max(0, Math.round(Number(calories) || 0)),
      protein: Math.max(0, Number(protein) || 0),
      carbs: Math.max(0, Number(carbs) || 0),
      fat: Math.max(0, Number(fat) || 0),
      fiber: parsedFiber,
      category,
      preparation,
      source: source.trim() || 'Rótulo / Fabricante',
      sourceId: sourceId.trim() || undefined,
      sourceUpdatedAt: new Date().toISOString().slice(0, 10),
      carbBasis: source === 'TBCA 7.3' ? 'available' : 'total',
      barcode: barcode.trim() || undefined,
      aliases: aliases.length > 0 ? aliases : undefined,
      isRegionalRS: isRegionalRS || undefined,
      isCustom: editing?.isCustom ?? true,
      createdAt: editing?.createdAt ?? new Date().toISOString(),
    });
    setModalOpen(false);
  }

  async function handleSaveRecipe(e: React.FormEvent) {
    e.preventDefault();
    if (!recipeName.trim() || recipeIngredients.length === 0) return;

    const safeServingGrams = Math.max(1, Number(recipeServingGrams) || 100);
    const yieldGrams =
      Number(recipeYieldInput.replace(',', '.')) > 0
        ? Math.round(Number(recipeYieldInput.replace(',', '.')) * 10) / 10
        : recipeSummary.totalGrams;

    const computed = computeRecipeNutrition(
      recipeIngredients,
      yieldGrams,
      safeServingGrams
    );

    await db.foods.put({
      id: editing?.id ?? `fd-rec-${crypto.randomUUID()}`,
      name: recipeName.trim(),
      servingLabel: recipeServingLabel.trim() || `${safeServingGrams}g`,
      servingGrams: safeServingGrams,
      unit: 'g',
      calories: computed.calories,
      protein: computed.protein,
      carbs: computed.carbs,
      fat: computed.fat,
      fiber: computed.fiber,
      category: recipeCategory,
      preparation: 'pronto',
      source: 'Receita Própria',
      sourceUpdatedAt: new Date().toISOString().slice(0, 10),
      isRegionalRS: recipeRegionalRS || undefined,
      isRecipe: true,
      recipeYieldGrams: yieldGrams,
      recipeIngredients,
      isCustom: true,
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
            placeholder="Buscar (ex: cacetinho, vazio, cuca)..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#16161A] border border-[#25252C] text-sm text-[#F4F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#F97316]"
          />
        </div>
        <button
          type="button"
          onClick={() => setInfoOpen(true)}
          aria-label="Fontes e cuidados nutricionais"
          className="p-2.5 rounded-xl bg-[#16161A] border border-[#25252C] text-[#9CA3AF] hover:text-white shrink-0"
        >
          <Info className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => openNew('food')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#F97316] text-black text-xs font-bold hover:bg-orange-400 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Novo
        </button>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {(
          [
            { key: 'all', label: `Todos (${foods.length})` },
            { key: 'rs', label: 'RS / Gaúchos' },
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
                : 'bg-[#16161A] border-[#25252C] text-[#9CA3AF] hover:text-[#F4F4F6]'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((food) => {
          const per100 = food.servingGrams !== 100 ? calculatePer100(food) : null;
          const unitSuffix = food.unit === 'ml' ? 'ml' : 'g';

          return (
            <Card key={food.id} className="p-3.5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="text-sm font-semibold text-[#F4F4F6] truncate">
                    {food.name}
                  </p>
                  {food.preparation && food.preparation !== 'pronto' && (
                    <span className="px-1.5 py-0.5 rounded bg-[#1E1E24] border border-[#2C2C35] text-[0.6875rem] text-[#D1D5DB]">
                      {FOOD_PREPARATION_LABELS[food.preparation]}
                    </span>
                  )}
                  {food.isRegionalRS && (
                    <span className="px-1.5 py-0.5 rounded bg-lime-500/15 border border-lime-500/30 text-[0.6875rem] font-semibold text-lime-400">
                      RS
                    </span>
                  )}
                  {food.isRecipe && (
                    <span className="px-1.5 py-0.5 rounded bg-orange-500/15 border border-orange-500/30 text-[0.6875rem] font-semibold text-orange-400">
                      Receita
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#9CA3AF] mt-0.5 tabular-nums">
                  {food.servingLabel}:{' '}
                  <span className="text-[#F97316] font-medium">{food.calories} kcal</span> ·{' '}
                  {food.protein}g P · {food.carbs}g C · {food.fat}g G
                </p>
                {(food.source || per100 || (food.fiber !== null && food.fiber !== undefined)) && (
                  <p className="text-[0.75rem] text-[#6B7280] mt-0.5 tabular-nums">
                    {food.source ?? 'Catálogo'}
                    {per100 ? ` · 100${unitSuffix}: ${per100.calories} kcal` : ''}
                    {food.fiber !== null && food.fiber !== undefined
                      ? ` · Fibra: ${food.fiber}g`
                      : ''}
                  </p>
                )}
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
          );
        })}

        {filtered.length === 0 && (
          <Card className="p-6 text-center space-y-2">
            <p className="text-sm text-[#D1D5DB]">Nenhum alimento encontrado.</p>
            <p className="text-xs text-[#9CA3AF]">
              Tente outro termo ou cadastre um novo alimento / receita própria.
            </p>
          </Card>
        )}
      </div>

      {/* Modal Novo / Editar Alimento ou Receita Própria */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          editing
            ? modalKind === 'recipe'
              ? 'Editar Receita Própria'
              : 'Editar Alimento'
            : modalKind === 'recipe'
              ? 'Nova Receita Própria'
              : 'Novo Alimento'
        }
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
              form={modalKind === 'recipe' ? 'recipe-catalog-form' : 'food-catalog-form'}
              disabled={modalKind === 'recipe' && recipeIngredients.length === 0}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#F97316] text-black disabled:opacity-40"
            >
              Salvar
            </button>
          </div>
        }
      >
        {!editing && (
          <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[#1E1E24] border border-[#2C2C35]">
            <button
              type="button"
              onClick={() => setModalKind('food')}
              className={`py-1.5 rounded-lg text-xs font-semibold ${
                modalKind === 'food' ? 'bg-[#F97316] text-black' : 'text-[#9CA3AF]'
              }`}
            >
              Alimento
            </button>
            <button
              type="button"
              onClick={() => setModalKind('recipe')}
              className={`py-1.5 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-1 ${
                modalKind === 'recipe' ? 'bg-[#F97316] text-black' : 'text-[#9CA3AF]'
              }`}
            >
              <ChefHat className="w-3.5 h-3.5" />
              Receita Própria
            </button>
          </div>
        )}

        {modalKind === 'food' ? (
          <form id="food-catalog-form" onSubmit={handleSaveFood} className="space-y-3">
            {/* Consulta opcional por código de barras (Open Food Facts) */}
            <div className="p-2.5 rounded-xl bg-[#1E1E24] border border-[#2C2C35] space-y-2">
              <label className="block text-xs text-[#9CA3AF] flex items-center gap-1.5">
                <Barcode className="w-3.5 h-3.5 text-[#F97316]" />
                Industrializado? Buscar código de barras (Open Food Facts)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  value={barcodeQuery}
                  onChange={(e) => setBarcodeQuery(e.target.value)}
                  placeholder="EAN (ex: 7891000100103)"
                  className="flex-1 px-3 py-2 rounded-xl bg-[#141418] border border-[#2C2C35] text-xs text-[#F4F4F6]"
                />
                <button
                  type="button"
                  disabled={offLoading}
                  onClick={() => void handleBarcodeLookup()}
                  className="px-3 py-2 rounded-xl bg-[#25252C] hover:bg-[#32323C] text-xs font-semibold text-[#F4F4F6] disabled:opacity-50 shrink-0"
                >
                  {offLoading ? 'Buscando...' : 'Buscar'}
                </button>
              </div>
              {offFeedback && (
                <p
                  className={`text-[0.75rem] ${
                    offFeedback.tone === 'ok' ? 'text-lime-400' : 'text-red-400'
                  }`}
                >
                  {offFeedback.text}
                </p>
              )}
            </div>

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
                <label className="block text-xs text-[#9CA3AF] mb-1">
                  Peso da porção ({unit})
                </label>
                <div className="flex gap-1.5">
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
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as 'g' | 'ml')}
                    aria-label="Unidade"
                    className="px-2 py-2 rounded-xl bg-[#1E1E24] border border-[#2C2C35] text-xs text-[#F4F4F6]"
                  >
                    <option value="g">g</option>
                    <option value="ml">ml</option>
                  </select>
                </div>
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

            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-[#25252C]">
              <div>
                <label className="block text-xs text-[#9CA3AF] mb-1">
                  Fibra (g) — opcional
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min={0}
                  value={fiberInput}
                  onChange={(e) => setFiberInput(e.target.value)}
                  placeholder="Vazio se desconhecido"
                  className="w-full px-3 py-2 rounded-xl bg-[#1E1E24] border border-[#2C2C35] text-xs text-[#F4F4F6] placeholder-[#6B7280]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#9CA3AF] mb-1">Preparo</label>
                <select
                  value={preparation}
                  onChange={(e) => setPreparation(e.target.value as FoodPreparation)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1E1E24] border border-[#2C2C35] text-xs text-[#F4F4F6]"
                >
                  {PREP_KEYS.map((key) => (
                    <option key={key} value={key}>
                      {FOOD_PREPARATION_LABELS[key]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#9CA3AF] mb-1">Categoria</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as FoodCategory)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1E1E24] border border-[#2C2C35] text-xs text-[#F4F4F6]"
                >
                  {FOOD_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#9CA3AF] mb-1">Fonte</label>
                <select
                  value={FOOD_SOURCES.includes(source as FoodSource) ? source : 'Rótulo / Fabricante'}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1E1E24] border border-[#2C2C35] text-xs text-[#F4F4F6]"
                >
                  {FOOD_SOURCES.map((src) => (
                    <option key={src} value={src}>
                      {src}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-[#9CA3AF] mb-1">
                Sinônimos de busca (opcional, separados por vírgula)
              </label>
              <input
                type="text"
                value={aliasesInput}
                onChange={(e) => setAliasesInput(e.target.value)}
                placeholder="Ex: cacetinho, pao de sal"
                className="w-full px-3 py-2 rounded-xl bg-[#1E1E24] border border-[#2C2C35] text-xs text-[#F4F4F6] placeholder-[#6B7280]"
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-[#D1D5DB]">
              <input
                type="checkbox"
                checked={isRegionalRS}
                onChange={(e) => setIsRegionalRS(e.target.checked)}
                className="rounded border-[#2C2C35] bg-[#1E1E24] accent-[#84CC16]"
              />
              Marcar como alimento típico / regional do RS
            </label>
          </form>
        ) : (
          <form id="recipe-catalog-form" onSubmit={handleSaveRecipe} className="space-y-3">
            <div>
              <label className="block text-xs text-[#9CA3AF] mb-1">Nome da receita</label>
              <input
                type="text"
                required
                value={recipeName}
                onChange={(e) => setRecipeName(e.target.value)}
                placeholder="Ex: Carreteiro de Casa / Cuca da Família"
                className="w-full px-3 py-2.5 rounded-xl bg-[#1E1E24] border border-[#2C2C35] text-sm text-[#F4F4F6]"
              />
            </div>

            {/* Adicionar ingrediente */}
            <div className="p-2.5 rounded-xl bg-[#1E1E24] border border-[#2C2C35] space-y-2">
              <p className="text-xs font-semibold text-[#D1D5DB]">Adicionar ingrediente</p>
              {!selectedIngFood ? (
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={ingSearch}
                    onChange={(e) => setIngSearch(e.target.value)}
                    placeholder="Buscar ingrediente do catálogo..."
                    className="w-full px-3 py-2 rounded-xl bg-[#141418] border border-[#2C2C35] text-xs text-[#F4F4F6]"
                  />
                  {ingredientSearchResults.length > 0 && (
                    <div className="space-y-1 max-h-36 overflow-y-auto">
                      {ingredientSearchResults.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setSelectedIngFood(item);
                            setIngGramsInput(String(item.servingGrams || 100));
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg bg-[#16161A] hover:bg-[#25252C] text-xs text-[#F4F4F6] flex items-center justify-between gap-2"
                        >
                          <span className="truncate">{item.name}</span>
                          <span className="text-[0.75rem] text-[#9CA3AF] shrink-0">
                            {item.calories} kcal / {item.servingGrams}g
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-medium text-[#F4F4F6] truncate">
                      {selectedIngFood.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedIngFood(null)}
                      className="text-[#F97316] shrink-0"
                    >
                      Trocar
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      inputMode="decimal"
                      step="any"
                      min={1}
                      value={ingGramsInput}
                      onChange={(e) => setIngGramsInput(e.target.value)}
                      placeholder="g/ml"
                      className="w-24 px-2.5 py-1.5 rounded-xl bg-[#141418] border border-[#2C2C35] text-xs text-[#F4F4F6]"
                    />
                    <span className="text-xs text-[#9CA3AF]">g/ml</span>
                    <button
                      type="button"
                      onClick={handleAddRecipeIngredient}
                      className="ml-auto px-3 py-1.5 rounded-xl bg-[#84CC16] text-black text-xs font-bold"
                    >
                      Incluir
                    </button>
                  </div>
                </div>
              )}
            </div>

            {recipeIngredients.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs text-[#9CA3AF]">
                  Ingredientes ({recipeIngredients.length}) · Soma: {recipeSummary.totalGrams}g
                </p>
                {recipeIngredients.map((ing, idx) => (
                  <div
                    key={`${ing.foodName}-${idx}`}
                    className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-[#1E1E24] text-xs"
                  >
                    <div className="min-w-0">
                      <p className="text-[#F4F4F6] truncate">
                        {ing.foodName} ({ing.grams}g)
                      </p>
                      <p className="text-[0.75rem] text-[#9CA3AF] tabular-nums">
                        {ing.calories} kcal · {ing.protein}P / {ing.carbs}C / {ing.fat}G
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveRecipeIngredient(idx)}
                      aria-label="Remover ingrediente"
                      className="p-1 text-red-400/80 hover:text-red-400 shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[#9CA3AF] mb-1">
                  Peso final pronto (g)
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min={1}
                  value={recipeYieldInput}
                  onChange={(e) => setRecipeYieldInput(e.target.value)}
                  placeholder={
                    recipeSummary.totalGrams > 0
                      ? `Padrão: ${recipeSummary.totalGrams}g`
                      : 'Ex: 800'
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#1E1E24] border border-[#2C2C35] text-xs text-[#F4F4F6]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#9CA3AF] mb-1">Categoria</label>
                <select
                  value={recipeCategory}
                  onChange={(e) => setRecipeCategory(e.target.value as FoodCategory)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1E1E24] border border-[#2C2C35] text-xs text-[#F4F4F6]"
                >
                  {FOOD_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#9CA3AF] mb-1">Descrição da porção</label>
                <input
                  type="text"
                  value={recipeServingLabel}
                  onChange={(e) => setRecipeServingLabel(e.target.value)}
                  placeholder="Ex: 1 porção (200g)"
                  className="w-full px-3 py-2 rounded-xl bg-[#1E1E24] border border-[#2C2C35] text-xs text-[#F4F4F6]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#9CA3AF] mb-1">Peso da porção (g)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min={1}
                  required
                  value={recipeServingGrams}
                  onChange={(e) => setRecipeServingGrams(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#1E1E24] border border-[#2C2C35] text-xs text-[#F4F4F6]"
                />
              </div>
            </div>

            {recipeIngredients.length > 0 && (
              <div className="p-3 rounded-xl bg-[#141418] border border-[#25252C] space-y-1 text-center">
                <p className="text-xs font-semibold text-[#F4F4F6] tabular-nums">
                  Por porção ({recipeServingGrams}g):{' '}
                  <span className="text-[#F97316]">{recipeSummary.calories} kcal</span> ·{' '}
                  {recipeSummary.protein}P · {recipeSummary.carbs}C · {recipeSummary.fat}G
                </p>
                <p className="text-[0.75rem] text-[#9CA3AF] tabular-nums">
                  Por 100g: {recipePer100.calories} kcal · {recipePer100.protein}P ·{' '}
                  {recipePer100.carbs}C · {recipePer100.fat}G
                </p>
              </div>
            )}

            <label className="flex items-center gap-2 text-xs text-[#D1D5DB]">
              <input
                type="checkbox"
                checked={recipeRegionalRS}
                onChange={(e) => setRecipeRegionalRS(e.target.checked)}
                className="rounded border-[#2C2C35] bg-[#1E1E24] accent-[#84CC16]"
              />
              Marcar como receita típica do RS
            </label>
          </form>
        )}
      </Modal>

      {/* Modal informativo sobre fontes e precisão nutricional */}
      <Modal
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
        title="Fontes e Cuidados Nutricionais"
      >
        <div className="space-y-3 text-xs text-[#D1D5DB] leading-relaxed">
          <p>
            <strong className="text-[#F4F4F6]">Referências brasileiras:</strong> o catálogo inicial combina valores da{' '}
            <strong className="text-[#F4F4F6]">TACO 4ª edição (Unicamp)</strong>,{' '}
            <strong className="text-[#F4F4F6]">TBCA 7.3 (USP/FoRC)</strong> e{' '}
            <strong className="text-[#F4F4F6]">IBGE POF</strong>, com destaque para alimentos e preparações comuns no Rio Grande do Sul.
          </p>
          <p>
            <strong className="text-[#F4F4F6]">Cru vs. Cozido:</strong> 100g de arroz ou carne crus têm densidade calórica diferente de 100g após o preparo (ganho ou perda de água). Escolha sempre o estado correspondente ao que foi pesado.
          </p>
          <p>
            <strong className="text-[#F4F4F6]">Carboidratos e Fibras:</strong> a TACO reporta carboidratos totais (incluindo fibras), enquanto a TBCA diferencia carboidratos disponíveis. Quando a fibra não foi analisada, ela fica como <span className="text-[#9CA3AF]">não informada</span> (nunca assumida como zero).
          </p>
          <p>
            <strong className="text-[#F4F4F6]">Industrializados e Receitas:</strong> produtos consultados via{' '}
            <strong className="text-[#F4F4F6]">Open Food Facts</strong> devem ser conferidos no rótulo da embalagem. Para preparações caseiras (churrasco, cuca, carreteiro, entrevero), use <strong className="text-[#F4F4F6]">Novo → Receita Própria</strong>.
          </p>
        </div>
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
