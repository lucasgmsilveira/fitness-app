import { useEffect, useState } from 'react';
import { db } from '../../db/database';
import type { NutritionGoal } from '../../db/types';
import { Modal } from '../../components/ui/Modal';

interface NutritionGoalsModalProps {
  open: boolean;
  onClose: () => void;
  goal: NutritionGoal;
}

export function NutritionGoalsModal({ open, onClose, goal }: NutritionGoalsModalProps) {
  const [calories, setCalories] = useState(goal.calories);
  const [protein, setProtein] = useState(goal.protein);
  const [carbs, setCarbs] = useState(goal.carbs);
  const [fat, setFat] = useState(goal.fat);
  const [waterMl, setWaterMl] = useState(goal.waterMl);

  useEffect(() => {
    if (!open) return;
    setCalories(goal.calories);
    setProtein(goal.protein);
    setCarbs(goal.carbs);
    setFat(goal.fat);
    setWaterMl(goal.waterMl);
  }, [open, goal]);

  const estimatedFromMacros = Math.round(protein * 4 + carbs * 4 + fat * 9);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    await db.nutritionGoals.put({
      id: 'default',
      calories: Math.max(0, Math.round(calories)),
      protein: Math.max(0, Math.round(protein)),
      carbs: Math.max(0, Math.round(carbs)),
      fat: Math.max(0, Math.round(fat)),
      waterMl: Math.max(0, Math.round(waterMl)),
      updatedAt: new Date().toISOString(),
    });
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Metas Nutricionais Diárias"
      subtitle="Ajuste livremente suas metas de calorias, macros e hidratação"
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm bg-[#1E1E24] text-[#D1D5DB]"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="nutrition-goals-form"
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#F97316] text-black"
          >
            Salvar Metas
          </button>
        </div>
      }
    >
      <form id="nutrition-goals-form" onSubmit={handleSave} className="space-y-3.5">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-[#9CA3AF]">Calorias (kcal)</label>
            <button
              type="button"
              onClick={() => setCalories(estimatedFromMacros)}
              className="text-[0.8125rem] text-[#F97316] hover:underline"
            >
              Usar soma dos macros ({estimatedFromMacros} kcal)
            </button>
          </div>
          <input
            type="number"
            min={0}
            value={calories}
            onChange={(e) => setCalories(Number(e.target.value))}
            className="w-full px-3 py-2.5 rounded-xl bg-[#1E1E24] border border-[#2C2C35] text-sm font-semibold text-[#F4F4F6]"
          />
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <div>
            <label className="block text-xs text-red-400 mb-1">Proteína (g)</label>
            <input
              type="number"
              min={0}
              value={protein}
              onChange={(e) => setProtein(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-[#1E1E24] border border-[#2C2C35] text-sm text-[#F4F4F6]"
            />
          </div>
          <div>
            <label className="block text-xs text-yellow-400 mb-1">Gordura (g)</label>
            <input
              type="number"
              min={0}
              value={fat}
              onChange={(e) => setFat(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-[#1E1E24] border border-[#2C2C35] text-sm text-[#F4F4F6]"
            />
          </div>
          <div>
            <label className="block text-xs text-sky-400 mb-1">Carbo (g)</label>
            <input
              type="number"
              min={0}
              value={carbs}
              onChange={(e) => setCarbs(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-[#1E1E24] border border-[#2C2C35] text-sm text-[#F4F4F6]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-[#9CA3AF] mb-1">Meta de água (ml)</label>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            value={waterMl}
            onChange={(e) => setWaterMl(Number(e.target.value))}
            className="w-full px-3 py-2.5 rounded-xl bg-[#1E1E24] border border-[#2C2C35] text-sm text-[#F4F4F6]"
          />
        </div>
      </form>
    </Modal>
  );
}
