import type { GymLogDB } from './database';
import type { Exercise, FoodItem, NutritionGoal, Routine } from './types';
import { INITIAL_FOODS, SEED_TIMESTAMP_V1 } from '../data/foodCatalog';

export { INITIAL_FOODS, SEED_TIMESTAMP_V1 };
export const CURRENT_SEED_VERSION = '5';
export const SEED_TIMESTAMP_V4 = '2026-11-23T20:15:00.000Z';

export const INITIAL_EXERCISES: Exercise[] = [
  // Core e estabilidade
  { id: 'ex-prancha', name: 'Prancha Isométrica', muscleGroup: 'Core', equipment: 'Peso corporal', defaultRestSec: 60, notes: 'Manter pelve neutra, glúteos ativos e respiração diafragmática controlada.', createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-dead-bug', name: 'Dead Bug', muscleGroup: 'Core', equipment: 'Peso corporal', defaultRestSec: 45, notes: 'Lombar totalmente apoiada no solo durante toda a execução; interromper extensão antes de arquear.', createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-bird-dog', name: 'Bird-Dog', muscleGroup: 'Core', equipment: 'Peso corporal', defaultRestSec: 60, notes: 'Extensão controlada sem rodar o quadril nem elevar a perna acima da linha do tronco.', createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-pallof-press', name: 'Pallof Press na Polia', muscleGroup: 'Core', equipment: 'Polia', defaultRestSec: 60, notes: 'Estabilidade anti-rotação com tronco firme, glúteos ativos e ombros nivelados.', createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-prancha-lateral', name: 'Prancha Lateral', muscleGroup: 'Core', equipment: 'Peso corporal', defaultRestSec: 60, notes: 'Estabilidade anti-flexão lateral; flexionar joelhos se precisar reduzir a alavanca.', createdAt: SEED_TIMESTAMP_V1 },

  // Peito
  { id: 'ex-supino-halter', name: 'Supino Reto com Halteres', muscleGroup: 'Peito', equipment: 'Halteres', defaultRestSec: 90, notes: 'Pés firmes no chão, lombar neutra (sem arco exagerado) e cotovelos a ~45° para poupar ombros.', createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-crucifixo-halter', name: 'Crucifixo Reto com Halteres', muscleGroup: 'Peito', equipment: 'Halteres', defaultRestSec: 75, notes: 'Amplitude controlada com lombar apoiada no banco e leve flexão fixa de cotovelos.', createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-supino-inclinado-halter', name: 'Supino Inclinado com Halteres', muscleGroup: 'Peito', equipment: 'Halteres', defaultRestSec: 90, notes: 'Banco a 30° mantendo tronco estável e evitando hiperextensão lombar.', createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-supino-maquina', name: 'Supino na Máquina', muscleGroup: 'Peito', equipment: 'Máquina', defaultRestSec: 90, notes: 'Costas totalmente apoiadas, escápulas firmes no encosto e sem travar cotovelos no final.', createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-crucifixo-maquina', name: 'Voador (Peck Deck)', muscleGroup: 'Peito', equipment: 'Máquina', defaultRestSec: 75, notes: 'Costas firmes no encosto; abrir apenas até linha confortável dos ombros sem forçar a cápsula anterior.', createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-crossover-polia', name: 'Crossover (de cima para baixo)', muscleGroup: 'Peito', equipment: 'Polia', defaultRestSec: 75, notes: 'Base alternada e abdômen firme para estabilizar o tronco.', createdAt: SEED_TIMESTAMP_V1 },

  // Costas
  { id: 'ex-puxada-alta', name: 'Puxada Frontal Aberta', muscleGroup: 'Costas', equipment: 'Polia', defaultRestSec: 90, notes: 'Iniciar deprimindo os ombros; evitar inclinar excessivamente o tronco para trás.', createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-puxada-triangulo', name: 'Puxada Triângulo', muscleGroup: 'Costas', equipment: 'Polia', defaultRestSec: 90, notes: 'Pegada neutra confortável para ombros e cotovelos; coluna neutra e retorno controlado.', createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-remada-apoiada', name: 'Remada Apoiada no Banco', muscleGroup: 'Costas', equipment: 'Halteres', defaultRestSec: 90, notes: 'Apoie o peito no banco inclinado e puxe os halteres junto às costelas.', createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-remada-maquina-aberta', name: 'Remada Máquina Aberta', muscleGroup: 'Costas', equipment: 'Máquina', defaultRestSec: 90, notes: 'Pegada pronada aberta. Puxe com os cotovelos afastados e aproxime as escápulas.', createdAt: '2026-11-24T12:00:00.000Z' },
  { id: 'ex-remada-convergente-unilateral', name: 'Remada Convergente Unilateral', muscleGroup: 'Costas', equipment: 'Máquina', defaultRestSec: 75, notes: 'Apoio de peito protege a lombar; puxar um lado por vez sem rodar o tronco nem compensar com o ombro.', createdAt: SEED_TIMESTAMP_V4 },
  { id: 'ex-remada-baixa', name: 'Remada Baixa Triângulo', muscleGroup: 'Costas', equipment: 'Polia', defaultRestSec: 90, notes: 'Manter tronco estável e coluna neutra sem balanço.', createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-remada-unilateral', name: 'Serrote Apoiado no Banco', muscleGroup: 'Costas', equipment: 'Halteres', defaultRestSec: 75, notes: 'Apoiar mão/peito no banco inclinado sem girar a lombar.', createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-face-pull', name: 'Face Pull na Polia', muscleGroup: 'Costas', equipment: 'Polia', defaultRestSec: 60, notes: 'Costelas encaixadas sem inclinar atrás; foco em rotação externa e saúde dos ombros.', createdAt: SEED_TIMESTAMP_V1 },

  // Ombros e Trapézio
  { id: 'ex-desenv-halter', name: 'Desenvolvimento com Halteres', muscleGroup: 'Ombros', equipment: 'Halteres', defaultRestSec: 90, notes: 'Sentado com encosto firme (~75–80°) e costelas encaixadas.', createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-desenv-maquina', name: 'Desenvolvimento na Máquina', muscleGroup: 'Ombros', equipment: 'Máquina', defaultRestSec: 90, notes: 'Costas totalmente apoiadas, costelas encaixadas e cotovelos levemente à frente do tronco para poupar ombros.', createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-elevacao-frontal', name: 'Elevação Frontal Sentado', muscleGroup: 'Ombros', equipment: 'Halteres', defaultRestSec: 60, notes: 'Sentado com encosto para evitar balanço do tronco.', createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-elevacao-lateral', name: 'Elevação Lateral', muscleGroup: 'Ombros', equipment: 'Halteres', defaultRestSec: 60, notes: 'Preferir sentado ou em pé com joelhos destravados; elevar no plano escapular (~30° à frente) até a linha dos ombros.', createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-elevacao-lateral-cabo', name: 'Elevação Unilateral no Cabo', muscleGroup: 'Ombros', equipment: 'Polia', defaultRestSec: 60, notes: 'Tronco firme sem inclinação lateral excessiva.', createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-voador-invertido', name: 'Voador Invertido', muscleGroup: 'Ombros', equipment: 'Máquina', defaultRestSec: 60, notes: 'Peito apoiado no encosto com ombros baixos; focar no deltoide posterior sem usar impulso.', createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-encolhimento-apoiado', name: 'Encolhimento no Banco Inclinado', muscleGroup: 'Ombros', equipment: 'Halteres', defaultRestSec: 60, notes: 'Peito apoiado reduz compressão axial na coluna.', createdAt: SEED_TIMESTAMP_V1 },

  // Braços
  { id: 'ex-rosca-halter', name: 'Rosca Direta Sentado (Banco Inclinado)', muscleGroup: 'Braços', equipment: 'Halteres', defaultRestSec: 60, notes: 'Costas apoiadas eliminam impulso lombar; cotovelos fixos e punhos neutros.', createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-rosca-scott', name: 'Rosca Scott', muscleGroup: 'Braços', equipment: 'Máquina / Banco', defaultRestSec: 60, notes: 'Ajustar altura do banco para manter tronco ereto e controlar o fundo sem tranco no cotovelo.', createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-rosca-martelo', name: 'Rosca Martelo', muscleGroup: 'Braços', equipment: 'Halteres', defaultRestSec: 60, notes: 'Pegada neutra reduz estresse em punhos e cotovelos; preferir sentado com encosto para estabilidade lombar.', createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-triceps-polia', name: 'Tríceps Corda na Polia', muscleGroup: 'Braços', equipment: 'Polia', defaultRestSec: 60, notes: 'Pegada neutra suave para cotovelos; cotovelos fixos ao lado do tronco e abdômen firme.', createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-triceps-testa-halter', name: 'Tríceps Testa com Halteres', muscleGroup: 'Braços', equipment: 'Halteres', defaultRestSec: 60, notes: 'Deitado no banco reto com pés firmes (estabilidade total da coluna); cotovelos apontados para cima sem abrir demais.', createdAt: SEED_TIMESTAMP_V4 },
  { id: 'ex-triceps-frances-halter', name: 'Tríceps Francês Sentado', muscleGroup: 'Braços', equipment: 'Halteres', defaultRestSec: 60, notes: 'Sentado com encosto para estabilizar a coluna; descer apenas até amplitude confortável para ombros e cotovelos.', createdAt: SEED_TIMESTAMP_V1 },

  // Pernas
  { id: 'ex-leg-press', name: 'Leg Press 45°', muscleGroup: 'Pernas', equipment: 'Máquina', defaultRestSec: 120, notes: 'Regra de coluna: parar a descida antes de o quadril/lombar descolar do banco (sem butt wink) e não travar joelhos no topo.', createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-agach-bulgaro', name: 'Agachamento Búlgaro', muscleGroup: 'Pernas', equipment: 'Halteres', defaultRestSec: 90, notes: 'Coluna neutra e joelho da frente alinhado ao pé; baixa carga axial na lombar.', createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-cadeira-extensora', name: 'Cadeira Extensora', muscleGroup: 'Pernas', equipment: 'Máquina', defaultRestSec: 75, notes: 'Costas e quadril firmes no encosto; eixo da máquina alinhado ao joelho sem trancos no topo.', createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-cadeira-flexora', name: 'Cadeira Flexora Sentado', muscleGroup: 'Pernas', equipment: 'Máquina', defaultRestSec: 75, notes: 'Maior estabilidade pélvica e lombar; manter lombar colada no encosto durante toda a série.', createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-mesa-flexora', name: 'Mesa Flexora', muscleGroup: 'Pernas', equipment: 'Máquina', defaultRestSec: 75, notes: 'Manter quadril pressionado contra o banco sem arquear a lombar na flexão.', createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-elevacao-pelvica', name: 'Elevação Pélvica', muscleGroup: 'Pernas', equipment: 'Máquina / Barra', defaultRestSec: 90, notes: 'Foco em glúteos e posterior com baixo cisalhamento lombar; subir em bloco sem hiperextender a lombar.', createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-cadeira-adutora', name: 'Cadeira Adutora', muscleGroup: 'Pernas', equipment: 'Máquina', defaultRestSec: 60, notes: 'Costas apoiadas sem curvar a lombar; controlar a abertura sem trancos nos adutores e virilha.', createdAt: SEED_TIMESTAMP_V4 },
  { id: 'ex-cadeira-abdutora', name: 'Cadeira Abdutora', muscleGroup: 'Pernas', equipment: 'Máquina', defaultRestSec: 60, notes: 'Glúteo médio estabiliza a pelve e protege lombar e joelhos; manter costas apoiadas sem curvar à frente.', createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-panturrilha-sentado', name: 'Panturrilha no Leg Press 180° / Sentado', muscleGroup: 'Pernas', equipment: 'Máquina', defaultRestSec: 60, notes: 'Evita carga axial na coluna; joelhos destravados, pausa de 1s no alongamento sem quicar.', createdAt: SEED_TIMESTAMP_V1 },
  { id: 'ex-panturrilha-pe', name: 'Panturrilha em Pé', muscleGroup: 'Pernas', equipment: 'Máquina', defaultRestSec: 60, notes: 'Abdômen firme e coluna neutra; preferir variação sentada ou no Leg Press se houver sensibilidade lombar.', createdAt: SEED_TIMESTAMP_V1 },
];

export const INITIAL_ROUTINES: Routine[] = [
  {
    id: 'rt-treino-a',
    name: 'Treino A — Superiores 1',
    description: 'Torso 1: alternância empurrar/puxar para desempenho e menor fadiga articular (ombros/cotovelos).',
    order: 0,
    updatedAt: SEED_TIMESTAMP_V4,
    exercises: [
      {
        exerciseId: 'ex-supino-halter',
        targetSets: 3,
        targetReps: '8-12',
        restSec: 90,
        notes: '1º (composto fresco): pés firmes no chão, lombar neutra sem arco exagerado e cotovelos a ~45° para proteger os ombros.',
      },
      {
        exerciseId: 'ex-puxada-alta',
        targetSets: 3,
        targetReps: '8-12',
        restSec: 90,
        notes: 'Alterna para puxada vertical (dá descanso a peito/ombros/tríceps); deprimir escápulas e evitar inclinar demais o tronco.',
      },
      {
        exerciseId: 'ex-desenv-maquina',
        targetSets: 3,
        targetReps: '8-12',
        restSec: 90,
        notes: 'Estabilidade guiada: costas apoiadas, costelas encaixadas (sem arquear a lombar) e cotovelos levemente à frente do tronco.',
      },
      {
        exerciseId: 'ex-remada-apoiada',
        targetSets: 3,
        targetReps: '8-12',
        restSec: 90,
        notes: 'Apoie o peito no banco inclinado e puxe os halteres junto às costelas.',
      },
      {
        exerciseId: 'ex-elevacao-lateral',
        targetSets: 3,
        targetReps: '12-15',
        restSec: 60,
        notes: 'Por último (músculo menor): fazer sentado ou com joelhos destravados no plano escapular (~30° à frente), sem impulso lombar.',
      },
    ],
  },
  {
    id: 'rt-treino-b',
    name: 'Treino B — Inferiores 1 + Braços',
    description: 'Limbs 1 (Torso/Limbs): ativação de core lombar, composto de pernas primeiro e braços com apoio ao final.',
    order: 1,
    updatedAt: SEED_TIMESTAMP_V4,
    exercises: [
      {
        exerciseId: 'ex-dead-bug',
        targetSets: 2,
        targetReps: '10/lado',
        restSec: 45,
        notes: 'Substitui flexão lombar no banco romano: ativa o core profundo protegendo a coluna sem fadigar pernas. Manter lombar colada ao solo.',
      },
      {
        exerciseId: 'ex-leg-press',
        targetSets: 3,
        targetReps: '10-12',
        restSec: 120,
        notes: 'Composto principal primeiro: parar a descida antes de o quadril/lombar descolar do encosto (sem butt wink) e não travar joelhos no topo.',
      },
      {
        exerciseId: 'ex-cadeira-adutora',
        targetSets: 3,
        targetReps: '12-15',
        restSec: 60,
        notes: 'Costas totalmente apoiadas sem curvar a lombar à frente; controlar a abertura sem trancos na virilha/adutores.',
      },
      {
        exerciseId: 'ex-panturrilha-sentado',
        targetSets: 3,
        targetReps: '12-15',
        restSec: 60,
        notes: 'No Leg Press 180° ou sentado (evita carga axial na coluna): joelhos levemente destravados e pausa de 1s no alongamento sem quicar.',
      },
      {
        exerciseId: 'ex-rosca-halter',
        targetSets: 3,
        targetReps: '10-12',
        restSec: 60,
        notes: 'Versão estável da rosca com halteres: costas apoiadas no banco inclinado eliminam impulso lombar; cotovelos fixos.',
      },
      {
        exerciseId: 'ex-triceps-testa-halter',
        targetSets: 3,
        targetReps: '10-12',
        restSec: 60,
        notes: 'Deitado no banco reto com pés firmes (estabilidade total da coluna); cotovelos apontados para cima sem abrir demais para poupar a junta.',
      },
    ],
  },
  {
    id: 'rt-treino-c',
    name: 'Treino C — Superiores 2',
    description: 'Torso 2: equilíbrio empurrar/puxar em máquinas apoiadas, sem elevação frontal redundante.',
    order: 2,
    updatedAt: SEED_TIMESTAMP_V4,
    exercises: [
      {
        exerciseId: 'ex-supino-maquina',
        targetSets: 3,
        targetReps: '8-12',
        restSec: 90,
        notes: '1º (empurrão guiado): costas e escápulas firmes no encosto, ombros baixos sem projetar à frente e sem travar cotovelos.',
      },
      {
        exerciseId: 'ex-remada-convergente-unilateral',
        targetSets: 3,
        targetReps: '10-12/lado',
        restSec: 75,
        notes: 'Alterna para puxada horizontal apoiada (protege a lombar): puxar um lado por vez sem girar o tronco, corrigindo assimetrias.',
      },
      {
        exerciseId: 'ex-crucifixo-maquina',
        targetSets: 3,
        targetReps: '10-12',
        restSec: 75,
        notes: 'Voador peitoral com costas apoiadas; abrir apenas até amplitude confortável dos ombros (sem hiperestender a articulação).',
      },
      {
        exerciseId: 'ex-puxada-triangulo',
        targetSets: 3,
        targetReps: '8-12',
        restSec: 90,
        notes: 'Substitui elevação frontal corda (redundante): equilibra puxadas verticais na semana com pegada neutra suave para ombros e cotovelos.',
      },
      {
        exerciseId: 'ex-voador-invertido',
        targetSets: 3,
        targetReps: '12-15',
        restSec: 60,
        notes: 'Por último (deltoide posterior): peito apoiado e ombros baixos sem impulso; protege a estabilidade articular dos ombros.',
      },
    ],
  },
  {
    id: 'rt-treino-d',
    name: 'Treino D — Inferiores 2 + Braços',
    description: 'Limbs 2: completa posteriores, glúteos, estabilidade pélvica e quadríceps sem carga axial + braços suaves.',
    order: 3,
    updatedAt: SEED_TIMESTAMP_V4,
    exercises: [
      {
        exerciseId: 'ex-pallof-press',
        targetSets: 2,
        targetReps: '10/lado',
        restSec: 60,
        notes: 'Ativação de core anti-rotação para estabilidade pélvica e lombar antes das pernas; manter tronco imóvel e glúteos ativos.',
      },
      {
        exerciseId: 'ex-elevacao-pelvica',
        targetSets: 3,
        targetReps: '10-12',
        restSec: 90,
        notes: 'Composto de cadeia posterior com baixo cisalhamento lombar: subir pelve e tronco em bloco (queixo recolhido), sem hiperextender a lombar.',
      },
      {
        exerciseId: 'ex-cadeira-extensora',
        targetSets: 3,
        targetReps: '10-15',
        restSec: 75,
        notes: '2º estímulo semanal de quadríceps sem compressão na coluna: costas e quadril firmes no banco, eixo alinhado ao joelho.',
      },
      {
        exerciseId: 'ex-cadeira-flexora',
        targetSets: 3,
        targetReps: '10-12',
        restSec: 75,
        notes: 'Isquiotibiais com máxima estabilidade lombar (superior à mesa flexora deitada); manter lombar colada ao encosto.',
      },
      {
        exerciseId: 'ex-cadeira-abdutora',
        targetSets: 3,
        targetReps: '12-15',
        restSec: 60,
        notes: 'Glúteo médio essencial para estabilidade pélvica e proteção lombar e dos joelhos; costas apoiadas sem curvar o tronco à frente.',
      },
      {
        exerciseId: 'ex-rosca-martelo',
        targetSets: 2,
        targetReps: '10-12',
        restSec: 60,
        notes: '2º estímulo moderado (2 séries) em pegada neutra para poupar punhos/cotovelos; executar sentado com encosto para zerar balanço lombar.',
      },
      {
        exerciseId: 'ex-triceps-polia',
        targetSets: 2,
        targetReps: '10-12',
        restSec: 60,
        notes: '2º estímulo moderado (2 séries) com corda em pegada neutra (menor estresse nos cotovelos); cotovelos fixos e abdômen firme.',
      },
    ],
  },
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

async function upsertMissingCatalogExercises(db: GymLogDB, upgradeLegacy = true): Promise<void> {
  const existingExercises = await db.exercises.toArray();
  const existingById = new Map(existingExercises.map((ex) => [ex.id, ex]));
  const toPut: Exercise[] = [];

  for (const catalogEx of INITIAL_EXERCISES) {
    const existing = existingById.get(catalogEx.id);
    if (!existing) {
      toPut.push(catalogEx);
      continue;
    }

    if (catalogEx.id === 'ex-remada-apoiada' && !existing.isCustom) {
      toPut.push({
        ...existing,
        name: existing.name === 'Remada Apoiada no Peito' ? catalogEx.name : existing.name,
        equipment: existing.equipment === 'Máquina' ? catalogEx.equipment : existing.equipment,
        notes: existing.notes === 'Peito firme no apoio elimina cisalhamento lombar; puxar cotovelos sem encolher ombros.' ? catalogEx.notes : existing.notes,
      });
      continue;
    }

    const isUntouchedSeedExercise =
      upgradeLegacy && !existing.isCustom &&
      existing.createdAt === SEED_TIMESTAMP_V1 &&
      (existing.notes !== catalogEx.notes || existing.name !== catalogEx.name);

    if (isUntouchedSeedExercise) {
      toPut.push(catalogEx);
    }
  }

  if (toPut.length > 0) {
    await db.exercises.bulkPut(toPut);
  }
}

async function upsertCatalogFoods(db: GymLogDB): Promise<{ added: number; enriched: number }> {
  const existingFoods = await db.foods.toArray();
  const existingById = new Map(existingFoods.map((item) => [item.id, item]));
  const toPut: FoodItem[] = [];
  let added = 0;
  let enriched = 0;

  for (const catalogFood of INITIAL_FOODS) {
    const existing = existingById.get(catalogFood.id);
    if (!existing) {
      toPut.push(catalogFood);
      added += 1;
      continue;
    }

    const isUntouchedSeedItem =
      !existing.isCustom &&
      existing.createdAt === SEED_TIMESTAMP_V1 &&
      (!existing.category || !existing.source);

    if (isUntouchedSeedItem) {
      toPut.push(catalogFood);
      enriched += 1;
    }
  }

  if (toPut.length > 0) {
    await db.foods.bulkPut(toPut);
  }

  return { added, enriched };
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
        // Atualização automática de catálogos e rotinas padrão intocadas (v1/v2/v3 -> v4) sem apagar edições
        await upsertMissingCatalogExercises(db, versionAgain?.value !== '4');
        if (versionAgain?.value !== '4') {
          await upsertCatalogFoods(db);
        }
        const currentRoutines = await db.routines.toArray();
        for (const routine of currentRoutines) {
          const entry = routine.exercises.find(e => e.exerciseId === 'ex-remada-apoiada' &&
            e.notes === 'Remada máquina aberta com peito apoiado: zero cisalhamento lombar; retrair escápulas sem encolher ombros.');
          if (entry) {
            entry.notes = 'Apoie o peito no banco inclinado e puxe os halteres junto às costelas.';
            await db.routines.put(routine);
          }
        }
        const isUntouchedV1Default =
          currentRoutines.length === 2 &&
          currentRoutines.every(
            (r) =>
              (r.id === 'rt-treino-a' || r.id === 'rt-treino-b') &&
              r.updatedAt === SEED_TIMESTAMP_V1
          );
        const isUntouchedV2V3Default =
          currentRoutines.length === 4 &&
          currentRoutines.every(
            (r) =>
              (r.id === 'rt-treino-a' ||
                r.id === 'rt-treino-b' ||
                r.id === 'rt-treino-c' ||
                r.id === 'rt-treino-d') &&
              r.updatedAt === SEED_TIMESTAMP_V1
          );
        if (isUntouchedV1Default || isUntouchedV2V3Default) {
          await db.routines.clear();
          await db.routines.bulkPut(INITIAL_ROUTINES);
        }
      }

      await db.appMeta.put({ key: 'seeded', value: 'true' });
      await db.appMeta.put({ key: 'seedVersion', value: CURRENT_SEED_VERSION });
    }
  );
}

export async function syncFoodCatalog(
  db: GymLogDB
): Promise<{ added: number; enriched: number }> {
  return db.transaction('rw', [db.foods, db.appMeta], async () => {
    const result = await upsertCatalogFoods(db);
    await db.appMeta.put({ key: 'seeded', value: 'true' });
    await db.appMeta.put({ key: 'seedVersion', value: CURRENT_SEED_VERSION });
    return result;
  });
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
