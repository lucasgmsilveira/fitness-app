import type { GymLogDB } from './database';
import type { Exercise, FoodItem, NutritionGoal, Routine } from './types';

const NOW = '2026-01-01T12:00:00.000Z';

export const INITIAL_EXERCISES: Exercise[] = [
  // Core e estabilidade
  { id: 'ex-prancha', name: 'Prancha Isométrica', muscleGroup: 'Core', equipment: 'Peso corporal', defaultRestSec: 60, notes: 'Manter pelve neutra e respiração controlada.', createdAt: NOW },
  { id: 'ex-dead-bug', name: 'Dead Bug', muscleGroup: 'Core', equipment: 'Peso corporal', defaultRestSec: 60, notes: 'Lombar apoiada no solo durante toda a execução.', createdAt: NOW },
  { id: 'ex-bird-dog', name: 'Bird-Dog', muscleGroup: 'Core', equipment: 'Peso corporal', defaultRestSec: 60, notes: 'Extensão controlada sem rodar o quadril.', createdAt: NOW },
  { id: 'ex-pallof-press', name: 'Pallof Press na Polia', muscleGroup: 'Core', equipment: 'Polia', defaultRestSec: 60, notes: 'Exercício anti-rotação com tronco firme.', createdAt: NOW },
  { id: 'ex-prancha-lateral', name: 'Prancha Lateral', muscleGroup: 'Core', equipment: 'Peso corporal', defaultRestSec: 60, createdAt: NOW },

  // Peito
  { id: 'ex-supino-halter', name: 'Supino Reto com Halteres', muscleGroup: 'Peito', equipment: 'Halteres', defaultRestSec: 90, createdAt: NOW },
  { id: 'ex-supino-inclinado-halter', name: 'Supino Inclinado com Halteres', muscleGroup: 'Peito', equipment: 'Halteres', defaultRestSec: 90, createdAt: NOW },
  { id: 'ex-supino-maquina', name: 'Supino na Máquina', muscleGroup: 'Peito', equipment: 'Máquina', defaultRestSec: 90, createdAt: NOW },
  { id: 'ex-crucifixo-maquina', name: 'Crucifixo / Peck Deck', muscleGroup: 'Peito', equipment: 'Máquina', defaultRestSec: 75, createdAt: NOW },
  { id: 'ex-crossover-polia', name: 'Crossover na Polia', muscleGroup: 'Peito', equipment: 'Polia', defaultRestSec: 75, createdAt: NOW },

  // Costas
  { id: 'ex-puxada-alta', name: 'Puxada Alta (Pulldown)', muscleGroup: 'Costas', equipment: 'Polia', defaultRestSec: 90, createdAt: NOW },
  { id: 'ex-remada-apoiada', name: 'Remada Apoiada no Peito', muscleGroup: 'Costas', equipment: 'Máquina', defaultRestSec: 90, notes: 'Apoio de peito reduz sobrecarga lombar.', createdAt: NOW },
  { id: 'ex-remada-baixa', name: 'Remada Baixa Sentado', muscleGroup: 'Costas', equipment: 'Polia', defaultRestSec: 90, notes: 'Manter tronco estável e coluna neutra.', createdAt: NOW },
  { id: 'ex-remada-unilateral', name: 'Remada Unilateral com Apoio', muscleGroup: 'Costas', equipment: 'Halteres', defaultRestSec: 75, createdAt: NOW },
  { id: 'ex-face-pull', name: 'Face Pull na Polia', muscleGroup: 'Costas', equipment: 'Polia', defaultRestSec: 60, createdAt: NOW },

  // Ombros
  { id: 'ex-desenv-halter', name: 'Desenvolvimento com Halteres', muscleGroup: 'Ombros', equipment: 'Halteres', defaultRestSec: 90, notes: 'Executar sentado com encosto firme.', createdAt: NOW },
  { id: 'ex-desenv-maquina', name: 'Desenvolvimento na Máquina', muscleGroup: 'Ombros', equipment: 'Máquina', defaultRestSec: 90, createdAt: NOW },
  { id: 'ex-elevacao-lateral', name: 'Elevação Lateral', muscleGroup: 'Ombros', equipment: 'Halteres', defaultRestSec: 60, createdAt: NOW },

  // Braços
  { id: 'ex-rosca-halter', name: 'Rosca Direta com Halteres', muscleGroup: 'Braços', equipment: 'Halteres', defaultRestSec: 60, createdAt: NOW },
  { id: 'ex-rosca-martelo', name: 'Rosca Martelo', muscleGroup: 'Braços', equipment: 'Halteres', defaultRestSec: 60, createdAt: NOW },
  { id: 'ex-triceps-polia', name: 'Tríceps Corda na Polia', muscleGroup: 'Braços', equipment: 'Polia', defaultRestSec: 60, createdAt: NOW },
  { id: 'ex-triceps-frances-halter', name: 'Tríceps Francês Sentado', muscleGroup: 'Braços', equipment: 'Halteres', defaultRestSec: 60, createdAt: NOW },

  // Pernas
  { id: 'ex-leg-press', name: 'Leg Press 45°', muscleGroup: 'Pernas', equipment: 'Máquina', defaultRestSec: 120, notes: 'Descer apenas até onde o quadril permanece apoiado no banco.', createdAt: NOW },
  { id: 'ex-agach-bulgaro', name: 'Agachamento Búlgaro', muscleGroup: 'Pernas', equipment: 'Halteres', defaultRestSec: 90, createdAt: NOW },
  { id: 'ex-cadeira-extensora', name: 'Cadeira Extensora', muscleGroup: 'Pernas', equipment: 'Máquina', defaultRestSec: 75, createdAt: NOW },
  { id: 'ex-mesa-flexora', name: 'Mesa Flexora', muscleGroup: 'Pernas', equipment: 'Máquina', defaultRestSec: 75, createdAt: NOW },
  { id: 'ex-elevacao-pelvica', name: 'Elevação Pélvica', muscleGroup: 'Pernas', equipment: 'Máquina / Barra', defaultRestSec: 90, createdAt: NOW },
  { id: 'ex-panturrilha-pe', name: 'Panturrilha em Pé', muscleGroup: 'Pernas', equipment: 'Máquina', defaultRestSec: 60, createdAt: NOW },
];

export const INITIAL_ROUTINES: Routine[] = [
  {
    id: 'rt-treino-a',
    name: 'Treino A — Superiores + Core',
    description: 'Modelo inicial editável para membros superiores com suporte e estabilidade.',
    order: 0,
    updatedAt: NOW,
    exercises: [
      { exerciseId: 'ex-dead-bug', targetSets: 2, targetReps: '10/lado', restSec: 60, notes: 'Ativação inicial de core' },
      { exerciseId: 'ex-supino-halter', targetSets: 3, targetReps: '8-12', restSec: 90 },
      { exerciseId: 'ex-remada-apoiada', targetSets: 3, targetReps: '8-12', restSec: 90 },
      { exerciseId: 'ex-desenv-halter', targetSets: 3, targetReps: '10-12', restSec: 90 },
      { exerciseId: 'ex-puxada-alta', targetSets: 3, targetReps: '10-12', restSec: 90 },
      { exerciseId: 'ex-triceps-polia', targetSets: 2, targetReps: '10-15', restSec: 60 },
      { exerciseId: 'ex-rosca-halter', targetSets: 2, targetReps: '10-15', restSec: 60 },
    ],
  },
  {
    id: 'rt-treino-b',
    name: 'Treino B — Inferiores + Estabilidade',
    description: 'Modelo inicial editável focado em pernas, quadril e controle de tronco.',
    order: 1,
    updatedAt: NOW,
    exercises: [
      { exerciseId: 'ex-bird-dog', targetSets: 2, targetReps: '8/lado', restSec: 60 },
      { exerciseId: 'ex-leg-press', targetSets: 3, targetReps: '10-12', restSec: 120 },
      { exerciseId: 'ex-mesa-flexora', targetSets: 3, targetReps: '10-12', restSec: 75 },
      { exerciseId: 'ex-agach-bulgaro', targetSets: 3, targetReps: '8-10', restSec: 90 },
      { exerciseId: 'ex-cadeira-extensora', targetSets: 3, targetReps: '12-15', restSec: 75 },
      { exerciseId: 'ex-panturrilha-pe', targetSets: 3, targetReps: '12-15', restSec: 60 },
      { exerciseId: 'ex-prancha', targetSets: 3, targetReps: '30-45s', restSec: 60 },
    ],
  },
];

export const INITIAL_FOODS: FoodItem[] = [
  { id: 'fd-frango', name: 'Peito de Frango Grelhado', servingLabel: '100g', servingGrams: 100, calories: 159, protein: 32, carbs: 0, fat: 2.5, createdAt: NOW },
  { id: 'fd-arroz', name: 'Arroz Branco Cozido', servingLabel: '100g', servingGrams: 100, calories: 128, protein: 2.5, carbs: 28, fat: 0.2, createdAt: NOW },
  { id: 'fd-feijao', name: 'Feijão Carioca Cozido', servingLabel: '100g', servingGrams: 100, calories: 76, protein: 4.8, carbs: 13.6, fat: 0.5, createdAt: NOW },
  { id: 'fd-ovo', name: 'Ovo de Galinha Inteiro', servingLabel: '1 unidade (50g)', servingGrams: 50, calories: 74, protein: 6.3, carbs: 0.4, fat: 5.0, createdAt: NOW },
  { id: 'fd-aveia', name: 'Aveia em Flocos', servingLabel: '30g (2 col. sopa)', servingGrams: 30, calories: 117, protein: 4.2, carbs: 20, fat: 2.1, createdAt: NOW },
  { id: 'fd-banana', name: 'Banana Prata', servingLabel: '1 unidade média (70g)', servingGrams: 70, calories: 69, protein: 0.9, carbs: 18, fat: 0.1, createdAt: NOW },
  { id: 'fd-batata-doce', name: 'Batata Doce Cozida', servingLabel: '100g', servingGrams: 100, calories: 77, protein: 0.6, carbs: 18.4, fat: 0.1, createdAt: NOW },
  { id: 'fd-patinho', name: 'Patinho Moído Grelhado', servingLabel: '100g', servingGrams: 100, calories: 219, protein: 35.9, carbs: 0, fat: 7.3, createdAt: NOW },
  { id: 'fd-tilapia', name: 'Filé de Tilápia Grelhado', servingLabel: '100g', servingGrams: 100, calories: 128, protein: 26, carbs: 0, fat: 2.7, createdAt: NOW },
  { id: 'fd-pao-integral', name: 'Pão de Forma Integral', servingLabel: '2 fatias (50g)', servingGrams: 50, calories: 126, protein: 5.0, carbs: 22, fat: 1.8, createdAt: NOW },
  { id: 'fd-azeite', name: 'Azeite de Oliva Extra Virgem', servingLabel: '1 col. sopa (13g)', servingGrams: 13, calories: 115, protein: 0, carbs: 0, fat: 13, createdAt: NOW },
  { id: 'fd-whey', name: 'Whey Protein Concentrado', servingLabel: '1 scoop (30g)', servingGrams: 30, calories: 120, protein: 24, carbs: 3.0, fat: 1.5, createdAt: NOW },
  { id: 'fd-iogurte', name: 'Iogurte Natural Integral', servingLabel: '1 pote (170g)', servingGrams: 170, calories: 104, protein: 6.0, carbs: 7.5, fat: 5.5, createdAt: NOW },
  { id: 'fd-leite-desnatado', name: 'Leite Desnatado', servingLabel: '200ml', servingGrams: 200, calories: 68, protein: 6.6, carbs: 10, fat: 0.2, createdAt: NOW },
  { id: 'fd-pasta-amendoim', name: 'Pasta de Amendoim Integral', servingLabel: '1 col. sopa (15g)', servingGrams: 15, calories: 90, protein: 4.0, carbs: 2.5, fat: 7.5, createdAt: NOW },
  { id: 'fd-queijo-minas', name: 'Queijo Minas Frescal', servingLabel: '30g (1 fatia)', servingGrams: 30, calories: 79, protein: 5.2, carbs: 1.0, fat: 6.1, createdAt: NOW },
  { id: 'fd-brocolis', name: 'Brócolis Cozido', servingLabel: '100g', servingGrams: 100, calories: 25, protein: 2.1, carbs: 4.4, fat: 0.5, createdAt: NOW },
  { id: 'fd-maca', name: 'Maçã', servingLabel: '1 unidade média (130g)', servingGrams: 130, calories: 72, protein: 0.4, carbs: 19, fat: 0.2, createdAt: NOW },
  { id: 'fd-tapioca', name: 'Goma de Tapioca Hidratada', servingLabel: '50g (3 col. sopa)', servingGrams: 50, calories: 120, protein: 0, carbs: 30, fat: 0, createdAt: NOW },
  { id: 'fd-salmao', name: 'Salmão Grelhado', servingLabel: '100g', servingGrams: 100, calories: 206, protein: 22, carbs: 0, fat: 12.4, createdAt: NOW },
];

export const INITIAL_GOAL: NutritionGoal = {
  id: 'default',
  calories: 2200,
  protein: 150,
  carbs: 240,
  fat: 70,
  waterMl: 2500,
  updatedAt: NOW,
};

export async function ensureInitialSeed(db: GymLogDB): Promise<void> {
  const seeded = await db.appMeta.get('seeded');
  if (seeded?.value === 'true') return;

  await db.transaction(
    'rw',
    [db.exercises, db.routines, db.foods, db.nutritionGoals, db.appMeta],
    async () => {
      const checkAgain = await db.appMeta.get('seeded');
      if (checkAgain?.value === 'true') return;

      if ((await db.exercises.count()) === 0) {
        await db.exercises.bulkPut(INITIAL_EXERCISES);
      }
      if ((await db.routines.count()) === 0) {
        await db.routines.bulkPut(INITIAL_ROUTINES);
      }
      if ((await db.foods.count()) === 0) {
        await db.foods.bulkPut(INITIAL_FOODS);
      }
      if ((await db.nutritionGoals.count()) === 0) {
        await db.nutritionGoals.put(INITIAL_GOAL);
      }
      await db.appMeta.put({ key: 'seeded', value: 'true' });
    }
  );
}

export async function resetDatabase(db: GymLogDB, withSeed: boolean): Promise<void> {
  await db.transaction(
    'rw',
    [
      db.exercises,
      db.routines,
      db.workoutSessions,
      db.foods,
      db.mealEntries,
      db.nutritionGoals,
      db.dailyCheckins,
      db.appMeta,
    ],
    async () => {
      await Promise.all([
        db.exercises.clear(),
        db.routines.clear(),
        db.workoutSessions.clear(),
        db.foods.clear(),
        db.mealEntries.clear(),
        db.nutritionGoals.clear(),
        db.dailyCheckins.clear(),
        db.appMeta.clear(),
      ]);

      if (withSeed) {
        await db.exercises.bulkPut(INITIAL_EXERCISES);
        await db.routines.bulkPut(INITIAL_ROUTINES);
        await db.foods.bulkPut(INITIAL_FOODS);
        await db.nutritionGoals.put(INITIAL_GOAL);
        await db.appMeta.put({ key: 'seeded', value: 'true' });
      } else {
        await db.nutritionGoals.put(INITIAL_GOAL);
        await db.appMeta.put({ key: 'seeded', value: 'true' });
      }
    }
  );
}
