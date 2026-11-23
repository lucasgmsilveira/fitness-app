import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { GymLogDB } from '../src/db/database';
import { ensureInitialSeed } from '../src/db/seed';
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

describe('Seed, exportação e restauração JSON no IndexedDB', () => {
  it('popula catálogo inicial de forma idempotente', async () => {
    await ensureInitialSeed(testDb);
    const firstCount = await testDb.exercises.count();
    expect(firstCount).toBeGreaterThan(10);

    await ensureInitialSeed(testDb);
    const secondCount = await testDb.exercises.count();
    expect(secondCount).toBe(firstCount);
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

    // Simula alteração local antes da restauração
    await testDb.dailyCheckins.put({
      date: '2026-11-23',
      weightKg: 80,
      updatedAt: '2026-11-23T12:00:00.000Z',
    });
    expect(await testDb.dailyCheckins.count()).toBe(2);

    await restoreBackup(testDb, parsed.payload);

    // Após restauração, apenas o registro do backup deve existir
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
