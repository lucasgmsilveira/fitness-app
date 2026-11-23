import type { GymLogDB } from './database';
import type { BackupPayload } from './types';
import { getLocalDateString } from '../utils/date';

export interface BackupSummary {
  exportedAt: string;
  exercisesCount: number;
  routinesCount: number;
  workoutSessionsCount: number;
  foodsCount: number;
  mealEntriesCount: number;
  dailyCheckinsCount: number;
}

export type BackupParseResult =
  | { ok: true; payload: BackupPayload; summary: BackupSummary }
  | { ok: false; error: string };

export async function exportBackup(db: GymLogDB): Promise<BackupPayload> {
  const [
    exercises,
    routines,
    workoutSessions,
    foods,
    mealEntries,
    nutritionGoals,
    dailyCheckins,
  ] = await Promise.all([
    db.exercises.toArray(),
    db.routines.toArray(),
    db.workoutSessions.toArray(),
    db.foods.toArray(),
    db.mealEntries.toArray(),
    db.nutritionGoals.toArray(),
    db.dailyCheckins.toArray(),
  ]);

  const exportedAt = new Date().toISOString();
  await db.appMeta.put({ key: 'lastBackupAt', value: exportedAt });

  return {
    app: 'gymlog-pwa',
    schemaVersion: 1,
    exportedAt,
    data: {
      exercises,
      routines,
      workoutSessions,
      foods,
      mealEntries,
      nutritionGoals,
      dailyCheckins,
    },
  };
}

export function downloadBackupFile(payload: BackupPayload): string {
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const filename = `gymlog-backup-${getLocalDateString()}.json`;

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 1000);

  return filename;
}

export function parseAndValidateBackup(rawJson: string): BackupParseResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    return { ok: false, error: 'O arquivo selecionado não é um JSON válido.' };
  }

  if (!parsed || typeof parsed !== 'object') {
    return { ok: false, error: 'Estrutura de backup inválida.' };
  }

  const candidate = parsed as Record<string, unknown>;
  if (candidate.app !== 'gymlog-pwa') {
    return {
      ok: false,
      error: 'Este arquivo não pertence ao aplicativo GymLog (campo "app" incompatível).',
    };
  }

  if (candidate.schemaVersion !== 1) {
    return {
      ok: false,
      error: `Versão de backup não suportada: ${String(candidate.schemaVersion)}.`,
    };
  }

  if (!candidate.data || typeof candidate.data !== 'object') {
    return { ok: false, error: 'O campo "data" está ausente ou inválido no backup.' };
  }

  const data = candidate.data as Record<string, unknown>;
  const requiredArrays = [
    'exercises',
    'routines',
    'workoutSessions',
    'foods',
    'mealEntries',
    'nutritionGoals',
    'dailyCheckins',
  ] as const;

  for (const key of requiredArrays) {
    if (!Array.isArray(data[key])) {
      return {
        ok: false,
        error: `Coleção "${key}" ausente ou em formato inválido no arquivo de backup.`,
      };
    }
  }

  const payload = candidate as unknown as BackupPayload;
  const summary: BackupSummary = {
    exportedAt:
      typeof payload.exportedAt === 'string' ? payload.exportedAt : new Date().toISOString(),
    exercisesCount: payload.data.exercises.length,
    routinesCount: payload.data.routines.length,
    workoutSessionsCount: payload.data.workoutSessions.length,
    foodsCount: payload.data.foods.length,
    mealEntriesCount: payload.data.mealEntries.length,
    dailyCheckinsCount: payload.data.dailyCheckins.length,
  };

  return { ok: true, payload, summary };
}

export async function restoreBackup(db: GymLogDB, payload: BackupPayload): Promise<void> {
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
      ]);

      const { data } = payload;
      if (data.exercises.length) await db.exercises.bulkPut(data.exercises);
      if (data.routines.length) await db.routines.bulkPut(data.routines);
      if (data.workoutSessions.length) await db.workoutSessions.bulkPut(data.workoutSessions);
      if (data.foods.length) await db.foods.bulkPut(data.foods);
      if (data.mealEntries.length) await db.mealEntries.bulkPut(data.mealEntries);
      if (data.nutritionGoals.length) await db.nutritionGoals.bulkPut(data.nutritionGoals);
      if (data.dailyCheckins.length) await db.dailyCheckins.bulkPut(data.dailyCheckins);

      await db.appMeta.put({ key: 'seeded', value: 'true' });
      await db.appMeta.put({ key: 'lastRestoreAt', value: new Date().toISOString() });
    }
  );
}
