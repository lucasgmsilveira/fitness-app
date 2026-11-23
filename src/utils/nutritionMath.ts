import type { FoodItem, MealEntry } from '../db/types';

export interface MacroTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

export function calculateScaledMacros(
  food: Pick<FoodItem, 'servingGrams' | 'calories' | 'protein' | 'carbs' | 'fat'>,
  unitMode: 'grams' | 'servings',
  quantity: number
): MacroTotals {
  const safeQty = Number.isFinite(quantity) && quantity > 0 ? quantity : 0;
  const baseGrams = food.servingGrams > 0 ? food.servingGrams : 100;
  const factor = unitMode === 'grams' ? safeQty / baseGrams : safeQty;

  return {
    calories: Math.round(food.calories * factor),
    protein: round1(food.protein * factor),
    carbs: round1(food.carbs * factor),
    fat: round1(food.fat * factor),
  };
}

export function sumNutritionEntries(
  entries: Array<Pick<MealEntry, 'calories' | 'protein' | 'carbs' | 'fat'>>
): MacroTotals {
  let calories = 0;
  let protein = 0;
  let carbs = 0;
  let fat = 0;

  for (const item of entries) {
    calories += item.calories || 0;
    protein += item.protein || 0;
    carbs += item.carbs || 0;
    fat += item.fat || 0;
  }

  return {
    calories: Math.round(calories),
    protein: round1(protein),
    carbs: round1(carbs),
    fat: round1(fat),
  };
}
