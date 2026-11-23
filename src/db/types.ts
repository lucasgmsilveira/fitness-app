export type MuscleGroup =
  | 'Peito'
  | 'Costas'
  | 'Pernas'
  | 'Ombros'
  | 'Braços'
  | 'Core'
  | 'Cardio/Mobilidade'
  | 'Outro';

export const MUSCLE_GROUPS: MuscleGroup[] = [
  'Peito',
  'Costas',
  'Pernas',
  'Ombros',
  'Braços',
  'Core',
  'Cardio/Mobilidade',
  'Outro',
];

export type IntensityLevel = 'L' | 'M' | 'P';

export type MealType = 'cafe' | 'almoco' | 'lanche' | 'jantar' | 'ceia';

export const MEAL_LABELS: Record<MealType, string> = {
  cafe: 'Café da Manhã',
  almoco: 'Almoço',
  lanche: 'Lanche',
  jantar: 'Jantar',
  ceia: 'Ceia',
};

export const MEAL_ORDER: MealType[] = ['cafe', 'almoco', 'lanche', 'jantar', 'ceia'];

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  equipment: string;
  defaultRestSec: number;
  notes?: string;
  isCustom?: boolean;
  createdAt: string;
}

export interface RoutineExercise {
  exerciseId: string;
  targetSets: number;
  targetReps: string;
  restSec: number;
  supersetGroup?: string;
  notes?: string;
}

export interface Routine {
  id: string;
  name: string;
  description?: string;
  order: number;
  exercises: RoutineExercise[];
  updatedAt: string;
}

export interface WorkoutSet {
  id: string;
  weightKg: number | null;
  reps: number | null;
  intensity: IntensityLevel | null;
  rir: number | null;
  completed: boolean;
}

export interface WorkoutExerciseLog {
  id: string;
  exerciseId: string;
  exerciseName: string;
  equipment: string;
  supersetGroup?: string;
  notes?: string;
  sets: WorkoutSet[];
}

export interface WorkoutSession {
  id: string;
  routineId?: string;
  routineName: string;
  status: 'active' | 'completed';
  date: string;
  startedAt: string;
  finishedAt?: string;
  durationSec: number;
  exercises: WorkoutExerciseLog[];
  totalVolumeKg: number;
  totalReps: number;
  totalSets: number;
  lumbarScore: number | null;
  notes?: string;
}

export type FoodCategory =
  | 'Carnes e Churrasco'
  | 'Aves, Peixes e Ovos'
  | 'Grãos, Massas e Raízes'
  | 'Pratos Gaúchos e Caseiros'
  | 'Pães, Cucas e Cereais'
  | 'Laticínios e Pastas'
  | 'Frutas'
  | 'Legumes e Verduras'
  | 'Gorduras e Oleaginosas'
  | 'Bebidas e Chimarrão'
  | 'Suplementos e Outros';

export const FOOD_CATEGORIES: FoodCategory[] = [
  'Carnes e Churrasco',
  'Aves, Peixes e Ovos',
  'Grãos, Massas e Raízes',
  'Pratos Gaúchos e Caseiros',
  'Pães, Cucas e Cereais',
  'Laticínios e Pastas',
  'Frutas',
  'Legumes e Verduras',
  'Gorduras e Oleaginosas',
  'Bebidas e Chimarrão',
  'Suplementos e Outros',
];

export type FoodPreparation = 'cru' | 'cozido' | 'grelhado' | 'assado' | 'frito' | 'pronto';

export const FOOD_PREPARATION_LABELS: Record<FoodPreparation, string> = {
  cru: 'Cru',
  cozido: 'Cozido',
  grelhado: 'Grelhado',
  assado: 'Assado',
  frito: 'Frito',
  pronto: 'Pronto',
};

export type FoodSource =
  | 'TBCA 7.3'
  | 'TACO 4ª ed.'
  | 'IBGE POF'
  | 'USDA FDC'
  | 'Open Food Facts'
  | 'Rótulo / Fabricante'
  | 'Receita Própria';

export const FOOD_SOURCES: FoodSource[] = [
  'TACO 4ª ed.',
  'TBCA 7.3',
  'IBGE POF',
  'USDA FDC',
  'Open Food Facts',
  'Rótulo / Fabricante',
  'Receita Própria',
];

export interface RecipeIngredient {
  foodId?: string;
  foodName: string;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number | null;
}

export interface FoodItem {
  id: string;
  name: string;
  servingLabel: string;
  servingGrams: number;
  unit?: 'g' | 'ml';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number | null;
  category?: FoodCategory;
  preparation?: FoodPreparation;
  aliases?: string[];
  isRegionalRS?: boolean;
  source?: FoodSource | string;
  sourceId?: string;
  sourceUpdatedAt?: string;
  carbBasis?: 'available' | 'total';
  barcode?: string;
  isRecipe?: boolean;
  recipeYieldGrams?: number;
  recipeIngredients?: RecipeIngredient[];
  isCustom?: boolean;
  createdAt: string;
}

export interface MealEntry {
  id: string;
  date: string;
  mealType: MealType;
  foodId?: string;
  foodName: string;
  unitMode: 'grams' | 'servings';
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number | null;
  createdAt: string;
}

export interface NutritionGoal {
  id: 'default';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  waterMl: number;
  updatedAt: string;
}

export interface DailyCheckin {
  date: string;
  weightKg?: number | null;
  waterMl?: number | null;
  lumbarScore?: number | null;
  stiffnessNote?: string;
  waistCm?: number | null;
  chestCm?: number | null;
  armCm?: number | null;
  thighCm?: number | null;
  hipCm?: number | null;
  updatedAt: string;
}

export interface AppMeta {
  key: string;
  value: string;
}

export interface BackupDataCollections {
  exercises: Exercise[];
  routines: Routine[];
  workoutSessions: WorkoutSession[];
  foods: FoodItem[];
  mealEntries: MealEntry[];
  nutritionGoals: NutritionGoal[];
  dailyCheckins: DailyCheckin[];
}

export interface BackupPayload {
  app: 'gymlog-pwa';
  schemaVersion: 1;
  exportedAt: string;
  data: BackupDataCollections;
}
