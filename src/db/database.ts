import Dexie, { type Table } from 'dexie';
import type {
  AppMeta,
  DailyCheckin,
  Exercise,
  FoodItem,
  MealEntry,
  NutritionGoal,
  Routine,
  WorkoutSession,
} from './types';

export class GymLogDB extends Dexie {
  exercises!: Table<Exercise, string>;
  routines!: Table<Routine, string>;
  workoutSessions!: Table<WorkoutSession, string>;
  foods!: Table<FoodItem, string>;
  mealEntries!: Table<MealEntry, string>;
  nutritionGoals!: Table<NutritionGoal, string>;
  dailyCheckins!: Table<DailyCheckin, string>;
  appMeta!: Table<AppMeta, string>;

  constructor(name = 'GymLogDB') {
    super(name);
    this.version(1).stores({
      exercises: 'id, name, muscleGroup',
      routines: 'id, order, name',
      workoutSessions: 'id, status, date, startedAt, routineId',
      foods: 'id, name',
      mealEntries: 'id, date, mealType, [date+mealType]',
      nutritionGoals: 'id',
      dailyCheckins: 'date',
      appMeta: 'key',
    });
  }
}

export const db = new GymLogDB();
