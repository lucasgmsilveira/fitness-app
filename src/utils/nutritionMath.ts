import type { FoodItem, MealEntry, RecipeIngredient } from '../db/types';

export interface MacroTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Per100Nutrition extends MacroTotals {
  fiber: number | null;
}

export interface RecipeNutritionSummary extends MacroTotals {
  totalGrams: number;
  effectiveYieldGrams: number;
  fiber: number | null;
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

export function calculateScaledFiber(
  food: Pick<FoodItem, 'servingGrams' | 'fiber'>,
  unitMode: 'grams' | 'servings',
  quantity: number
): number | null {
  if (food.fiber === null || food.fiber === undefined || !Number.isFinite(food.fiber)) {
    return null;
  }
  const safeQty = Number.isFinite(quantity) && quantity > 0 ? quantity : 0;
  const baseGrams = food.servingGrams > 0 ? food.servingGrams : 100;
  const factor = unitMode === 'grams' ? safeQty / baseGrams : safeQty;
  return round1(Math.max(0, food.fiber) * factor);
}

export function calculatePer100(
  food: Pick<FoodItem, 'servingGrams' | 'calories' | 'protein' | 'carbs' | 'fat' | 'fiber'>
): Per100Nutrition {
  const scaled = calculateScaledMacros(food, 'grams', 100);
  const fiber = calculateScaledFiber(food, 'grams', 100);
  return {
    ...scaled,
    fiber,
  };
}

export function computeRecipeNutrition(
  ingredients: RecipeIngredient[],
  yieldGrams: number,
  servingGrams: number
): RecipeNutritionSummary {
  let totalGrams = 0;
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalFiber = 0;
  let hasUnknownFiber = ingredients.length === 0;

  for (const ing of ingredients) {
    const grams = Number.isFinite(ing.grams) && ing.grams > 0 ? ing.grams : 0;
    totalGrams += grams;
    totalCalories += ing.calories || 0;
    totalProtein += ing.protein || 0;
    totalCarbs += ing.carbs || 0;
    totalFat += ing.fat || 0;

    if (ing.fiber === null || ing.fiber === undefined || !Number.isFinite(ing.fiber)) {
      hasUnknownFiber = true;
    } else {
      totalFiber += Math.max(0, ing.fiber);
    }
  }

  const effectiveYieldGrams =
    Number.isFinite(yieldGrams) && yieldGrams > 0 ? yieldGrams : totalGrams;
  const targetServing =
    Number.isFinite(servingGrams) && servingGrams > 0 ? servingGrams : 100;

  if (effectiveYieldGrams <= 0) {
    return {
      totalGrams: round1(totalGrams),
      effectiveYieldGrams: 0,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: null,
    };
  }

  const factor = targetServing / effectiveYieldGrams;

  return {
    totalGrams: round1(totalGrams),
    effectiveYieldGrams: round1(effectiveYieldGrams),
    calories: Math.round(totalCalories * factor),
    protein: round1(totalProtein * factor),
    carbs: round1(totalCarbs * factor),
    fat: round1(totalFat * factor),
    fiber: hasUnknownFiber ? null : round1(totalFiber * factor),
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
