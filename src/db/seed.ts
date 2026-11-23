import type { GymLogDB } from './database';
import type { Exercise, FoodItem, NutritionGoal, Routine } from './types';

export const SEED_TIMESTAMP_V1 = '2026-01-01T12:00:00.000Z';
export const CURRENT_SEED_VERSION = '2';

export const INITIAL_EXERCISES: Exercise[] = [
  // Core e estabilidade
  { id: 'ex-prancha', name: 'Prancha Isométrica', muscleGroup: 'Core', equipment: 'Peso corporal', defaultRestSec: 60, notes: 'Manter pelve neutra e respiração controlada.', createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-dead-bug', name: 'Dead Bug', muscleGroup: 'Core', equipment: 'Peso corporal', defaultRestSec: 45, notes: 'Lombar apoiada no solo durante toda a execução.', createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-bird-dog', name: 'Bird-Dog', muscleGroup: 'Core', equipment: 'Peso corporal', defaultRestSec: 60, notes: 'Extensão controlada sem rodar o quadril.', createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-pallof-press', name: 'Pallof Press na Polia', muscleGroup: 'Core', equipment: 'Polia', defaultRestSec: 60, notes: 'Exercício anti-rotação com tronco firme.', createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-prancha-lateral', name: 'Prancha Lateral', muscleGroup: 'Core', equipment: 'Peso corporal', defaultRestSec: 60, createdAt: SEED_TIMESTAMP_V1 },

  // Peito
  { id: 'ex-supino-halter', name: 'Supino Reto com Halteres', muscleGroup: 'Peito', equipment: 'Halteres', defaultRestSec: 90, notes: 'Pés firmes no chão evitando hiperextensão lombar.', createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-crucifixo-halter', name: 'Crucifixo Reto com Halteres', muscleGroup: 'Peito', equipment: 'Halteres', defaultRestSec: 75, notes: 'Amplitude controlada com lombar apoiada no banco.', createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-supino-inclinado-halter', name: 'Supino Inclinado com Halteres', muscleGroup: 'Peito', equipment: 'Halteres', defaultRestSec: 90, notes: 'Banco a 30° mantendo tronco estável.', createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-supino-maquina', name: 'Supino na Máquina', muscleGroup: 'Peito', equipment: 'Máquina', defaultRestSec: 90, notes: 'Costas totalmente apoiadas no encosto.', createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-crucifixo-maquina', name: 'Voador (Peck Deck)', muscleGroup: 'Peito', equipment: 'Máquina', defaultRestSec: 75, notes: 'Costas firmes no encosto durante todo o arco.', createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-crossover-polia', name: 'Crossover (de cima para baixo)', muscleGroup: 'Peito', equipment: 'Polia', defaultRestSec: 75, notes: 'Base alternada e abdômen firme para estabilizar o tronco.', createdAt: SEED_TIMESTAMP_V1 },

  // Costas
  { id: 'ex-puxada-alta', name: 'Puxada Frontal Aberta', muscleGroup: 'Costas', equipment: 'Polia', defaultRestSec: 90, notes: 'Evitar inclinar excessivamente o tronco para trás.', createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-puxada-triangulo', name: 'Puxada Triângulo', muscleGroup: 'Costas', equipment: 'Polia', defaultRestSec: 90, notes: 'Coluna neutra e retorno controlado.', createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-remada-apoiada', name: 'Remada Apoiada no Peito', muscleGroup: 'Costas', equipment: 'Máquina', defaultRestSec: 90, notes: 'Apoio de peito reduz sobrecarga lombar.', createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-remada-baixa', name: 'Remada Baixa Triângulo', muscleGroup: 'Costas', equipment: 'Polia', defaultRestSec: 90, notes: 'Manter tronco estável e coluna neutra sem balanço.', createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-remada-unilateral', name: 'Serrote Apoiado no Banco', muscleGroup: 'Costas', equipment: 'Halteres', defaultRestSec: 75, notes: 'Apoiar mão/peito no banco inclinado sem girar a lombar.', createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-face-pull', name: 'Face Pull na Polia', muscleGroup: 'Costas', equipment: 'Polia', defaultRestSec: 60, createdAt: SEED_TIMESTAMP_V1 },

  // Ombros e Trapézio
  { id: 'ex-desenv-halter', name: 'Desenvolvimento com Halteres', muscleGroup: 'Ombros', equipment: 'Halteres', defaultRestSec: 90, notes: 'Sentado com encosto firme (~75–80°) e costelas encaixadas.', createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-desenv-maquina', name: 'Desenvolvimento na Máquina', muscleGroup: 'Ombros', equipment: 'Máquina', defaultRestSec: 90, createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-elevacao-frontal', name: 'Elevação Frontal Sentado', muscleGroup: 'Ombros', equipment: 'Halteres', defaultRestSec: 60, notes: 'Sentado com encosto para evitar balanço do tronco.', createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-elevacao-lateral', name: 'Elevação Lateral', muscleGroup: 'Ombros', equipment: 'Halteres', defaultRestSec: 60, notes: 'Execução controlada evitando impulso.', createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-elevacao-lateral-cabo', name: 'Elevação Unilateral no Cabo', muscleGroup: 'Ombros', equipment: 'Polia', defaultRestSec: 60, notes: 'Tronco firme sem inclinação lateral excessiva.', createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-voador-invertido', name: 'Voador Invertido', muscleGroup: 'Ombros', equipment: 'Máquina', defaultRestSec: 60, notes: 'Peito apoiado no encosto com foco no deltoide posterior.', createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-encolhimento-apoiado', name: 'Encolhimento no Banco Inclinado', muscleGroup: 'Ombros', equipment: 'Halteres', defaultRestSec: 60, notes: 'Peito apoiado reduz compressão axial na coluna.', createdAt: SEED_TIMESTAMP_V1 },

  // Braços
  { id: 'ex-rosca-halter', name: 'Rosca Direta Sentado (Banco Inclinado)', muscleGroup: 'Braços', equipment: 'Halteres', defaultRestSec: 60, notes: 'Costas apoiadas eliminam impulso lombar.', createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-rosca-scott', name: 'Rosca Scott', muscleGroup: 'Braços', equipment: 'Máquina / Banco', defaultRestSec: 60, notes: 'Ajustar altura do banco para manter tronco ereto.', createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-rosca-martelo', name: 'Rosca Martelo', muscleGroup: 'Braços', equipment: 'Halteres', defaultRestSec: 60, createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-triceps-polia', name: 'Tríceps Corda na Polia', muscleGroup: 'Braços', equipment: 'Polia', defaultRestSec: 60, notes: 'Cotovelos fixos e abdômen firme.', createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-triceps-frances-halter', name: 'Tríceps Francês Sentado', muscleGroup: 'Braços', equipment: 'Halteres', defaultRestSec: 60, notes: 'Sentado com encosto para estabilizar a coluna.', createdAt: SEED_TIMESTAMP_V1 },

  // Pernas
  { id: 'ex-leg-press', name: 'Leg Press 45°', muscleGroup: 'Pernas', equipment: 'Máquina', defaultRestSec: 120, notes: 'Descer apenas até onde o quadril permanece apoiado no banco.', createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-agach-bulgaro', name: 'Agachamento Búlgaro', muscleGroup: 'Pernas', equipment: 'Halteres', defaultRestSec: 90, createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-cadeira-extensora', name: 'Cadeira Extensora', muscleGroup: 'Pernas', equipment: 'Máquina', defaultRestSec: 75, notes: 'Costas firmes no encosto.', createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-cadeira-flexora', name: 'Cadeira Flexora Sentado', muscleGroup: 'Pernas', equipment: 'Máquina', defaultRestSec: 75, notes: 'Maior estabilidade pélvica e lombar.', createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-mesa-flexora', name: 'Mesa Flexora', muscleGroup: 'Pernas', equipment: 'Máquina', defaultRestSec: 75, createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-elevacao-pelvica', name: 'Elevação Pélvica', muscleGroup: 'Pernas', equipment: 'Máquina / Barra', defaultRestSec: 90, notes: 'Foco em glúteos e posterior com menor cisalhamento lombar.', createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-cadeira-abdutora', name: 'Cadeira Abdutora', muscleGroup: 'Pernas', equipment: 'Máquina', defaultRestSec: 60, notes: 'Manter costas apoiadas sem curvar o tronco à frente.', createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-panturrilha-sentado', name: 'Panturrilha Sentado / no Leg Press', muscleGroup: 'Pernas', equipment: 'Máquina', defaultRestSec: 60, notes: 'Evita carga axial direta sobre a coluna.', createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-panturrilha-pe', name: 'Panturrilha em Pé', muscleGroup: 'Pernas', equipment: 'Máquina', defaultRestSec: 60, createdAt: SEED_TIMESTAMP_V1 },
];

export const INITIAL_ROUTINES: Routine[] = [
  {
    id: 'rt-treino-a',
    name: 'Treino A — Peito e Tríceps',
    description: 'Ficha A com foco em estabilidade no banco e controle de amplitude.',
    order: 0,
    updatedAt: SEED_TIMESTAMP_V1,
    exercises: [
      { exerciseId: 'ex-supino-halter', targetSets: 3, targetReps: '8-12', restSec: 90, notes: 'Pés firmes no chão, coluna neutra (ou Supino Máquina)' },
      { exerciseId: 'ex-crucifixo-halter', targetSets: 3, targetReps: '10-12', restSec: 75, notes: 'Amplitude controlada, lombar apoiada no banco' },
      { exerciseId: 'ex-crucifixo-maquina', targetSets: 3, targetReps: '10-12', restSec: 75, notes: 'Voador com costas totalmente apoiadas' },
      { exerciseId: 'ex-supino-inclinado-halter', targetSets: 3, targetReps: '8-12', restSec: 90, notes: 'Banco a 30°, evitar hiperextensão lombar' },
      { exerciseId: 'ex-crossover-polia', targetSets: 3, targetReps: '12-15', restSec: 75, notes: 'De cima para baixo; base alternada e abdômen firme' },
      { exerciseId: 'ex-triceps-polia', targetSets: 3, targetReps: '10-12', restSec: 60, notes: 'Corda na polia; tronco estável sem balançar' },
      { exerciseId: 'ex-triceps-frances-halter', targetSets: 3, targetReps: '10-12', restSec: 60, notes: 'Sentado com encosto (ou Tríceps Testa deitado)' },
    ],
  },
  {
    id: 'rt-treino-b',
    name: 'Treino B — Costas e Bíceps',
    description: 'Ficha B priorizando apoio de tronco para reduzir sobrecarga lombar.',
    order: 1,
    updatedAt: SEED_TIMESTAMP_V1,
    exercises: [
      { exerciseId: 'ex-puxada-alta', targetSets: 3, targetReps: '8-12', restSec: 90, notes: 'Puxada frontal aberta; evitar inclinar demais o tronco' },
      { exerciseId: 'ex-puxada-triangulo', targetSets: 3, targetReps: '8-12', restSec: 90, notes: 'Coluna neutra e retorno controlado' },
      { exerciseId: 'ex-remada-apoiada', targetSets: 3, targetReps: '8-12', restSec: 90, notes: 'Alternativa à Remada Baixa Triângulo: peito apoiado reduz carga lombar' },
      { exerciseId: 'ex-remada-unilateral', targetSets: 3, targetReps: '10-12', restSec: 75, notes: 'Serrote apoiado no banco inclinado; coluna neutra sem girar' },
      { exerciseId: 'ex-rosca-halter', targetSets: 3, targetReps: '10-12', restSec: 60, notes: 'Alternativa à Rosca em pé: sentado com encosto elimina balanço' },
      { exerciseId: 'ex-rosca-scott', targetSets: 3, targetReps: '10-12', restSec: 60, notes: 'Ajustar banco para manter tronco ereto' },
    ],
  },
  {
    id: 'rt-treino-c',
    name: 'Treino C — Pernas e Core',
    description: 'Ficha C adaptada com máquinas estáveis, sem Stiff tradicional e sem carga axial em pé.',
    order: 2,
    updatedAt: SEED_TIMESTAMP_V1,
    exercises: [
      { exerciseId: 'ex-dead-bug', targetSets: 2, targetReps: '10/lado', restSec: 45, notes: 'Ativação de core com lombar apoiada no solo' },
      { exerciseId: 'ex-leg-press', targetSets: 3, targetReps: '10-12', restSec: 120, notes: 'Amplitude controlada: parar antes de o quadril descolar do banco' },
      { exerciseId: 'ex-cadeira-extensora', targetSets: 3, targetReps: '10-15', restSec: 75, notes: 'Costas firmes no encosto' },
      { exerciseId: 'ex-cadeira-flexora', targetSets: 3, targetReps: '10-12', restSec: 75, notes: 'Alternativa ao Flexor Deitado com maior estabilidade lombar' },
      { exerciseId: 'ex-elevacao-pelvica', targetSets: 3, targetReps: '10-12', restSec: 90, notes: 'Substitui Stiff: posterior/glúteos com baixo cisalhamento lombar' },
      { exerciseId: 'ex-cadeira-abdutora', targetSets: 3, targetReps: '12-15', restSec: 60, notes: 'Costas apoiadas, evitar curvar o tronco à frente' },
      { exerciseId: 'ex-panturrilha-sentado', targetSets: 3, targetReps: '12-15', restSec: 60, notes: 'Substitui Panturrilha em pé para evitar carga axial na coluna' },
    ],
  },
  {
    id: 'rt-treino-d',
    name: 'Treino D — Ombros, Trapézio e Core',
    description: 'Ficha D com execução sentada/apoiada para proteger a postura sob carga.',
    order: 3,
    updatedAt: SEED_TIMESTAMP_V1,
    exercises: [
      { exerciseId: 'ex-desenv-halter', targetSets: 3, targetReps: '8-12', restSec: 90, notes: 'Sentado com encosto firme (~75–80°), costelas encaixadas' },
      { exerciseId: 'ex-elevacao-frontal', targetSets: 3, targetReps: '10-12', restSec: 60, notes: 'Sentado com apoio para evitar balanço lombar' },
      { exerciseId: 'ex-elevacao-lateral', targetSets: 3, targetReps: '12-15', restSec: 60, notes: 'Halteres sentado ou em pé com joelhos destravados' },
      { exerciseId: 'ex-elevacao-lateral-cabo', targetSets: 3, targetReps: '12-15', restSec: 60, notes: 'Unilateral no cabo; tronco firme sem inclinar lateralmente' },
      { exerciseId: 'ex-voador-invertido', targetSets: 3, targetReps: '12-15', restSec: 60, notes: 'Peito apoiado no banco, foco em deltoide posterior' },
      { exerciseId: 'ex-encolhimento-apoiado', targetSets: 3, targetReps: '10-12', restSec: 60, notes: 'Alternativa ao Encolhimento em pé: apoiado no banco reduz carga axial' },
      { exerciseId: 'ex-pallof-press', targetSets: 2, targetReps: '10/lado', restSec: 60, notes: 'Estabilidade anti-rotação de core' },
    ],
  },
];

export const INITIAL_FOODS: FoodItem[] = [
  { id: 'fd-frango', name: 'Peito de Frango Grelhado', servingLabel: '100g', servingGrams: 100, calories: 159, protein: 32, carbs: 0, fat: 2.5, createdAt: SEED_TIMESTAMP_V1 },
  { id: 'fd-arroz', name: 'Arroz Branco Cozido', servingLabel: '100g', servingGrams: 100, calories: 128, protein: 2.5, carbs: 28, fat: 0.2, createdAt: SEED_TIMESTAMP_V1 },
  { id: 'fd-feijao', name: 'Feijão Carioca Cozido', servingLabel: '100g', servingGrams: 100, calories: 76, protein: 4.8, carbs: 13.6, fat: 0.5, createdAt: SEED_TIMESTAMP_V1 },
  { id: 'fd-ovo', name: 'Ovo de Galinha Inteiro', servingLabel: '1 unidade (50g)', servingGrams: 50, calories: 74, protein: 6.3, carbs: 0.4, fat: 5.0, createdAt: SEED_TIMESTAMP_V1 },
  { id: 'fd-aveia', name: 'Aveia em Flocos', servingLabel: '30g (2 col. sopa)', servingGrams: 30, calories: 117, protein: 4.2, carbs: 20, fat: 2.1, createdAt: SEED_TIMESTAMP_V1 },
  { id: 'fd-banana', name: 'Banana Prata', servingLabel: '1 unidade média (70g)', servingGrams: 70, calories: 69, protein: 0.9, carbs: 18, fat: 0.1, createdAt: SEED_TIMESTAMP_V1 },
  { id: 'fd-batata-doce', name: 'Batata Doce Cozida', servingLabel: '100g', servingGrams: 100, calories: 77, protein: 0.6, carbs: 18.4, fat: 0.1, createdAt: SEED_TIMESTAMP_V1 },
  { id: 'fd-patinho', name: 'Patinho Moído Grelhado', servingLabel: '100g', servingGrams: 100, calories: 219, protein: 35.9, carbs: 0, fat: 7.3, createdAt: SEED_TIMESTAMP_V1 },
  { id: 'fd-tilapia', name: 'Filé de Tilápia Grelhado', servingLabel: '100g', servingGrams: 100, calories: 128, protein: 26, carbs: 0, fat: 2.7, createdAt: SEED_TIMESTAMP_V1 },
  { id: 'fd-pao-integral', name: 'Pão de Forma Integral', servingLabel: '2 fatias (50g)', servingGrams: 50, calories: 126, protein: 5.0, carbs: 22, fat: 1.8, createdAt: SEED_TIMESTAMP_V1 },
  { id: 'fd-azeite', name: 'Azeite de Oliva Extra Virgem', servingLabel: '1 col. sopa (13g)', servingGrams: 13, calories: 115, protein: 0, carbs: 0, fat: 13, createdAt: SEED_TIMESTAMP_V1 },
  { id: 'fd-whey', name: 'Whey Protein Concentrado', servingLabel: '1 scoop (30g)', servingGrams: 30, calories: 120, protein: 24, carbs: 3.0, fat: 1.5, createdAt: SEED_TIMESTAMP_V1 },
  { id: 'fd-iogurte', name: 'Iogurte Natural Integral', servingLabel: '1 pote (170g)', servingGrams: 170, calories: 104, protein: 6.0, carbs: 7.5, fat: 5.5, createdAt: SEED_TIMESTAMP_V1 },
  { id: 'fd-leite-desnatado', name: 'Leite Desnatado', servingLabel: '200ml', servingGrams: 200, calories: 68, protein: 6.6, carbs: 10, fat: 0.2, createdAt: SEED_TIMESTAMP_V1 },
  { id: 'fd-pasta-amendoim', name: 'Pasta de Amendoim Integral', servingLabel: '1 col. sopa (15g)', servingGrams: 15, calories: 90, protein: 4.0, carbs: 2.5, fat: 7.5, createdAt: SEED_TIMESTAMP_V1 },
  { id: 'fd-queijo-minas', name: 'Queijo Minas Frescal', servingLabel: '30g (1 fatia)', servingGrams: 30, calories: 79, protein: 5.2, carbs: 1.0, fat: 6.1, createdAt: SEED_TIMESTAMP_V1 },
  { id: 'fd-brocolis', name: 'Brócolis Cozido', servingLabel: '100g', servingGrams: 100, calories: 25, protein: 2.1, carbs: 4.4, fat: 0.5, createdAt: SEED_TIMESTAMP_V1 },
  { id: 'fd-maca', name: 'Maçã', servingLabel: '1 unidade média (130g)', servingGrams: 130, calories: 72, protein: 0.4, carbs: 19, fat: 0.2, createdAt: SEED_TIMESTAMP_V1 },
  { id: 'fd-tapioca', name: 'Goma de Tapioca Hidratada', servingLabel: '50g (3 col. sopa)', servingGrams: 50, calories: 120, protein: 0, carbs: 30, fat: 0, createdAt: SEED_TIMESTAMP_V1 },
  { id: 'fd-salmao', name: 'Salmão Grelhado', servingLabel: '100g', servingGrams: 100, calories: 206, protein: 22, carbs: 0, fat: 12.4, createdAt: SEED_TIMESTAMP_V1 },
];

export const INITIAL_GOAL: NutritionGoal = {
  id: 'default',
  calories: 2200,
  protein: 150,
  carbs: 240,
  fat: 70,
  waterMl: 2500,
  updatedAt: SEED_TIMESTAMP_V1,
};

async function upsertMissingCatalogExercises(db: GymLogDB): Promise<void> {
  const existingIds = new Set(await db.exercises.toCollection().primaryKeys());
  const missing = INITIAL_EXERCISES.filter((ex) => !existingIds.has(ex.id));
  if (missing.length > 0) {
    await db.exercises.bulkPut(missing);
  }
}

export async function ensureInitialSeed(db: GymLogDB): Promise<void> {
  const seeded = await db.appMeta.get('seeded');
  const seedVersion = await db.appMeta.get('seedVersion');
  if (seeded?.value === 'true' && seedVersion?.value === CURRENT_SEED_VERSION) {
    return;
  }

  await db.transaction(
    'rw',
    [db.exercises, db.routines, db.foods, db.nutritionGoals, db.appMeta],
    async () => {
      const seededAgain = await db.appMeta.get('seeded');
      const versionAgain = await db.appMeta.get('seedVersion');
      if (seededAgain?.value === 'true' && versionAgain?.value === CURRENT_SEED_VERSION) {
        return;
      }

      if (seededAgain?.value !== 'true') {
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
      } else {
        // Atualização automática de catálogos novos em bancos v1 existentes sem apagar edições
        await upsertMissingCatalogExercises(db);
        const currentRoutines = await db.routines.toArray();
        const isUntouchedV1Default =
          currentRoutines.length === 2 &&
          currentRoutines.every(
            (r) =>
              (r.id === 'rt-treino-a' || r.id === 'rt-treino-b') &&
              r.updatedAt === SEED_TIMESTAMP_V1
          );
        if (isUntouchedV1Default) {
          await db.routines.clear();
          await db.routines.bulkPut(INITIAL_ROUTINES);
        }
      }

      await db.appMeta.put({ key: 'seeded', value: 'true' });
      await db.appMeta.put({ key: 'seedVersion', value: CURRENT_SEED_VERSION });
    }
  );
}

export async function applyStarterRoutinesABCD(db: GymLogDB): Promise<void> {
  await db.transaction('rw', [db.exercises, db.routines, db.appMeta], async () => {
    await upsertMissingCatalogExercises(db);
    await db.routines.clear();
    await db.routines.bulkPut(INITIAL_ROUTINES);
    await db.appMeta.put({ key: 'seeded', value: 'true' });
    await db.appMeta.put({ key: 'seedVersion', value: CURRENT_SEED_VERSION });
  });
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
      } else {
        await db.nutritionGoals.put(INITIAL_GOAL);
      }
      await db.appMeta.put({ key: 'seeded', value: 'true' });
      await db.appMeta.put({ key: 'seedVersion', value: CURRENT_SEED_VERSION });
    }
  );
}
