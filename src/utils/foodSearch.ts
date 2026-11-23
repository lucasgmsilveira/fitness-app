import { FOOD_PREPARATION_LABELS, type FoodCategory, type FoodItem } from '../db/types';

export type FoodFilterCategory = FoodCategory | 'all' | 'rs' | 'recipes';

export interface FoodSearchOptions {
  query?: string;
  category?: FoodFilterCategory;
  recentIds?: string[];
}

export function normalizeSearchText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function matchesCategory(food: FoodItem, category: FoodFilterCategory): boolean {
  if (category === 'all') return true;
  if (category === 'rs') return Boolean(food.isRegionalRS);
  if (category === 'recipes') return Boolean(food.isRecipe);
  return food.category === category;
}

export function filterAndRankFoods(
  foods: FoodItem[],
  options: FoodSearchOptions = {}
): FoodItem[] {
  const { query = '', category = 'all', recentIds = [] } = options;
  const normalizedQuery = normalizeSearchText(query);
  const tokens = normalizedQuery ? normalizedQuery.split(/\s+/).filter(Boolean) : [];
  const recentRank = new Map(recentIds.map((id, idx) => [id, idx]));

  const matched: Array<{ food: FoodItem; matchScore: number; recentScore: number }> = [];

  for (const food of foods) {
    if (!matchesCategory(food, category)) continue;

    const normName = normalizeSearchText(food.name);
    const normAliases = (food.aliases ?? []).map(normalizeSearchText);
    const prepLabel = food.preparation
      ? normalizeSearchText(FOOD_PREPARATION_LABELS[food.preparation])
      : '';
    const extraFields = [
      food.category ? normalizeSearchText(food.category) : '',
      prepLabel,
      food.source ? normalizeSearchText(food.source) : '',
      food.barcode ? normalizeSearchText(food.barcode) : '',
    ];

    if (tokens.length > 0) {
      const searchable = [normName, ...normAliases, ...extraFields].join(' ');
      const hasAllTokens = tokens.every((token) => searchable.includes(token));
      if (!hasAllTokens) continue;
    }

    let matchScore = 3;
    if (!normalizedQuery) {
      matchScore = 0;
    } else if (normName.startsWith(normalizedQuery)) {
      matchScore = 0;
    } else if (normName.includes(normalizedQuery)) {
      matchScore = 1;
    } else if (normAliases.some((alias) => alias.includes(normalizedQuery))) {
      matchScore = 2;
    }

    const recentScore = recentRank.has(food.id)
      ? recentRank.get(food.id)!
      : Number.MAX_SAFE_INTEGER;

    matched.push({ food, matchScore, recentScore });
  }

  matched.sort((a, b) => {
    if (a.matchScore !== b.matchScore) {
      return a.matchScore - b.matchScore;
    }
    if (a.recentScore !== b.recentScore) {
      return a.recentScore - b.recentScore;
    }
    return a.food.name.localeCompare(b.food.name, 'pt-BR');
  });

  return matched.map((entry) => entry.food);
}
