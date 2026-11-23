import { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Droplets,
  Pencil,
  Plus,
  Target,
  Trash2,
} from 'lucide-react';
import { db } from '../../db/database';
import {
  MEAL_LABELS,
  MEAL_ORDER,
  type DailyCheckin,
  type FoodItem,
  type MealEntry,
  type MealType,
  type NutritionGoal,
} from '../../db/types';
import { formatDateBr, getLocalDateString, shiftDateString } from '../../utils/date';
import { sumNutritionEntries } from '../../utils/nutritionMath';
import { AppShell } from '../../components/layout/AppShell';
import { Card } from '../../components/ui/Card';
import { NutritionGoalsModal } from './NutritionGoalsModal';
import { AddMealEntryModal } from './AddMealEntryModal';
import { FoodCatalogView } from './FoodCatalogView';

interface NutritionPageProps {
  foods: FoodItem[];
  mealEntries: MealEntry[];
  goal: NutritionGoal;
  dailyCheckins: DailyCheckin[];
}

export function NutritionPage({
  foods,
  mealEntries,
  goal,
  dailyCheckins,
}: NutritionPageProps) {
  const [subTab, setSubTab] = useState<'diary' | 'foods'>('diary');
  const [selectedDate, setSelectedDate] = useState(() => getLocalDateString());
  const [goalsModalOpen, setGoalsModalOpen] = useState(false);
  const [addModalMeal, setAddModalMeal] = useState<MealType | null>(null);
  const [editingEntry, setEditingEntry] = useState<MealEntry | null>(null);

  const todayStr = getLocalDateString();

  const dayEntries = useMemo(
    () => mealEntries.filter((e) => e.date === selectedDate),
    [mealEntries, selectedDate]
  );

  const totals = useMemo(() => sumNutritionEntries(dayEntries), [dayEntries]);

  const checkin = useMemo(
    () => dailyCheckins.find((c) => c.date === selectedDate),
    [dailyCheckins, selectedDate]
  );
  const waterMl = checkin?.waterMl ?? 0;

  const previousDayEntries = useMemo(() => {
    const prevDate = shiftDateString(selectedDate, -1);
    return mealEntries.filter((e) => e.date === prevDate);
  }, [mealEntries, selectedDate]);

  async function addWater(deltaMl: number) {
    const nextWater = Math.max(0, waterMl + deltaMl);
    await db.dailyCheckins.put({
      ...checkin,
      date: selectedDate,
      waterMl: nextWater,
      updatedAt: new Date().toISOString(),
    });
  }

  async function copyPreviousDay() {
    if (previousDayEntries.length === 0) return;
    const now = new Date().toISOString();
    const clones: MealEntry[] = previousDayEntries.map((item) => ({
      ...item,
      id: `me-${crypto.randomUUID()}`,
      date: selectedDate,
      createdAt: now,
    }));
    await db.mealEntries.bulkPut(clones);
  }

  async function deleteEntry(id: string) {
    await db.mealEntries.delete(id);
  }

  return (
    <AppShell
      title="Nutrição"
      subtitle="Diário alimentar, macros e catálogo editável"
      headerRight={
        <button
          type="button"
          onClick={() => setGoalsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#16161A] border border-[#25252C] text-xs font-medium text-[#D1D5DB] hover:text-white"
        >
          <Target className="w-3.5 h-3.5 text-[#F97316]" />
          Metas
        </button>
      }
    >
      <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-[#16161A] border border-[#25252C]">
        <button
          type="button"
          onClick={() => setSubTab('diary')}
          className={`py-2 rounded-xl text-xs font-semibold transition-colors ${
            subTab === 'diary' ? 'bg-[#25252C] text-[#F4F4F6]' : 'text-[#9CA3AF]'
          }`}
        >
          Diário Alimentar
        </button>
        <button
          type="button"
          onClick={() => setSubTab('foods')}
          className={`py-2 rounded-xl text-xs font-semibold transition-colors ${
            subTab === 'foods' ? 'bg-[#25252C] text-[#F4F4F6]' : 'text-[#9CA3AF]'
          }`}
        >
          Alimentos ({foods.length})
        </button>
      </div>

      {subTab === 'diary' ? (
        <div className="space-y-3.5">
          {/* Seletor de data */}
          <div className="flex items-center justify-between rounded-2xl bg-[#16161A] border border-[#25252C] px-3 py-2">
            <button
              type="button"
              onClick={() => setSelectedDate((d) => shiftDateString(d, -1))}
              aria-label="Dia anterior"
              className="p-2 rounded-xl text-[#9CA3AF] hover:text-white hover:bg-[#1E1E24]"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setSelectedDate(todayStr)}
              className="text-center px-3 py-1 rounded-xl hover:bg-[#1E1E24]"
            >
              <p className="text-sm font-bold text-[#F4F4F6]">
                {formatDateBr(selectedDate, todayStr)}
              </p>
              {selectedDate !== todayStr && (
                <p className="text-[0.75rem] text-[#F97316]">Toque para voltar a Hoje</p>
              )}
            </button>

            <button
              type="button"
              onClick={() => setSelectedDate((d) => shiftDateString(d, 1))}
              aria-label="Próximo dia"
              className="p-2 rounded-xl text-[#9CA3AF] hover:text-white hover:bg-[#1E1E24]"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Resumo diário de macros e água */}
          <Card className="space-y-3">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-xs text-[#9CA3AF]">Calorias do dia</p>
                <p className="text-xl font-bold tabular-nums text-[#F4F4F6]">
                  {totals.calories}{' '}
                  <span className="text-xs font-normal text-[#9CA3AF]">
                    / {goal.calories} kcal
                  </span>
                </p>
              </div>
              <span className="text-xs font-semibold text-[#F97316] tabular-nums">
                {goal.calories - totals.calories >= 0
                  ? `${goal.calories - totals.calories} restantes`
                  : `${Math.abs(goal.calories - totals.calories)} acima`}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-[#1E1E24] p-2.5">
                <p className="text-[0.8125rem] text-red-400 font-medium">Proteína</p>
                <p className="text-xs font-bold tabular-nums mt-0.5">
                  {totals.protein}g{' '}
                  <span className="text-[#9CA3AF] font-normal">/ {goal.protein}g</span>
                </p>
              </div>
              <div className="rounded-xl bg-[#1E1E24] p-2.5">
                <p className="text-[0.8125rem] text-yellow-400 font-medium">Gordura</p>
                <p className="text-xs font-bold tabular-nums mt-0.5">
                  {totals.fat}g{' '}
                  <span className="text-[#9CA3AF] font-normal">/ {goal.fat}g</span>
                </p>
              </div>
              <div className="rounded-xl bg-[#1E1E24] p-2.5">
                <p className="text-[0.8125rem] text-sky-400 font-medium">Carboidrato</p>
                <p className="text-xs font-bold tabular-nums mt-0.5">
                  {totals.carbs}g{' '}
                  <span className="text-[#9CA3AF] font-normal">/ {goal.carbs}g</span>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#25252C]">
              <div className="flex items-center gap-2 text-xs">
                <Droplets className="w-4 h-4 text-sky-400" />
                <span className="font-medium tabular-nums">
                  {waterMl} / {goal.waterMl} ml
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => void addWater(-250)}
                  className="px-2 py-1 rounded-lg bg-[#1E1E24] text-[0.8125rem] text-[#9CA3AF] hover:text-white"
                >
                  -250
                </button>
                <button
                  type="button"
                  onClick={() => void addWater(250)}
                  className="px-2.5 py-1 rounded-lg bg-sky-500/15 border border-sky-500/30 text-[0.8125rem] font-semibold text-sky-300"
                >
                  +250 ml
                </button>
                <button
                  type="button"
                  onClick={() => void addWater(500)}
                  className="px-2.5 py-1 rounded-lg bg-sky-500/15 border border-sky-500/30 text-[0.8125rem] font-semibold text-sky-300"
                >
                  +500 ml
                </button>
              </div>
            </div>
          </Card>

          {dayEntries.length === 0 && previousDayEntries.length > 0 && (
            <button
              type="button"
              onClick={() => void copyPreviousDay()}
              className="w-full py-2.5 px-4 rounded-2xl bg-[#16161A] border border-dashed border-[#3B3B46] text-xs font-medium text-[#D1D5DB] hover:border-[#F97316] flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4 text-[#F97316]" />
              Copiar refeições do dia anterior ({previousDayEntries.length} itens)
            </button>
          )}

          {/* Lista por refeição */}
          {MEAL_ORDER.map((mealType) => {
            const items = dayEntries.filter((e) => e.mealType === mealType);
            const mealTotals = sumNutritionEntries(items);

            return (
              <Card key={mealType} className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-[#F4F4F6]">
                      {MEAL_LABELS[mealType]}
                    </h3>
                    <p className="text-[0.8125rem] text-[#9CA3AF] tabular-nums">
                      {mealTotals.calories} kcal · {mealTotals.protein}g P ·{' '}
                      {mealTotals.carbs}g C · {mealTotals.fat}g G
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingEntry(null);
                      setAddModalMeal(mealType);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#F97316]/15 text-[#F97316] border border-[#F97316]/30 text-xs font-semibold hover:bg-[#F97316]/25"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Adicionar
                  </button>
                </div>

                {items.length > 0 && (
                  <div className="space-y-1.5 pt-1 border-t border-[#22222A]">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-2 py-1.5 px-2.5 rounded-xl bg-[#1E1E24]"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-[#F4F4F6] truncate">
                            {item.foodName}
                          </p>
                          <p className="text-[0.8125rem] text-[#9CA3AF] tabular-nums">
                            {item.unitMode === 'grams'
                              ? `${item.quantity}g`
                              : `${item.quantity}×`}{' '}
                            · {item.calories} kcal · {item.protein}P / {item.carbs}C / {item.fat}G
                          </p>
                        </div>
                        <div className="flex items-center gap-0.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingEntry(item);
                              setAddModalMeal(item.mealType);
                            }}
                            aria-label="Editar item"
                            className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-white"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => void deleteEntry(item.id)}
                            aria-label="Remover item"
                            className="p-1.5 rounded-lg text-red-400/80 hover:text-red-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <FoodCatalogView foods={foods} />
      )}

      <NutritionGoalsModal
        open={goalsModalOpen}
        onClose={() => setGoalsModalOpen(false)}
        goal={goal}
      />

      <AddMealEntryModal
        open={addModalMeal !== null}
        onClose={() => {
          setAddModalMeal(null);
          setEditingEntry(null);
        }}
        date={selectedDate}
        initialMealType={addModalMeal ?? 'almoco'}
        foods={foods}
        editingEntry={editingEntry}
      />
    </AppShell>
  );
}
