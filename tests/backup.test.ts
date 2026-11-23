import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { GymLogDB } from '../src/db/database';
import {
  applyStarterRoutinesABCD,
  CURRENT_SEED_VERSION,
  ensureInitialSeed,
  INITIAL_EXERCISES,
  SEED_TIMESTAMP_V1,
} from '../src/db/seed';
import {
  exportBackup,
  parseAndValidateBackup,
  restoreBackup,
} from '../src/db/backup';

let testDb: GymLogDB;

beforeEach(async () => {
  testDb = new GymLogDB(`GymLogTest-${crypto.randomUUID()}`);
  await testDb.open();
});

afterEach(async () => {
  await testDb.delete();
});

describe('Seed A/B/C/D, exportação e restauração JSON no IndexedDB', () => {
  it('popula catálogo completo e as 4 rotinas A/B/C/D de forma idempotente', async () => {
    await ensureInitialSeed(testDb);
    const firstCount = await testDb.exercises.count();
    const routines = await testDb.routines.toArray();
    const version = await testDb.appMeta.get('seedVersion');

    expect(firstCount).toBe(INITIAL_EXERCISES.length);
    expect(routines.map((r) => r.id).sort()).toEqual([
      'rt-treino-a',
      'rt-treino-b',
      'rt-treino-c',
      'rt-treino-d',
    ]);
    expect(version?.value).toBe(CURRENT_SEED_VERSION);

    await ensureInitialSeed(testDb);
    expect(await testDb.exercises.count()).toBe(firstCount);
  });

  it('atualiza banco v1 intocado para rotinas A/B/C/D sem perder dados, e preserva rotinas editadas', async () => {
    // Cenário 1: banco v1 intocado
    await testDb.appMeta.put({ key: 'seeded', value: 'true' });
    await testDb.routines.bulkPut([
      {
        id: 'rt-treino-a',
        name: 'Treino A antigo',
        order: 0,
        updatedAt: SEED_TIMESTAMP_V1,
        exercises: [],
      },
      {
        id: 'rt-treino-b',
        name: 'Treino B antigo',
        order: 1,
        updatedAt: SEED_TIMESTAMP_V1,
        exercises: [],
      },
    ]);

    await ensureInitialSeed(testDb);
    const upgradedRoutines = await testDb.routines.toArray();
    expect(upgradedRoutines).toHaveLength(4);
    expect(await testDb.exercises.count()).toBe(INITIAL_EXERCISES.length);

    // Cenário 2: banco com rotina personalizada + sessão registrada
    await testDb.appMeta.delete('seedVersion');
    await testDb.routines.clear();
    await testDb.routines.put({
      id: 'rt-custom',
      name: 'Minha Rotina Custom',
      order: 0,
      updatedAt: '2026-11-22T20:00:00.000Z',
      exercises: [],
    });
    await testDb.workoutSessions.put({
      id: 'ws-1',
      routineName: 'Minha Rotina Custom',
      status: 'completed',
      date: '2026-11-22',
      startedAt: '2026-11-22T18:00:00.000Z',
      durationSec: 1800,
      exercises: [],
      totalVolumeKg: 1000,
      totalReps: 50,
      totalSets: 5,
      lumbarScore: 0,
    });

    await ensureInitialSeed(testDb);
    const preservedRoutines = await testDb.routines.toArray();
    expect(preservedRoutines).toHaveLength(1);
    expect(preservedRoutines[0].id).toBe('rt-custom');

    // applyStarterRoutinesABCD carrega as 4 rotinas mantendo histórico
    await applyStarterRoutinesABCD(testDb);
    expect(await testDb.routines.count()).toBe(4);
    expect(await testDb.workoutSessions.count()).toBe(1);
  });

  it('exporta, valida e restaura dados substituindo registros anteriores atomicamente', async () => {
    await ensureInitialSeed(testDb);

    await testDb.dailyCheckins.put({
      date: '2026-11-22',
      weightKg: 71.4,
      lumbarScore: 1,
      updatedAt: '2026-11-22T12:00:00.000Z',
    });

    const exported = await exportBackup(testDb);
    const rawJson = JSON.stringify(exported);

    const parsed = parseAndValidateBackup(rawJson);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    expect(parsed.summary.dailyCheckinsCount).toBe(1);

    await testDb.dailyCheckins.put({
      date: '2026-11-23',
      weightKg: 80,
      updatedAt: '2026-11-23T12:00:00.000Z',
    });
    expect(await testDb.dailyCheckins.count()).toBe(2);

    await restoreBackup(testDb, parsed.payload);

    const checkins = await testDb.dailyCheckins.toArray();
    expect(checkins).toHaveLength(1);
    expect(checkins[0].weightKg).toBe(71.4);
  });

  it('rejeita JSON inválido, app incompatível ou schemaVersion desconhecida', () => {
    expect(parseAndValidateBackup('não é json').ok).toBe(false);
    expect(
      parseAndValidateBackup(JSON.stringify({ app: 'outro', schemaVersion: 1, data: {} })).ok
    ).toBe(false);
    expect(
      parseAndValidateBackup(
        JSON.stringify({ app: 'gymlog-pwa', schemaVersion: 99, data: {} })
      ).ok
    ).toBe(false);
  });
});
