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

export interface FoodItem {
  id: string;
  name: string;
  servingLabel: string;
  servingGrams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
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
